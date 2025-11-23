import React from 'react';
import { AirQualityData } from '../types';

interface AirQualityPanelProps {
  data: AirQualityData;
}

// Helper to calculate US AQI from PM2.5 concentration (Standard Formula)
const calculateUSAQI = (pm25: number): number => {
  const c = Math.round(pm25 * 10) / 10;
  if (c <= 12.0) return Math.round(((50 - 0) / (12.0 - 0)) * (c - 0) + 0);
  if (c <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51);
  if (c <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101);
  if (c <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151);
  if (c <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201);
  if (c <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (c - 250.5) + 301);
  return 500; // Hazardous
};

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "bg-green-400", text: "text-green-800", gradient: "from-green-200 to-green-400" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-400", text: "text-yellow-800", gradient: "from-yellow-200 to-yellow-400" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", shortLabel: "Poor", color: "bg-orange-400", text: "text-orange-900", gradient: "from-orange-200 to-orange-400" };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", text: "text-red-900", gradient: "from-red-300 to-red-500" };
  if (aqi <= 300) return { label: "Very Unhealthy", shortLabel: "Severe", color: "bg-purple-500", text: "text-purple-100", gradient: "from-purple-300 to-purple-500" };
  return { label: "Hazardous", color: "bg-rose-900", text: "text-rose-100", gradient: "from-rose-700 to-rose-900" };
};

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({ data }) => {
  // Calculate real 0-500 AQI based on PM2.5
  const usAqi = calculateUSAQI(data.components.pm2_5);
  const status = getAQIStatus(usAqi);

  // Position for the bar indicator (clamped 0-100%)
  const barPercent = Math.min(Math.max((usAqi / 350) * 100, 0), 100);

  return (
    <div className="w-full bg-white/40 backdrop-blur-lg rounded-[2rem] p-6 shadow-2xl border border-white/30 animate-float" style={{ animationDuration: '10s' }}>
      
      {/* Header: Live Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.color}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${status.color}`}></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Live AQI</h3>
      </div>

      {/* Main Display: Number + Status */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <div>
          <div className={`text-6xl md:text-7xl font-black tracking-tighter ${status.text} opacity-90`}>
            {usAqi}
          </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Air Quality Is</p>
            <div className={`text-2xl md:text-3xl font-bold ${status.text}`}>
              {status.shortLabel || status.label}
            </div>
        </div>
      </div>

      {/* Pollutants: PM10 & PM2.5 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-white/50 rounded-2xl p-4 shadow-sm border border-white/20">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">PM10</p>
            <p className="text-xl font-bold text-gray-700">{Math.round(data.components.pm10)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
         </div>
         <div className="bg-white/50 rounded-2xl p-4 shadow-sm border border-white/20">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">PM2.5</p>
            <p className="text-xl font-bold text-gray-700">{Math.round(data.components.pm2_5)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
         </div>
      </div>

      {/* AQI Scale Bar */}
      <div className="relative pt-6 pb-2">
         {/* The Gradient Bar */}
         <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 via-red-500 via-purple-500 to-rose-900 shadow-inner opacity-90"></div>
         
         {/* The Indicator Dot */}
         <div 
            className="absolute top-4 w-8 h-8 -ml-4 bg-white border-4 border-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ left: `${barPercent}%` }}
         >
             <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
         </div>

         {/* Scale Labels */}
         <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
             <span>Good</span>
             <span className="hidden sm:inline">Moderate</span>
             <span className="hidden sm:inline">Poor</span>
             <span>Unhealthy</span>
             <span className="hidden sm:inline">Severe</span>
             <span>Hazardous</span>
         </div>
         <div className="flex justify-between text-[9px] font-medium text-gray-300 mt-1">
             <span>0</span>
             <span>50</span>
             <span>100</span>
             <span>150</span>
             <span>200</span>
             <span>300+</span>
         </div>
      </div>

    </div>
  );
};
