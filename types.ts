
// Weather Data Structure
export interface WeatherData {
  city: string;
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  conditionCode: number; // Kept for accurate personality mapping
  icon: string;
  lat?: number;
  lon?: number;
}

// Forecast Data Structures
export interface HourlyForecast {
  time: string;
  temp: number;
  humidity: number;
  wind: number;
}

export interface DailyForecast {
  day: string;
  min: number;
  max: number;
  condition: string;
  icon: string;
}

export interface ForecastData {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

// Air Quality Data Structure
export interface AirQualityData {
  aqi: number; // 1-5
  components: {
    co: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
  };
  forecast: {
    time: string;
    aqi: number;
  }[];
}

// Personality Enum
export enum PersonalityType {
  SUNNY = 'SUNNY',
  RAINY = 'RAINY',
  STORMY = 'STORMY',
  FOGGY = 'FOGGY',
  WINDY = 'WINDY',
  COLD = 'COLD',
  DEFAULT = 'DEFAULT'
}

// Personality Definition
export interface PersonalityProfile {
  type: PersonalityType;
  name: string;
  emoji: string;
  colors: {
    bgFrom: string;
    bgTo: string;
    text: string;
    accent: string;
  };
  animationClass: string;
  systemPrompt: string;
  greeting: string;
  imagePrompt: string; // Prompt for generating the character image
}

// Chat Messages
export interface ChatMessage {
  id: string;
  sender: 'user' | 'npc';
  text: string;
  timestamp: number;
}
