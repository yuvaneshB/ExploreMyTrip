import React from 'react';
import useWeather from '../hooks/useWeather.js';
import { CloudRain, Wind, Droplets, Eye, Sunrise, Sunset } from 'lucide-react';

export const WeatherCard = ({ latitude, longitude, cityName = 'Destination' }) => {
  const { weather, loading, error } = useWeather(latitude, longitude);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse space-y-4 font-sans">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-400 italic font-sans">
        Weather information unavailable for this location.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm font-sans space-y-6 w-full">
      {/* City Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Weather Forecast</h4>
          <span className="text-[10px] text-slate-400 block font-semibold">{cityName} coordinates</span>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full uppercase">
          Live Status
        </span>
      </div>

      {/* Main Info */}
      <div className="flex items-center gap-5">
        <span className="text-4xl filter drop-shadow-md select-none">{weather.conditionIcon}</span>
        <div>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-extrabold text-slate-800">{Math.round(weather.temperature)}°C</strong>
            {weather.feelsLike !== undefined && (
              <span className="text-[10px] text-slate-400 font-bold">Feels {Math.round(weather.feelsLike)}°</span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-semibold block mt-0.5">{weather.conditionText}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3.5 text-xs">
        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-sky-500 font-sans" />
          <div>
            <span className="text-[10px] text-slate-400 block">Humidity</span>
            <strong className="text-slate-700 font-bold">{weather.humidity}%</strong>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="text-[10px] text-slate-400 block">Wind Speed</span>
            <strong className="text-slate-700 font-bold">{weather.windSpeed} km/h</strong>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-[10px] text-slate-400 block">Visibility</span>
            <strong className="text-slate-700 font-bold">{weather.visibility} km</strong>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <span className="text-base select-none">☀️</span>
          <div>
            <span className="text-[10px] text-slate-400 block">UV Index</span>
            <strong className="text-slate-700 font-bold">{weather.uvIndex}</strong>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <Sunrise className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 block">Sunrise</span>
            <strong className="text-[10px] text-slate-700 font-bold">{weather.sunrise}</strong>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center gap-2.5">
          <Sunset className="w-4 h-4 text-rose-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">Sunset</span>
            <strong className="text-[10px] text-slate-700 font-bold">{weather.sunset}</strong>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">5-Day Outlook</h5>
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 p-1.5 rounded-xl flex flex-col items-center justify-between min-w-0">
              <span className="text-[8px] text-slate-400 font-bold block">{day.date.split(',')[0]}</span>
              <span className="text-sm my-0.5 filter drop-shadow select-none">{day.icon}</span>
              <strong className="text-[9px] text-slate-700 block font-bold leading-none">{Math.round(day.maxTemp)}°</strong>
              <span className="text-[8px] text-slate-400 block leading-none mt-0.5">{Math.round(day.minTemp)}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
