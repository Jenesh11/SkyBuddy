import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { WeatherStats } from './components/WeatherStats';
import { CharacterDisplay } from './components/CharacterDisplay';
import { SearchBar } from './components/SearchBar';
import { InteractionButtons } from './components/InteractionButtons';
import { WeatherInsights } from './components/WeatherInsights';

import {
  WeatherData,
  PersonalityProfile,
  PersonalityType,
  ForecastData,
  AirQualityData
} from './types';

import { PERSONALITIES } from './constants';
import {
  determinePersonality,
  fetchWeather,
  getUserLocation,
  getWeatherByCity,
  fetchWeatherByCoords,
  fetchForecast,
  fetchAirQuality
} from './services/weatherService';

import {
  generateCharacterImage,
  generateCharacterResponse
} from './services/geminiService';

import { getInstantNpcResponse } from './utils/staticResponses';


/* 🌙 NIGHT MODE */
const hour = new Date().getHours();
const isNightGlobal = hour < 6 || hour > 18;


const App: React.FC = () => {

  /* GLOBAL STATE */
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [aqi, setAqi] = useState<AirQualityData | null>(null);

  const [personality, setPersonality] = useState<PersonalityProfile>(
    PERSONALITIES[PersonalityType.DEFAULT]
  );

  const [npcMessage, setNpcMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  /* CHARACTER IMAGE — FIXED (stores personality type) */
  const [characterImage, setCharacterImage] = useState<{
    url: string | null;
    personalityType: string | null;
  }>({
    url: null,
    personalityType: null
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);


  /* AQI → NPC reaction logic */
  const getAqiReaction = (val: number) => {
    switch (val) {
      case 1: return "Wow, today’s air feels clean 🌿 Perfect day!";
      case 2: return "Air is decent today. Enjoy it! 🙂";
      case 3: return "Air quality is okay... 😐";
      case 4: return "Air is dusty today... be careful 😷";
      case 5: return "Air is terrible… stay inside ☠️";
      default: return "";
    }
  };


  /* APP STATE UPDATER */
  const updateAppState = async (
    data: WeatherData,
    isInitial: boolean = false,
    npcOverride?: string
  ) => {

    setWeather(data);

    const forecastData = await fetchForecast(data.city);
    setForecast(forecastData);

    let aqiData = null;
    if (data.lat && data.lon) {
      aqiData = await fetchAirQuality(data.lat, data.lon);
      setAqi(aqiData);
    }

    const type = determinePersonality(data);
    const newPersonality = PERSONALITIES[type];

    // Only reset image if personality CHANGES
    setPersonality(prev => {
      if (prev.type !== newPersonality.type) {
        setCharacterImage({ url: null, personalityType: null });
      }
      return newPersonality;
    });

    // 1. Initial greeting
    if (isInitial) {
      setNpcMessage("Hey! I’m your SkyBuddy ☁️ Let’s check today’s weather!");
      return;
    }

    // 2. Provided override message
    if (npcOverride) {
      setNpcMessage(npcOverride);
      return;
    }

    // 3. Fallback personality greeting
    let finalMessage = newPersonality.greeting;

    // 4. Use AI if key available
    if (process.env.API_KEY) {
      try {
        const smart = await generateCharacterResponse(
          "Give greeting + outfit advice.",
          newPersonality,
          data
        );
        finalMessage = smart;
      } catch { }
    }

    // 5. AQI override (priority)
    if (aqiData && aqiData.aqi >= 4) {
      finalMessage = getAqiReaction(aqiData.aqi);
    }

    setNpcMessage(finalMessage);
  };


  /* QUICK BUTTONS (Outfit / Mood / Tip) */
  const handleNPC = (type: 'outfit' | 'mood' | 'tip') => {
    if (!weather) return;
    setNpcMessage(getInstantNpcResponse(type, weather.condition));
  };


  /* CHARACTER IMAGE LOADING — FIXED VERSION */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Already have image for this personality → don't regenerate
      if (
        characterImage.url &&
        characterImage.personalityType === personality.type
      ) {
        return;
      }

      setIsGeneratingImage(true);

      try {
        const img = await generateCharacterImage(personality.imagePrompt);
        if (!cancelled && img) {
          setCharacterImage({
            url: img,
            personalityType: personality.type
          });
        }
      } catch (err) {
        console.error("Image load error:", err);
      } finally {
        if (!cancelled) setIsGeneratingImage(false);
      }
    };

    load();
    return () => { cancelled = true };
  }, [personality]);



  /* INITIAL WEATHER */
  useEffect(() => {
    if (!process.env.API_KEY) setApiKeyMissing(true);

    const initWeather = async () => {
      try {
        setLoading(true);
        const loc = await getUserLocation();
        const data = await fetchWeather(loc);
        await updateAppState(data, true);
      } catch {
        setError("Could not load weather data. Check connection.");
      } finally {
        setLoading(false);
      }
    };

    initWeather();
  }, []);



  /* SEARCH HANDLER */
  const handleSearch = async (cityOrCoords: any, displayName?: string) => {
    try {
      setLoading(true);

      let data: WeatherData;
      let msg = "";

      if (typeof cityOrCoords === "string") {
        data = await getWeatherByCity(cityOrCoords);
        msg = `Checking ${data.city}… 🏙️`;
      } else {
        data = await fetchWeatherByCoords(cityOrCoords.lat, cityOrCoords.lon);

        if (displayName === "Current Location")
          msg = "Finding your sky… 🌤️";
        else if (displayName)
          msg = `Now checking ${displayName}… 🌆`;
      }

      await updateAppState(data, false, msg);

    } finally {
      setLoading(false);
    }
  };



  /* LOADING SCREEN */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="animate-pulse">Connecting to SkyBuddy...</p>
        </div>
      </div>
    );
  }


  /* ERROR SCREEN */
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Connection Lost</h1>
          <p className="opacity-75">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white text-slate-900 rounded-full hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }



  /* MAIN UI */
  return (
    <div className="relative flex flex-col min-h-screen w-full font-sans overflow-x-hidden">

      {apiKeyMissing && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-xs p-1 text-center z-[100]">
          Demo Mode: AI features limited.
        </div>
      )}

      {/* BACKGROUND */}
      <Background personality={personality} isNight={isNightGlobal} />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center flex-grow p-4 gap-4">

        {/* BRANDING */}
        <div className="flex flex-col items-center justify-center mt-2 mb-2 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight mb-1 opacity-95">
            SkyBuddy
          </h1>
          <p className="text-white/80 text-sm md:text-base font-semibold drop-shadow-sm tracking-wide">
            Your Personal Weather Friend
          </p>
        </div>

        {/* SEARCH + WEATHER STATS */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
          <SearchBar onSearch={handleSearch} personality={personality} isNight={isNightGlobal} />
          <WeatherStats weather={weather} personality={personality} isNight={isNightGlobal} />
        </div>

        {/* CHARACTER + NPC MESSAGE */}
        <div className="w-full flex-grow flex flex-col items-center justify-center mt-6">
          <CharacterDisplay
            personality={personality}
            latestMessage={npcMessage}
            characterImageUrl={characterImage.url}
            isGeneratingImage={isGeneratingImage}
            isNight={isNightGlobal}
          />

          <InteractionButtons
            personality={personality}
            onInteraction={handleNPC}
            isNight={isNightGlobal}
          />
        </div>

        {/* FORECAST + AIR QUALITY */}
        {forecast && (
          <WeatherInsights
            forecast={forecast}
            personality={personality}
            aqi={aqi}
            isNight={isNightGlobal}
          />
        )}

      </div>
    </div>
  );
};

export default App;
