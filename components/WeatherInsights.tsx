import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ForecastData, PersonalityProfile, PersonalityType, AirQualityData } from '../types';
import { AirQualityPanel } from './AirQualityPanel';

interface WeatherInsightsProps {
  forecast: ForecastData;
  personality: PersonalityProfile;
  aqi: AirQualityData | null;
}

export const WeatherInsights: React.FC<WeatherInsightsProps> = ({ forecast, personality, aqi }) => {
  
  // Dynamic color helper based on personality
  const getGraphColor = () => {
      switch(personality.type) {
          case PersonalityType.SUNNY: return '#F59E0B'; // Amber
          case PersonalityType.RAINY: return '#60A5FA'; // Blue
          case PersonalityType.STORMY: return '#8B5CF6'; // Purple
          case PersonalityType.FOGGY: return '#9CA3AF'; // Gray
          case PersonalityType.WINDY: return '#14B8A6'; // Teal
          case PersonalityType.COLD: return '#38BDF8'; // Sky
          default: return '#94A3B8'; // Slate
      }
  };

  const graphColor = getGraphColor();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/20 text-xs text-gray-700">
          <p className="font-bold">{label}</p>
          <p>{payload[0].value}{payload[0].unit || ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-20 px-4 space-y-6 animate-float" style={{ animationDuration: '8s' }}>
      
      {/* Section Header */}
      <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className={`px-4 text-sm font-semibold tracking-wider uppercase ${personality.colors.text} bg-white/30 backdrop-blur-md rounded-full shadow-sm`}>
              Weather Insights
            </span>
          </div>
      </div>

      {/* 0. AQI Panel (New) */}
      {aqi && <AirQualityPanel data={aqi} />}

      {/* 1. Hourly Temp Graph */}
      <div className="w-full bg-white/30 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/20">
         <h3 className={`text-sm font-bold mb-4 ${personality.colors.text} opacity-80 uppercase tracking-wide`}>Hourly Temperature</h3>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.hourly}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={graphColor} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={graphColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#4B5563' }} 
                        interval={1}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="temp" 
                        unit="°"
                        stroke={graphColor} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTemp)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 2. Mini Graphs (Humidity & Wind) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Humidity */}
          <div className="bg-white/30 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border border-white/20">
             <div className="flex justify-between items-center mb-2">
                 <h4 className="text-xs font-bold text-blue-800 uppercase">Humidity</h4>
                 <span className="text-xl font-black text-blue-900">{forecast.hourly[0]?.humidity}%</span>
             </div>
             <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast.hourly}>
                        <Line type="monotone" dataKey="humidity" stroke="#60A5FA" strokeWidth={3} dot={false} />
                        <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Wind */}
          <div className="bg-white/30 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border border-white/20">
             <div className="flex justify-between items-center mb-2">
                 <h4 className="text-xs font-bold text-teal-800 uppercase">Wind</h4>
                 <span className="text-xl font-black text-teal-900">{forecast.hourly[0]?.wind} m/s</span>
             </div>
             <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast.hourly}>
                         <defs>
                            <linearGradient id="windGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#2DD4BF" />
                                <stop offset="100%" stopColor="#14B8A6" />
                            </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="wind" stroke="url(#windGrad)" strokeWidth={3} dot={false} />
                        <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* 3. 7-Day Forecast Table */}
      <div className="bg-white/40 backdrop-blur-lg rounded-[2rem] p-6 shadow-2xl border border-white/30">
        <h3 className={`text-sm font-bold mb-4 ${personality.colors.text} opacity-80 uppercase tracking-wide`}>7-Day Forecast</h3>
        <div className="flex flex-col gap-3">
            {forecast.daily.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors">
                    <span className="w-12 font-bold text-gray-700">{day.day}</span>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                         <img 
                            src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                            alt={day.condition} 
                            className="w-8 h-8"
                        />
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">{day.condition}</span>
                    </div>
                    <div className="flex gap-3 text-sm font-bold w-24 justify-end">
                        <span className="text-gray-800">{Math.round(day.max)}°</span>
                        <span className="text-gray-400">{Math.round(day.min)}°</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};
