import React from 'react';
import { WeatherData, PersonalityProfile } from '../types';

interface WeatherStatsProps {
  weather: WeatherData;
  personality: PersonalityProfile;
}

export const WeatherStats: React.FC<WeatherStatsProps> = ({ weather, personality }) => {

  // Detect night time (same logic as background)
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;

  return (
    <div className={`
      relative z-10
      w-[90%] mx-auto mt-5 md:mt-0 md:w-64 md:mx-0
      p-4 rounded-3xl backdrop-blur-xl transition-all duration-500 shadow-lg pointer-events-auto

      ${isNight 
        ? "bg-white/5 border border-white/10 text-white" 
        : `${personality.colors.accent} ${personality.colors.text} border border-white/20`
      }
    `}>
      
      {/* Header Row */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold truncate pr-2">{weather.city}</h2>

        <span className="text-xs font-semibold uppercase opacity-70 flex items-center gap-1 shrink-0">
          {weather.icon && (
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.condition}
              className="w-8 h-8 -my-2"
            />
          )}
          {weather.condition}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-black tracking-tighter">{weather.temp}°</p>
          <p className={`text-xs opacity-75 ${isNight ? "text-white/70" : ""}`}>Temp</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">{weather.humidity}%</p>
          <p className={`text-xs opacity-75 ${isNight ? "text-white/70" : ""}`}>Humidity</p>
        </div>

        <div>
          <p className="text-lg font-bold">
            {weather.wind} <span className="text-xs font-normal">m/s</span>
          </p>
          <p className={`text-xs opacity-75 ${isNight ? "text-white/70" : ""}`}>Wind</p>
        </div>
      </div>

    </div>
  );
};
