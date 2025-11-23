import { WeatherData, PersonalityType, ForecastData, HourlyForecast, DailyForecast, AirQualityData } from '../types';

// Try to use env var, otherwise fall back to the provided key (which might be rate limited)
const OWM_API_KEY = process.env.REACT_APP_OWM_API_KEY || '271a50989ce0a3cee361398f34c6f339'; 

interface LocationData {
  city: string;
  lat: number;
  lon: number;
}

export interface CitySuggestion {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * Detects user location via IP. 
 * Tries primary provider, falls back to secondary if rate-limited.
 */
export const getUserLocation = async (): Promise<LocationData> => {
  try {
    // Primary: ipapi.co
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
        const data = await response.json();
        if (data.city && data.latitude) {
            return {
                city: data.city,
                lat: data.latitude,
                lon: data.longitude
            };
        }
    }
    throw new Error("Primary IP API failed");
  } catch (error) {
    console.warn("Primary IP Geolocation failed, trying backup:", error);
    try {
        // Backup: geojs.io (more lenient rate limits)
        const backup = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (!backup.ok) throw new Error("Backup Geo API failed");
        const data = await backup.json();
        return {
            city: data.city || 'London',
            lat: parseFloat(data.latitude),
            lon: parseFloat(data.longitude)
        };
    } catch (finalError) {
        console.warn("All Geo APIs failed, defaulting to London");
        return { city: 'London', lat: 51.5074, lon: -0.1278 };
    }
  }
};

/**
 * Maps OWM API response to WeatherData
 */
const mapOwmData = (data: any): WeatherData => {
  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    humidity: data.main.humidity,
    wind: data.wind.speed,
    condition: data.weather[0].main.toLowerCase(),
    conditionCode: data.weather[0].id,
    icon: data.weather[0].icon,
    lat: data.coord ? data.coord.lat : 0,
    lon: data.coord ? data.coord.lon : 0,
  };
};

/**
 * Fetches weather from Open-Meteo (Fallback)
 */
const fetchOpenMeteo = async (lat: number, lon: number, cityName: string): Promise<WeatherData> => {
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`;
    
    const omResponse = await fetch(omUrl);
    if (!omResponse.ok) {
        throw new Error("All weather services unavailable.");
    }
    
    const omData = await omResponse.json();
    const current = omData.current;
    
    const wmoCode = current.weather_code;
    const conditionCode = mapWmoToOwm(wmoCode);
    
    return {
      city: cityName,
      temp: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      condition: getConditionLabel(wmoCode),
      conditionCode: conditionCode,
      icon: getIconForWmo(wmoCode),
      lat: lat,
      lon: lon
    };
};

/**
 * Fetches real weather data based on LocationData (IP detected).
 */
export const fetchWeather = async (location: LocationData): Promise<WeatherData> => {
  return fetchWeatherByCoords(location.lat, location.lon, location.city);
};

/**
 * Fetches weather data using specific Coordinates.
 */
export const fetchWeatherByCoords = async (lat: number, lon: number, cityNameOverride?: string): Promise<WeatherData> => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OWM API error: ${response.status}`);
    }

    const data = await response.json();
    return mapOwmData(data);

  } catch (error) {
    console.warn("OWM Coords failed, switching to Open-Meteo fallback:", error);
    // Use override name or default to "Unknown Location" if reverse geocoding isn't done here
    return fetchOpenMeteo(lat, lon, cityNameOverride || "Local Weather");
  }
};

/**
 * Fetches City Suggestions for Autocomplete
 */
export const fetchCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (error) {
    console.error("Autocomplete fetch failed", error);
    return [];
  }
};

/**
 * Fetches weather data by City Name (Legacy/Direct Search).
 */
export const getWeatherByCity = async (cityQuery: string): Promise<WeatherData> => {
    // 1. Try OpenWeatherMap Direct Search
    try {
        const encodedCity = encodeURIComponent(cityQuery);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${OWM_API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
           throw new Error("OWM Search failed");
        }
        
        const data = await response.json();
        return mapOwmData(data);

    } catch (error) {
        console.warn("OWM Search failed, trying Open-Meteo Geocoding:", error);
        
        // 2. Fallback: Geocode then fetch Open-Meteo
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }
            
            const { latitude, longitude, name } = geoData.results[0];
            return await fetchOpenMeteo(latitude, longitude, name);
            
        } catch (geoError) {
            throw new Error("Could not find city. Please check spelling.");
        }
    }
};

/**
 * Fetches Forecast Data (Hourly + Daily)
 */
