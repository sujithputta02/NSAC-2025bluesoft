import { useEffect, useRef, useState } from 'react';
import { Search, Navigation, Cloud, Sun, MapPin, Locate, Layers, CloudRain, CloudSnow, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import './weather-animations.css';

// Minimal Compass Component for Map2D
function CompassComponent({ 
  className, 
  onReset
}: { 
  className?: string;
  onReset?: () => void;
}) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-12 h-12 rounded-full border-2 border-white/70 bg-black/80 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-pointer hover:border-white hover:bg-black/90 hover:shadow-3xl transition-all duration-200"
        onClick={onReset}
        title="Click to reset view to North"
      >
        <div className="relative w-10 h-10">
          {/* North indicator */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-xs font-bold text-white drop-shadow-lg">N</div>
          
          {/* Static compass needle (always pointing north for 2D map) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* North needle (red) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500 rounded-full origin-bottom -translate-y-2"></div>
            {/* South needle (gray) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400 rounded-full origin-top translate-y-2 rotate-180"></div>
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

interface Map2DProps {
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  selectedLocation?: { lat: number; lng: number; name?: string };
  weatherType?: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
}

// Geocoding API service (same as in Earth3DGlobe)
const GEOCODING_API = {
  geocode: async (locationName: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  reverseGeocode: async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      if (data && data.display_name) {
        return {
          name: data.display_name,
          country: data.address?.country || '',
          city: data.address?.city || data.address?.town || data.address?.village || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },

  getLocationByIP: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          name: `${data.city}, ${data.region}, ${data.country_name}`,
          accuracy: 'city'
        };
      }
      return null;
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  }
};

// Format coordinates with proper N/S/E/W directions
const formatCoordinates = (lat: number, lng: number) => {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  const latAbs = Math.abs(lat).toFixed(4);
  const lngAbs = Math.abs(lng).toFixed(4);
  
  return {
    formatted: `${latAbs}°${latDirection}, ${lngAbs}°${lngDirection}`,
    lat: `${latAbs}°${latDirection}`,
    lng: `${lngAbs}°${lngDirection}`
  };
};

// Weather Animation Components
const WeatherOverlay = ({ weatherType, isVisible }: { weatherType: string; isVisible: boolean }) => {
  if (!isVisible) return null;

  const renderWeatherAnimation = () => {
    switch (weatherType) {
      case 'clear':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Animated sun rays */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-8 bg-yellow-400/60 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-24px)`,
                      transformOrigin: 'center 32px'
                    }}
                  />
                ))}
              </div>
              {/* Sun center */}
              <div className="w-12 h-12 bg-yellow-400 rounded-full shadow-lg animate-pulse" style={{ animationDuration: '3s' }}>
                <Sun className="w-8 h-8 text-yellow-100 m-2" />
              </div>
            </div>
          </div>
        );

      case 'cloudy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Multiple floating clouds */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-cloud opacity-70"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${15 + i * 10}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: '8s'
                }}
              >
                <Cloud className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        );

      case 'rainy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Rain clouds */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <CloudRain className="w-10 h-10 text-blue-500" />
            </div>
            {/* Animated rain drops */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-4 bg-blue-400 rounded-full animate-rain-drop opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        );

      case 'stormy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Storm clouds */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <Cloud className="w-12 h-12 text-gray-700" />
            </div>
            {/* Lightning bolts */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-lightning opacity-0"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                  animationDelay: `${i * 3}s`,
                  animationDuration: '0.5s'
                }}
              >
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
            ))}
            {/* Heavy rain */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-6 bg-blue-600 rounded-full animate-rain-drop opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );

      case 'snowy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Snow clouds */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <CloudSnow className="w-10 h-10 text-gray-300" />
            </div>
            {/* Snowflakes */}
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-snowfall opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg z-20">
      {renderWeatherAnimation()}
    </div>
  );
};

export function Map2D({ onLocationSelect, selectedLocation, weatherType = 'clear' }: Map2DProps) {
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [isWeatherEnabled, setIsWeatherEnabled] = useState(true);
  const [selectedWeatherType, setSelectedWeatherType] = useState<string>(weatherType);
  // Backend analysis states (match 3D globe)
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [weatherProbabilities, setWeatherProbabilities] = useState<Array<{condition: string; probability: number; threshold: string; trend: 'increasing'|'decreasing'|'stable'; confidence?: number;}>>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [weatherThresholds] = useState({ hotTemp: 32, coldTemp: 0, precipitation: 5, windSpeed: 15 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Backend API
  const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';
  const analyzeWeatherRisk = async (lat: number, lng: number, date: Date) => {
    try {
      setIsAnalyzing(true);
      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          event_date: date.toISOString().split('T')[0],
          thresholds: {
            hot_temp: weatherThresholds.hotTemp,
            cold_temp: weatherThresholds.coldTemp,
            precipitation: weatherThresholds.precipitation,
            wind_speed: weatherThresholds.windSpeed,
          },
        }),
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();
      setWeatherProbabilities(data.probabilities || []);
      setShowAnalysis(true);
    } catch (e) {
      console.error('2D analysis error:', e);
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update map center when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      setZoom(10);
      // Trigger backend analysis when location changes
      analyzeWeatherRisk(selectedLocation.lat, selectedLocation.lng, eventDate);
    }
  }, [selectedLocation]);

  // Update selected weather type when prop changes
  useEffect(() => {
    setSelectedWeatherType(weatherType);
  }, [weatherType]);

  // Re-analyze when event date changes
  useEffect(() => {
    if (selectedLocation) {
      analyzeWeatherRisk(selectedLocation.lat, selectedLocation.lng, eventDate);
    }
  }, [eventDate]);

  // Parse coordinates from various formats (same as 3D globe)
  const parseCoordinates = (query: string) => {
    const trimmed = query.trim();
    
    // Format 1: "lat, lng" (e.g., "28.6139, 77.2090")
    const basicCoords = trimmed.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (basicCoords) {
      return {
        lat: parseFloat(basicCoords[1]),
        lng: parseFloat(basicCoords[2])
      };
    }
    
    // Format 2: "lat°N/S, lng°E/W" (e.g., "28.6139°N, 77.2090°E")
    const degreesCoords = trimmed.match(/^(\d+\.?\d*)°([NS]),\s*(\d+\.?\d*)°([EW])$/i);
    if (degreesCoords) {
      let lat = parseFloat(degreesCoords[1]);
      let lng = parseFloat(degreesCoords[3]);
      
      if (degreesCoords[2].toUpperCase() === 'S') lat = -lat;
      if (degreesCoords[4].toUpperCase() === 'W') lng = -lng;
      
      return { lat, lng };
    }
    
    // Format 3: Just two numbers separated by space (e.g., "28.6139 77.2090")
    const spaceCoords = trimmed.match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/);
    if (spaceCoords) {
      return {
        lat: parseFloat(spaceCoords[1]),
        lng: parseFloat(spaceCoords[2])
      };
    }
    
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // First, try to parse as coordinates
      const coords = parseCoordinates(searchQuery);
      
      if (coords) {
        // Validate coordinate ranges
        if (coords.lat >= -90 && coords.lat <= 90 && coords.lng >= -180 && coords.lng <= 180) {
          // Get location name for the coordinates
          const locationData = await GEOCODING_API.reverseGeocode(coords.lat, coords.lng);
          const locationName = locationData ? locationData.name : `${formatCoordinates(coords.lat, coords.lng).formatted}`;
          
          onLocationSelect(coords.lat, coords.lng, locationName);
          setCenter({ lat: coords.lat, lng: coords.lng });
          setZoom(10);
          setSearchQuery('');
          setIsSearching(false);
          return;
        } else {
          alert('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
          setIsSearching(false);
          return;
        }
      }
      
      // If not coordinates, try geocoding API
      const result = await GEOCODING_API.geocode(searchQuery);
      if (result) {
        onLocationSelect(result.lat, result.lng, result.name);
        setCenter({ lat: result.lat, lng: result.lng });
        setZoom(10);
        setSearchQuery('');
      } else {
        alert('Location not found. Please try a different search term or use coordinates (e.g., "28.6139, 77.2090").');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please try again.');
    }
    setIsSearching(false);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

      navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Get real location name
        try {
          const locationData = await GEOCODING_API.reverseGeocode(latitude, longitude);
          const locationName = locationData ? locationData.name : 'Current Location';
          onLocationSelect(latitude, longitude, locationName);
          setCenter({ lat: latitude, lng: longitude });
          setZoom(12);
        } catch (error) {
          onLocationSelect(latitude, longitude, 'Current Location');
          setCenter({ lat: latitude, lng: longitude });
          setZoom(12);
        }
        
        setIsGettingLocation(false);
      },
      async (error) => {
        console.error('GPS Geolocation error:', error);
        
        // Try IP-based location as fallback
        try {
          const ipLocation = await GEOCODING_API.getLocationByIP();
          if (ipLocation) {
            setCurrentLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
            onLocationSelect(ipLocation.lat, ipLocation.lng, `${ipLocation.name} (Approximate)`);
            setCenter({ lat: ipLocation.lat, lng: ipLocation.lng });
            setZoom(8);
            setIsGettingLocation(false);
            alert('GPS not available. Showing approximate location based on your internet connection.');
            return;
          }
        } catch (ipError) {
          console.error('IP geolocation also failed:', ipError);
        }
        
        setIsGettingLocation(false);
        alert('Unable to get your current location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Search and controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-64">
        <div className="flex gap-1 bg-card/70 backdrop-blur-sm border border-primary/20 rounded p-1 shadow-sm">
            <Input
              type="text"
            placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-transparent border-none focus:ring-0 text-xs h-6"
            />
            <Button
              onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            variant="ghost"
            size="sm"
            className="shrink-0 h-6 w-6 p-0"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            ) : (
              <Search className="h-3 w-3" />
            )}
            </Button>
        </div>
      </div>

      {/* Right sidebar stack: Date + Weather */}
      <div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
        <div className="bg-card/90 backdrop-blur border border-primary/20 rounded-lg p-2 shadow-lg w-48">
          <div className="text-[11px] font-semibold mb-1">📅 Event Date</div>
          <Input
            type="date"
            value={eventDate.toISOString().split('T')[0]}
            onChange={(e) => setEventDate(new Date(e.target.value))}
            className="w-full text-[11px] h-8 px-2"
          />
          <Button
            onClick={() => selectedLocation && analyzeWeatherRisk(selectedLocation.lat, selectedLocation.lng, eventDate)}
            disabled={!selectedLocation || isAnalyzing}
            className="mt-2 w-full h-8 text-[11px]"
            variant="default"
            size="sm"
          >
            {isAnalyzing ? 'Analyzing…' : 'Check My Day'}
          </Button>
        </div>
      
        {/* Minimal Weather Control Panel */}
        <div className="bg-card/80 backdrop-blur-md border border-primary/30 rounded-lg p-2 shadow-md">
          {/* Compact Weather Toggle */}
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant={isWeatherEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsWeatherEnabled(!isWeatherEnabled)}
              className="text-xs px-2 py-1 h-6"
            >
              {isWeatherEnabled ? "🌤️" : "❌"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {isWeatherEnabled ? "On" : "Off"}
            </span>
          </div>

          {/* Minimal Weather Type Icons */}
          {isWeatherEnabled && (
            <div className="flex gap-1">
              {[
                { type: 'clear', icon: '☀️' },
                { type: 'cloudy', icon: '☁️' },
                { type: 'rainy', icon: '🌧️' },
                { type: 'stormy', icon: '⛈️' },
                { type: 'snowy', icon: '🌨️' }
              ].map(({ type, icon }) => (
                <Button
                  key={type}
                  variant={selectedWeatherType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedWeatherType(type)}
                  className="text-xs p-1 h-6 w-6"
                  title={type}
                >
                  {icon}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex flex-col gap-2">
            <Button
              onClick={getCurrentLocation}
            disabled={isGettingLocation}
            variant="outline"
            size="sm"
            className="bg-card/80 backdrop-blur border-primary/20 hover:bg-primary/10 whitespace-nowrap"
          >
            {isGettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Locate className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isGettingLocation ? 'Getting GPS...' : 'My Location'}
            </span>
            </Button>
          
          {/* Show current location info if available */}
          {currentLocation && (
            <div className="bg-card/80 backdrop-blur border border-primary/20 rounded-lg p-2 text-xs w-48">
              <div className="text-green-400 font-semibold">📍 Your Location</div>
              <div className="text-muted-foreground">
                {formatCoordinates(currentLocation.lat, currentLocation.lng).formatted}
              </div>
            </div>
          )}
        </div>
      </div>
          
          {/* Map type selector */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex gap-1 p-1 bg-card/90 backdrop-blur border border-primary/20 rounded-lg">
            <Button
              variant={mapType === 'normal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapType('normal')}
            className="text-xs"
            >
            <Layers className="h-3 w-3 mr-1" />
              Normal
            </Button>
            <Button
              variant={mapType === 'satellite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapType('satellite')}
            className="text-xs"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Satellite
          </Button>
        </div>
      </div>

      {/* Weather Control Panel - old duplicate removed */}

      {/* Interactive map with proper satellite support */}
      <div className="w-full h-full relative">
        {mapType === 'satellite' ? (
          // Satellite view using multiple fallback options for better reliability
          <div className="w-full h-full relative">
            <iframe
              src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&t=k&z=${Math.max(10, Math.min(zoom + 8, 20))}&output=embed&iwloc=near`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              title="Satellite Map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Weather overlay for satellite view - only show over selected location */}
            {selectedLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-25">
                <div className="relative w-full h-full rounded-full bg-black/10 backdrop-blur-sm border border-white/20">
                  <WeatherOverlay weatherType={isWeatherEnabled ? selectedWeatherType : 'clear'} isVisible={isWeatherEnabled} />
                  {/* Location marker in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
        <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-0.01},${center.lat-0.01},${center.lng+0.01},${center.lat+0.01}&layer=mapnik&marker=${center.lat},${center.lng}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
              title="OpenStreetMap"
              loading="lazy"
            />
            {/* Weather overlay for normal view - only show over selected location */}
            {selectedLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-25">
                <div className="relative w-full h-full rounded-full bg-black/10 backdrop-blur-sm border border-white/20">
                  <WeatherOverlay weatherType={isWeatherEnabled ? selectedWeatherType : 'clear'} isVisible={isWeatherEnabled} />
                  {/* Location marker in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Zoom controls - moved to bottom-right to avoid overlap */}
        <div className="absolute bottom-20 right-4 z-30 flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            className="bg-card/95 backdrop-blur-md border-primary/30 w-10 h-10 text-lg font-bold shadow-lg hover:bg-primary/20"
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card/95 backdrop-blur-md border-primary/30 w-10 h-10 text-lg font-bold shadow-lg hover:bg-primary/20"
            onClick={() => setZoom(Math.max(zoom - 1, 1))}
          >
            −
          </Button>
          <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg px-2 py-1 text-xs font-medium text-center shadow-lg">
            {zoom}x
          </div>
        </div>
        
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 z-30 bg-card/95 backdrop-blur-md border border-primary/30 p-4 rounded-lg max-w-80 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold truncate">{selectedLocation.name || 'Selected Location'}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              📍 {formatCoordinates(selectedLocation.lat, selectedLocation.lng).formatted}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
              <span>🔍 Zoom: {zoom}x</span>
              <span>🛰️ {mapType === 'satellite' ? 'Satellite' : 'Street'} View</span>
            </div>
            {showAnalysis && weatherProbabilities.length > 0 && (
              <div className="mt-3 space-y-1">
                {weatherProbabilities.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-black/20 rounded px-2 py-1">
                    <div>
                      <div className="font-medium">{p.condition}</div>
                      <div className="text-[10px] text-muted-foreground">{p.threshold}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{Math.round(p.probability)}%</div>
                      <div className="text-[10px] text-muted-foreground">{p.trend === 'increasing' ? '↗️' : p.trend === 'decreasing' ? '↘️' : '→'} trend</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Minimal Compass - positioned to be clearly visible */}
        <CompassComponent 
          className="absolute top-4 right-4 z-50" 
          onReset={() => {
            // For 2D map, we could reset to a default view or do nothing
            // Since it's a static map, this could center the view or reset zoom
            console.log('Compass clicked - could reset map view');
          }}
        />
      </div>
    </div>
  );
}