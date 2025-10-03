import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, CloudRain, Wind, Eye, Gauge, Sun, Cloud, CloudRain as Rain, CloudSnow, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentWeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  weather_main: string;
  weather_description: string;
  location_name: string;
  data_source: 'real' | 'simulated';
  timestamp: string;
}

interface CurrentWeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName?: string;
}

// Free weather API service (no API key required for demo)
const WEATHER_API = {
  // Using Open-Meteo API (free, no API key required)
  getCurrentWeather: async (lat: number, lon: number): Promise<CurrentWeatherData | null> => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation&timezone=auto&past_days=1`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      const current = data.current;
      const hourly = data.hourly;
      
      // Debug: Log precipitation data
      console.log('Weather API Response:', {
        current_precipitation: current.precipitation,
        hourly_precipitation_sample: hourly?.precipitation?.slice(-6), // Last 6 hours
        weather_code: current.weather_code
      });
      
      // Calculate recent precipitation (last 3 hours)
      let recentPrecipitation = 0;
      if (hourly && hourly.precipitation && hourly.time) {
        const now = new Date();
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        
        for (let i = 0; i < hourly.time.length; i++) {
          const hourTime = new Date(hourly.time[i]);
          if (hourTime >= threeHoursAgo && hourTime <= now) {
            recentPrecipitation += hourly.precipitation[i] || 0;
          }
        }
      }
      
      // Map weather codes to descriptions
      const getWeatherDescription = (code: number) => {
        if (code === 0) return { main: 'Clear', description: 'Clear sky' };
        if (code <= 3) return { main: 'Clouds', description: 'Partly cloudy' };
        if (code <= 48) return { main: 'Fog', description: 'Foggy' };
        if (code <= 67) return { main: 'Rain', description: 'Rainy' };
        if (code <= 77) return { main: 'Snow', description: 'Snowy' };
        if (code <= 82) return { main: 'Rain', description: 'Heavy rain' };
        if (code <= 99) return { main: 'Thunderstorm', description: 'Thunderstorm' };
        return { main: 'Unknown', description: 'Unknown conditions' };
      };
      
      const weather = getWeatherDescription(current.weather_code);
      
      return {
        temperature: Math.round(current.temperature_2m),
        feels_like: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        pressure: Math.round(current.surface_pressure || 1013), // Use actual pressure if available
        visibility: 10000, // Default visibility (Open-Meteo doesn't provide this in free tier)
        wind_speed: Math.round(current.wind_speed_10m * 10) / 10,
        wind_direction: current.wind_direction_10m,
        precipitation: Math.round(recentPrecipitation * 10) / 10, // Recent 3-hour precipitation
        weather_main: weather.main,
        weather_description: weather.description,
        location_name: 'Current Location',
        data_source: 'real',
        timestamp: current.time
      };
    } catch (error) {
      console.error('Failed to fetch real weather data:', error);
      return null;
    }
  },

  // Fallback to simulated data if real API fails
  getSimulatedWeather: (lat: number, lon: number): CurrentWeatherData => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate seasonal temperature based on latitude and day of year
    const latitudeFactor = Math.abs(lat) / 90.0;
    const baseTemp = 20 - (latitudeFactor * 25); // Warmer near equator
    const seasonal = 15 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365);
    const temperature = Math.round(baseTemp + seasonal + (Math.random() - 0.5) * 10);
    
    // More realistic weather simulation based on location and season
    const humidity = Math.round(50 + Math.random() * 40);
    const isWinter = dayOfYear < 80 || dayOfYear > 300;
    const isTropical = Math.abs(lat) < 23.5;
    
    // Determine weather conditions based on location and season
    let weatherMain = 'Clear';
    let precipitation = 0;
    
    if (isTropical) {
      // Tropical regions have more rain
      if (Math.random() > 0.6) {
        weatherMain = 'Rain';
        precipitation = Math.round(Math.random() * 15 * 10) / 10;
      } else if (Math.random() > 0.4) {
        weatherMain = 'Clouds';
        precipitation = Math.random() > 0.8 ? Math.round(Math.random() * 3 * 10) / 10 : 0;
      }
    } else if (isWinter && temperature < 2) {
      // Cold regions in winter might have snow
      if (Math.random() > 0.7) {
        weatherMain = 'Snow';
        precipitation = Math.round(Math.random() * 8 * 10) / 10;
      }
    } else {
      // Temperate regions
      const rand = Math.random();
      if (rand > 0.8) {
        weatherMain = 'Rain';
        precipitation = Math.round(Math.random() * 12 * 10) / 10;
      } else if (rand > 0.5) {
        weatherMain = 'Clouds';
        precipitation = Math.random() > 0.9 ? Math.round(Math.random() * 2 * 10) / 10 : 0;
      }
    }
    
    return {
      temperature,
      feels_like: temperature + Math.round((Math.random() - 0.5) * 5),
      humidity,
      pressure: Math.round(1000 + Math.random() * 50),
      visibility: Math.round(5000 + Math.random() * 10000),
      wind_speed: Math.round(Math.random() * 20 * 10) / 10,
      wind_direction: Math.round(Math.random() * 360),
      precipitation,
      weather_main: weatherMain,
      weather_description: weatherMain.toLowerCase(),
      location_name: 'Simulated Location',
      data_source: 'simulated',
      timestamp: now.toISOString()
    };
  }
};

export function CurrentWeatherWidget({ latitude, longitude, locationName }: CurrentWeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<CurrentWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get real weather data first
        let data = await WEATHER_API.getCurrentWeather(latitude, longitude);
        
        // If real data fails, use simulated data
        if (!data) {
          console.warn('Real weather API failed, using simulated data');
          data = WEATHER_API.getSimulatedWeather(latitude, longitude);
        }
        
        if (locationName) {
          data.location_name = locationName;
        }
        
        setWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to fetch weather data');
        // Use simulated data as fallback
        const fallbackData = WEATHER_API.getSimulatedWeather(latitude, longitude);
        if (locationName) fallbackData.location_name = locationName;
        setWeatherData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, locationName]);

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds': return <Cloud className="h-8 w-8 text-gray-400" />;
      case 'rain': return <Rain className="h-8 w-8 text-blue-500" />;
      case 'snow': return <CloudSnow className="h-8 w-8 text-blue-200" />;
      case 'thunderstorm': return <Zap className="h-8 w-8 text-purple-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !weatherData) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-6">
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Weather</CardTitle>
          <Badge 
            variant={weatherData.data_source === 'real' ? 'default' : 'secondary'}
            className={cn(
              weatherData.data_source === 'real' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            )}
          >
            {weatherData.data_source === 'real' ? '🌐 Real Data' : '🔬 Simulated'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {weatherData.location_name} • {new Date(weatherData.timestamp).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Weather Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weatherData.weather_main)}
            <div>
              <p className="text-3xl font-bold">{weatherData.temperature}°C</p>
              <p className="text-sm text-muted-foreground">
                Feels like {weatherData.feels_like}°C
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium capitalize">{weatherData.weather_description}</p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Precipitation</p>
              <p className="text-sm font-medium">
                {weatherData.precipitation > 0 
                  ? `${weatherData.precipitation} mm` 
                  : '0 mm'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium">
                {weatherData.wind_speed} m/s {getWindDirection(weatherData.wind_direction)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium">{weatherData.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{(weatherData.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>
        </div>

        {/* Data Source Information */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {weatherData.data_source === 'real' ? (
              <>
                📡 <strong>Real-time data</strong> from Open-Meteo API (European Centre for Medium-Range Weather Forecasts)
              </>
            ) : (
              <>
                🔬 <strong>Simulated data</strong> based on climatological patterns for demonstration
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}