export const fetchForecast = async (city: string): Promise<ForecastData | null> => {
  try {
    const encodedCity = encodeURIComponent(city);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${OWM_API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Process Hourly (Next 8 intervals ~ 24h)
    const hourly: HourlyForecast[] = data.list.slice(0, 9).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      wind: item.wind.speed
    }));

    // Process Daily (Group by date)
    const dailyMap = new Map<string, { min: number; max: number; icon: string; condition: string; count: number }>();

    data.list.forEach((item: any) => {
       const date = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
       const temp = Math.round(item.main.temp);
       
       if (!dailyMap.has(date)) {
         dailyMap.set(date, {
           min: temp,
           max: temp,
           icon: item.weather[0].icon,
           condition: item.weather[0].main,
           count: 1
         });
       } else {
         const current = dailyMap.get(date)!;
         current.min = Math.min(current.min, temp);
         current.max = Math.max(current.max, temp);
         // Grab icon from midday (roughly)
         if (item.dt_txt.includes("12:00:00")) {
            current.icon = item.weather[0].icon;
            current.condition = item.weather[0].main;
         }
         dailyMap.set(date, current);
       }
    });

    const daily: DailyForecast[] = Array.from(dailyMap.entries()).slice(0, 7).map(([day, stats]) => ({
      day,
      min: stats.min,
      max: stats.max,
      condition: stats.condition,
      icon: stats.icon
    }));

    return { hourly, daily };

  } catch (error) {
    console.error("Failed to fetch forecast", error);
    return null;
  }
};

/**
 * Fetches Air Quality Data (Current + Trend)
 */
export const fetchAirQuality = async (lat: number, lon: number): Promise<AirQualityData | null> => {
  try {
    // 1. Fetch Current Pollution
    const currentUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) throw new Error("AQI Current Failed");
    const currentData = await currentRes.json();
    
    // 2. Fetch Forecast Pollution (for trend)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;

    // Process Forecast (Next 12 hours)
    const forecast = forecastData 
      ? forecastData.list.slice(0, 12).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric' }),
          aqi: item.main.aqi
        }))
      : [];

    return {
      aqi: currentData.list[0].main.aqi,
      components: currentData.list[0].components,
      forecast: forecast
    };
  } catch (error) {
    console.warn("Failed to fetch AQI", error);
    return null;
  }
};


// --- Helpers to map Open-Meteo codes to OpenWeatherMap style ---

const mapWmoToOwm = (wmoCode: number): number => {
  if (wmoCode === 0) return 800; // Clear
  if (wmoCode <= 3) return 802; // Clouds
  if (wmoCode <= 48) return 741; // Fog
  if (wmoCode <= 67) return 500; // Rain
  if (wmoCode <= 77) return 600; // Snow
  if (wmoCode <= 82) return 520; // Showers
  if (wmoCode <= 99) return 211; // Thunder
  return 800;
};

const getConditionLabel = (wmoCode: number): string => {
    if (wmoCode === 0) return "clear";
    if (wmoCode <= 3) return "clouds";
    if (wmoCode <= 48) return "fog";
    if (wmoCode <= 67) return "rain";
    if (wmoCode <= 77) return "snow";
    if (wmoCode <= 99) return "storm";
    return "clear";
};

const getIconForWmo = (code: number): string => {
   if (code === 0) return '01d';
   if (code <= 3) return '03d';
   if (code <= 48) return '50d';
   if (code <= 67) return '10d';
   if (code <= 77) return '13d';
   if (code <= 82) return '09d';
   if (code <= 99) return '11d';
   return '03d';
};

export const determinePersonality = (weather: WeatherData): PersonalityType => {
  const { conditionCode, temp, wind } = weather;

  // 1. Extreme Wind override
  if (wind > 10) return PersonalityType.WINDY;

  // 2. Thunderstorm
  if (conditionCode >= 200 && conditionCode < 300) return PersonalityType.STORMY;

  // 3. Drizzle or Rain
  if (conditionCode >= 300 && conditionCode < 600) return PersonalityType.RAINY;

  // 4. Snow or Freezing Temp
  if ((conditionCode >= 600 && conditionCode < 700) || temp < 5) return PersonalityType.COLD;

  // 5. Atmosphere (Fog, Mist, etc)
  if (conditionCode >= 700 && conditionCode < 800) return PersonalityType.FOGGY;

  // 6. Clear Sky
  if (conditionCode === 800) return PersonalityType.SUNNY;

  // 7. Clouds
  if (conditionCode > 800) return PersonalityType.DEFAULT;

  return PersonalityType.DEFAULT;
};