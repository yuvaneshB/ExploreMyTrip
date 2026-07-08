import axios from 'axios';

/**
 * Maps WMO Weather Interpretation Codes (weathercode) to human-readable descriptions and emoji icons.
 */
export const getWeatherCondition = (code) => {
  const mapping = {
    0: { text: 'Clear Sky', icon: '☀️' },
    1: { text: 'Mainly Clear', icon: '🌤️' },
    2: { text: 'Partly Cloudy', icon: '⛅' },
    3: { text: 'Overcast', icon: '☁️' },
    45: { text: 'Foggy', icon: '🌫️' },
    48: { text: 'Depositing Rime Fog', icon: '🌫️' },
    51: { text: 'Light Drizzle', icon: '🌦️' },
    53: { text: 'Moderate Drizzle', icon: '🌦️' },
    55: { text: 'Dense Drizzle', icon: '🌦️' },
    61: { text: 'Slight Rain', icon: '🌧️' },
    63: { text: 'Moderate Rain', icon: '🌧️' },
    65: { text: 'Heavy Rain', icon: '🌧️' },
    71: { text: 'Slight Snowfall', icon: '🌨️' },
    73: { text: 'Moderate Snowfall', icon: '🌨️' },
    75: { text: 'Heavy Snowfall', icon: '🌨️' },
    80: { text: 'Slight Rain Showers', icon: '🌧️' },
    81: { text: 'Moderate Rain Showers', icon: '🌧️' },
    82: { text: 'Violent Rain Showers', icon: '⛈️' },
    95: { text: 'Thunderstorm', icon: '⛈️' },
    96: { text: 'Thunderstorm with Hail', icon: '⛈️' },
    99: { text: 'Severe Thunderstorm', icon: '⛈️' }
  };
  return mapping[code] || { text: 'Unknown Weather', icon: '🌡️' };
};

export const fetchWeatherByCoords = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error('Coordinates are required to fetch weather');
  }

  const response = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,visibility,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`
  );

  const { current, daily } = response.data;

  // Compile 5-day forecast
  const forecast = daily.time.slice(0, 5).map((dateStr, idx) => {
    const condition = getWeatherCondition(daily.weather_code[idx]);
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: daily.temperature_2m_max[idx],
      minTemp: daily.temperature_2m_min[idx],
      text: condition.text,
      icon: condition.icon
    };
  });

  const currentCondition = getWeatherCondition(current.weather_code);

  // Format sunrise/sunset times
  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'N/A';
    }
  };

  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : '10', // convert meters to km if available
    uvIndex: daily.uv_index_max?.[0] ? Number(daily.uv_index_max[0]).toFixed(1) : '1.0',
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    conditionText: currentCondition.text,
    conditionIcon: currentCondition.icon,
    forecast
  };
};
