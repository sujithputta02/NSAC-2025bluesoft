import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Text } from '@react-three/drei';
import { TextureLoader, Vector3, Color } from 'three';
import * as THREE from 'three';
import { MapPin, Navigation, Locate, Compass, Search, Cloud, Sun, CloudRain, CloudSnow, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import earthMapTexture from '@/assets/earth-map.jpg';
import earthNormalTexture from '@/assets/earth-normal.jpg';
import earthSpecularTexture from '@/assets/earth-specular.jpg';

interface Earth3DGlobeProps {
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  selectedLocation?: { lat: number; lng: number; name?: string };
  weatherType?: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  onEventDateSelect?: (date: Date) => void;
  selectedEventDate?: Date;
}

interface WeatherThresholds {
  hotTemp: number;
  coldTemp: number;
  precipitation: number;
  windSpeed: number;
  comfortIndex: number;
}

interface WeatherProbability {
  condition: string;
  probability: number;
  threshold: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

// Geocoding API service
const GEOCODING_API = {
  // Using OpenStreetMap Nominatim API (free, no API key required)
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

  // Fallback: IP-based location (less accurate but works when GPS is denied)
  getLocationByIP: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          name: `${data.city}, ${data.region}, ${data.country_name}`,
          accuracy: 'city' // IP-based is city-level accurate
        };
      }
      return null;
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  }
};

// Enhanced geographic data with verified coordinates
const GEOGRAPHIC_DATA = {
  continents: [
    { name: 'North America', lat: 45.0, lng: -100.0, minZoom: 8 },
    { name: 'South America', lat: -15.0, lng: -60.0, minZoom: 8 },
    { name: 'Europe', lat: 54.0, lng: 15.0, minZoom: 8 },
    { name: 'Africa', lat: 0.0, lng: 20.0, minZoom: 8 },
    { name: 'Asia', lat: 30.0, lng: 100.0, minZoom: 8 },
    { name: 'Australia', lat: -25.0, lng: 140.0, minZoom: 8 },
    { name: 'Antarctica', lat: -80.0, lng: 0.0, minZoom: 8 }
  ],
  countries: [
    // Verified coordinates using geographic centers
    { name: 'United States', lat: 39.8283, lng: -98.5795, minZoom: 6 },
    { name: 'Canada', lat: 56.1304, lng: -106.3468, minZoom: 6 },
    { name: 'Brazil', lat: -14.2350, lng: -51.9253, minZoom: 6 },
    { name: 'Russia', lat: 61.5240, lng: 105.3188, minZoom: 6 },
    { name: 'China', lat: 35.8617, lng: 104.1954, minZoom: 6 },
    { name: 'India', lat: 20.5937, lng: 78.9629, minZoom: 6 }, // Geographic center of India
    { name: 'Australia', lat: -25.2744, lng: 133.7751, minZoom: 6 },
    { name: 'Germany', lat: 51.1657, lng: 10.4515, minZoom: 5 },
    { name: 'France', lat: 46.6034, lng: 1.8883, minZoom: 5 },
    { name: 'United Kingdom', lat: 55.3781, lng: -3.4360, minZoom: 5 },
    { name: 'Japan', lat: 36.2048, lng: 138.2529, minZoom: 5 },
    { name: 'South Korea', lat: 35.9078, lng: 127.7669, minZoom: 5 }
  ],
  cities: [
    // Major cities with precise coordinates
    { name: 'New York', lat: 40.7128, lng: -74.0060, minZoom: 4 },
    { name: 'London', lat: 51.5074, lng: -0.1278, minZoom: 4 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, minZoom: 4 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, minZoom: 4 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, minZoom: 4 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, minZoom: 4 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, minZoom: 4 },
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090, minZoom: 4 }, // India's capital
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, minZoom: 4 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6176, minZoom: 4 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, minZoom: 4 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, minZoom: 4 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, minZoom: 4 },
    { name: 'Rome', lat: 41.9028, lng: 12.4964, minZoom: 4 },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038, minZoom: 4 }
  ],
  towns: [
    { name: 'Cambridge', lat: 52.2053, lng: 0.1218, minZoom: 3.5 },
    { name: 'Princeton', lat: 40.3573, lng: -74.6672, minZoom: 3.5 },
    { name: 'Heidelberg', lat: 49.3988, lng: 8.6724, minZoom: 3.5 },
    { name: 'Kyoto', lat: 35.0116, lng: 135.7681, minZoom: 3.5 },
    { name: 'Bruges', lat: 51.2093, lng: 3.2247, minZoom: 3.5 },
    { name: 'Salzburg', lat: 47.8095, lng: 13.0550, minZoom: 3.5 }
  ]
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

// Minimal Compass Component
function CompassComponent({ 
  className, 
  rotation = 0,
  onReset
}: { 
  className?: string;
  rotation?: number;
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
          
          {/* Rotating compass needle */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out"
            style={{ transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
          >
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

// 3D Weather Components for the Globe
function WeatherParticleSystem({ position, weatherType }: { position: Vector3; weatherType: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Fixed particle count to avoid buffer resize issues
  const MAX_PARTICLES = 50;

  useFrame(({ clock }) => {
    if (!particlesRef.current || !groupRef.current || !geometryRef.current) return;
    
    const time = clock.getElapsedTime();
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    
    // Get active particle count based on weather type
    const activeParticles = weatherType === 'stormy' ? 50 : weatherType === 'rainy' ? 30 : weatherType === 'snowy' ? 25 : 15;
    
    // Animate only active particles
    for (let i = 0; i < activeParticles * 3; i += 3) {
      switch (weatherType) {
        case 'rainy':
          positions[i + 1] -= 0.02; // Rain falls down
          if (positions[i + 1] < -0.3) positions[i + 1] = 0.3; // Reset to top
          break;
        case 'snowy':
          positions[i + 1] -= 0.005; // Snow falls slower
          positions[i] += Math.sin(time + i) * 0.001; // Gentle drift
          if (positions[i + 1] < -0.3) positions[i + 1] = 0.3;
          break;
        case 'stormy':
          positions[i + 1] -= 0.03; // Heavy rain
          positions[i] += (Math.random() - 0.5) * 0.002; // Wind effect
          if (positions[i + 1] < -0.3) positions[i + 1] = 0.3;
          break;
        case 'cloudy':
          positions[i] += Math.sin(time * 0.5 + i) * 0.0005; // Gentle cloud movement
          positions[i + 2] += Math.cos(time * 0.3 + i) * 0.0005;
          break;
      }
    }
    
    // Hide inactive particles by moving them far away
    const activeParticles3 = activeParticles * 3;
    for (let i = activeParticles3; i < MAX_PARTICLES * 3; i += 3) {
      positions[i] = 1000; // Move far away
      positions[i + 1] = 1000;
      positions[i + 2] = 1000;
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;
    
    // Rotate the entire weather system slightly
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
  });

  // Create fixed size particle array
  const createParticles = () => {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3;
      // Create particles in a very small area around the location
      positions[i3] = (Math.random() - 0.5) * 0.08; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 0.08; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 0.08; // z
    }
    
    return positions;
  };

  const getParticleColor = () => {
    switch (weatherType) {
      case 'rainy': return '#4a90e2';
      case 'snowy': return '#ffffff';
      case 'stormy': return '#2c5aa0';
      case 'cloudy': return '#cccccc';
      default: return '#ffff00';
    }
  };

  const getParticleSize = () => {
    switch (weatherType) {
      case 'rainy': return 0.001;
      case 'snowy': return 0.003;
      case 'stormy': return 0.002;
      case 'cloudy': return 0.005;
      default: return 0.002;
    }
  };

  if (weatherType === 'clear') {
    return (
      <group ref={groupRef} position={position}>
        {/* Minimal sun glow effect */}
        <mesh>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ffff00" opacity={0.4} transparent />
        </mesh>
        {/* Smaller sun rays */}
        {[...Array(6)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0.03 * Math.cos((i * Math.PI) / 3), 0.03 * Math.sin((i * Math.PI) / 3), 0]}>
            <cylinderGeometry args={[0.0005, 0.0005, 0.015]} />
            <meshBasicMaterial color="#ffff00" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position}>
      <points ref={particlesRef}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute
            attach="attributes-position"
            array={createParticles()}
            count={MAX_PARTICLES}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={getParticleColor()}
          size={getParticleSize()}
          transparent
          opacity={0.8}
        />
      </points>
      
      {/* Weather-specific minimal additional effects */}
      {weatherType === 'stormy' && (
        <mesh>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#444444" opacity={0.3} transparent />
        </mesh>
      )}
      
      {weatherType === 'cloudy' && (
        <mesh>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#cccccc" opacity={0.2} transparent />
        </mesh>
      )}
    </group>
  );
}

// This component will be rendered inside Earth where getMarkerPosition is available

function Earth({ onClick, selectedLocation, cameraDistance, weatherType }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Vector3 | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const [earthMap, earthNormal, earthSpecular] = useLoader(TextureLoader, [
    earthMapTexture,
    earthNormalTexture,
    earthSpecularTexture,
  ]);

  useFrame(({ clock }) => {
    // Only animate clouds, not the main Earth mesh for better control
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.01; // Slower cloud movement
      cloudsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  const handlePointerDown = (event: any) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(false);
  };

  const handlePointerMove = (event: any) => {
    if (dragStartRef.current) {
      const deltaX = Math.abs(event.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(event.clientY - dragStartRef.current.y);
      
      // If mouse moved more than 5 pixels, consider it a drag
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }
    }
    
    // Show hover point for better visual feedback
    if (!isDragging && event.point) {
      setHoverPoint(event.point.clone().normalize().multiplyScalar(2.02));
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoverPoint(null);
  };

  const handleClick = (event: any) => {
    // Only handle click if we're not dragging (rotating)
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      return;
    }

    event.stopPropagation();
    const point = event.point;
    
    // Convert 3D point to lat/lng - CORRECTED to match getMarkerPosition
    const spherical = new Vector3().copy(point).normalize();
    
    // Convert back to lat/lng using corrected coordinate system
    const lat = Math.asin(spherical.y) * (180 / Math.PI);
    const lng = Math.atan2(-spherical.z, spherical.x) * (180 / Math.PI);
    
    // Clamp values to valid ranges
    const clampedLat = Math.max(-90, Math.min(90, lat));
    const clampedLng = ((lng + 180) % 360) - 180; // Normalize to -180 to 180
    
    // Use reverse geocoding API to get real location name
    const getLocationName = async (lat: number, lng: number) => {
      const result = await GEOCODING_API.reverseGeocode(lat, lng);
      return result ? result.name : null;
    };

    // Get location name and call onClick
    getLocationName(clampedLat, clampedLng).then(locationName => {
      onClick(clampedLat, clampedLng, locationName);
    });
    dragStartRef.current = null;
  };

  // Convert lat/lng to 3D position - CORRECTED for Earth texture alignment
  const getMarkerPosition = (lat: number, lng: number) => {
    // Convert to radians
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
    const radius = 2.05; // Slightly above surface
    
    // Corrected coordinate system - India at 78.9629°E should be to the right of center
    // Standard geographic coordinate system with proper texture alignment
    const x = radius * Math.cos(latRad) * Math.cos(lngRad);
    const y = radius * Math.sin(latRad);
    const z = -radius * Math.cos(latRad) * Math.sin(lngRad); // Negative Z for correct orientation
    
    return new Vector3(x, y, z);
  };

  // Get visible locations based on camera distance (zoom level)
  const getVisibleLocations = () => {
    const locations = [];
    
    if (cameraDistance <= 8) {
      locations.push(...GEOGRAPHIC_DATA.continents);
    }
    if (cameraDistance <= 6) {
      locations.push(...GEOGRAPHIC_DATA.countries);
    }
    if (cameraDistance <= 4) {
      locations.push(...GEOGRAPHIC_DATA.cities);
    }
    if (cameraDistance <= 3.5) {
      locations.push(...GEOGRAPHIC_DATA.towns);
    }
    
    return locations.filter(loc => cameraDistance <= loc.minZoom);
  };

  // Create line object helper function
  const createLine = (start: Vector3, end: Vector3, color: string = '#63b3ed', opacity: number = 0.8) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ 
      color, 
      opacity, 
      transparent: true 
    });
    return new THREE.Line(geometry, material);
  };

  return (
    <group>
      {/* Hover indicator */}
      {hoverPoint && !isDragging && (
        <mesh position={hoverPoint}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      )}

      {/* Earth */}
      <mesh 
        ref={meshRef} 
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setHovered(true)}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          normalMap={earthNormal}
          specularMap={earthSpecular}
          specular={new Color('grey')}
          shininess={hovered ? 15 : 10}
          emissive={hovered ? new Color('#001122') : new Color('#000000')}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]} onPointerOver={() => {}} onPointerOut={() => {}} onClick={() => {}}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          opacity={0.3}
          transparent
          color={new Color('#ffffff')}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={[1.1, 1.1, 1.1]} onPointerOver={() => {}} onPointerOut={() => {}} onClick={() => {}}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color={new Color('#4a90e2')}
          opacity={0.1}
          transparent
          side={THREE.BackSide}
        />
      </mesh>

      {/* Location labels with pointer lines */}
      {getVisibleLocations().map((location, index) => {
        const surfacePosition = getMarkerPosition(location.lat, location.lng);
        const labelOffset = new Vector3(0.3, 0.2, 0.1); // Offset for label positioning
        const labelPosition = surfacePosition.clone().add(labelOffset);
        
        return (
          <group key={`${location.name}-${index}`}>
            {/* Pointer line from surface to label using primitive */}
            <primitive 
              object={createLine(surfacePosition, labelPosition)}
            />
            
            {/* Location dot on surface */}
            <mesh position={surfacePosition}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial color="#63b3ed" />
            </mesh>
            
            {/* Label */}
            <Html
              position={labelPosition}
              distanceFactor={cameraDistance * 0.3}
              className="pointer-events-auto z-10"
              onClick={() => onClick(location.lat, location.lng, location.name)}
            >
              <div className="cursor-pointer hover:scale-110 transition-transform">
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap backdrop-blur border border-primary/40 shadow-lg hover:bg-primary/20">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-semibold">{location.name}</div>
                      <div className="text-xs opacity-75">
                        {formatCoordinates(location.lat, location.lng).formatted}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pointer triangle */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Selected location marker with enhanced visuals */}
      {selectedLocation && (
        <group>
          {/* Pulsing ring on surface */}
          <mesh position={getMarkerPosition(selectedLocation.lat, selectedLocation.lng)}>
            <ringGeometry args={[0.02, 0.04, 16]} />
            <meshBasicMaterial color="#63b3ed" opacity={0.6} transparent />
          </mesh>
          
          {/* Central dot */}
          <mesh position={getMarkerPosition(selectedLocation.lat, selectedLocation.lng)}>
            <sphereGeometry args={[0.015, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Vertical line indicator */}
          <primitive 
            object={createLine(
              getMarkerPosition(selectedLocation.lat, selectedLocation.lng),
              getMarkerPosition(selectedLocation.lat, selectedLocation.lng).clone().add(new Vector3(0, 0.3, 0)),
              '#ffffff',
              1.0
            )}
          />
          
          {/* 3D Weather Particle System at selected location */}
          <WeatherParticleSystem 
            position={new Vector3().copy(getMarkerPosition(selectedLocation.lat, selectedLocation.lng)).multiplyScalar(1.05)}
            weatherType={weatherType}
          />

          {/* Weather Overlay (HTML) at selected location */}
          <Html 
            position={new Vector3().copy(getMarkerPosition(selectedLocation.lat, selectedLocation.lng)).multiplyScalar(1.08)}
            transform 
            occlude="blending" 
            zIndexRange={[10, 0]}
          >
            <div className="relative w-8 h-8 pointer-events-none">
              {/* Minimal weather animation overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {weatherType === 'clear' && (
                  <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-70 animate-pulse">
                    <Sun className="w-3 h-3 text-yellow-100 m-0.5" />
              </div>
            )}
                
                {weatherType === 'cloudy' && (
                  <Cloud className="w-4 h-4 text-gray-400 opacity-60 animate-pulse" />
                )}
                
                {weatherType === 'rainy' && (
                  <div className="relative">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-2 bg-blue-400 rounded-full opacity-50 animate-bounce"
                        style={{
                          left: `${6 + i * 4}px`,
                          top: '12px',
                          animationDelay: `${i * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {weatherType === 'stormy' && (
                  <div className="relative">
                    <Cloud className="w-4 h-4 text-gray-700" />
                    <Zap className="w-2 h-2 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                )}
                
                {weatherType === 'snowy' && (
                  <div className="relative">
                    <CloudSnow className="w-4 h-4 text-gray-300" />
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-bounce"
                        style={{
                          left: `${4 + i * 2}px`,
                          top: '12px',
                          animationDelay: `${i * 0.8}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
          </div>
        </Html>

          {/* Selected location label */}
          <Html 
            position={getMarkerPosition(selectedLocation.lat, selectedLocation.lng).clone().add(new Vector3(0, 0.35, 0))}
            center
            className="z-10"
          >
            <div className="animate-bounce">
              <div className="bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur border-2 border-white/30 shadow-xl">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <div>
            {selectedLocation.name && (
                      <div className="font-bold">{selectedLocation.name}</div>
                    )}
                    <div className="text-xs opacity-90">
                      {formatCoordinates(selectedLocation.lat, selectedLocation.lng).formatted}
                    </div>
                    <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                      🌦️ <span className="capitalize">{weatherType}</span>
                      <span className="text-green-200">● Live</span>
                    </div>
                  </div>
                </div>
                {/* Pointer arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-primary/90"></div>
              </div>
          </div>
        </Html>
        </group>
      )}
    </group>
  );
}

function WeatherEffects({ weatherType }: { weatherType: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && weatherType === 'stormy') {
      // Lightning effect
      const intensity = Math.random() > 0.98 ? 1 : 0;
      groupRef.current.children.forEach(child => {
        if (child instanceof THREE.PointLight) {
          (child as THREE.PointLight).intensity = intensity * 5;
        }
      });
    }
  });

  if (weatherType === 'clear') {
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#fffacd" />
      </>
    );
  }

  if (weatherType === 'cloudy') {
    return (
      <>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} color="#d3d3d3" />
        <fog attach="fog" color="#cccccc" near={10} far={50} />
      </>
    );
  }

  if (weatherType === 'rainy') {
    return (
      <>
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 3, 5]} intensity={0.5} color="#a0a0a0" />
        <fog attach="fog" color="#808080" near={5} far={30} />
      </>
    );
  }

  if (weatherType === 'stormy') {
    return (
      <group ref={groupRef}>
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 3, 5]} intensity={0.3} color="#606060" />
        <pointLight position={[0, 10, 0]} intensity={0} color="#ffffff" />
        <fog attach="fog" color="#404040" near={3} far={20} />
      </group>
    );
  }

  if (weatherType === 'snowy') {
    return (
      <>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} color="#e6f2ff" />
        <fog attach="fog" color="#f0f8ff" near={8} far={40} />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </>
  );
}

// Backend API Integration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const analyzeWeatherRisk = async (location: {lat: number, lng: number}, date: Date, thresholds: WeatherThresholds): Promise<{probabilities: WeatherProbability[], comfortIndex: number, alternatives: any[], metadata: any}> => {
  try {
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        event_date: date.toISOString().split('T')[0],
        thresholds: {
          hot_temp: thresholds.hotTemp,
          cold_temp: thresholds.coldTemp,
          precipitation: thresholds.precipitation,
          wind_speed: thresholds.windSpeed
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      probabilities: data.probabilities,
      comfortIndex: data.comfort_index,
      alternatives: data.alternative_dates,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Failed to fetch weather analysis from backend:', error);
    
    // Fallback to local simulation
    return {
      probabilities: calculateWeatherProbabilitiesLocal(location, date, thresholds),
      comfortIndex: 65,
      alternatives: [],
      metadata: {
        datasets_used: ['Fallback simulation'],
        note: 'Backend unavailable, using local simulation'
      }
    };
  }
};

// Fallback local calculation (simplified)
const calculateWeatherProbabilitiesLocal = (location: {lat: number, lng: number}, date: Date, thresholds: WeatherThresholds): WeatherProbability[] => {
  const month = date.getMonth();
  const lat = Math.abs(location.lat);
  
  return [
    {
      condition: 'Very Hot',
      probability: Math.min(90, Math.max(5, (30 - lat) * 2 + (month >= 5 && month <= 8 ? 30 : 0))),
      threshold: `>${thresholds.hotTemp}°C`,
      trend: lat < 30 ? 'increasing' : 'stable',
      confidence: 0.85
    },
    {
      condition: 'Very Cold',
      probability: Math.min(90, Math.max(5, lat * 1.5 + (month >= 11 || month <= 2 ? 40 : 0))),
      threshold: `<${thresholds.coldTemp}°C`,
      trend: lat > 40 ? 'increasing' : 'stable',
      confidence: 0.78
    },
    {
      condition: 'Heavy Rain',
      probability: Math.min(85, Math.max(10, 25 + (month >= 6 && month <= 9 ? 35 : 0) + (lat < 10 ? 20 : 0))),
      threshold: `>${thresholds.precipitation}mm`,
      trend: 'increasing',
      confidence: 0.72
    },
    {
      condition: 'Strong Wind',
      probability: Math.min(75, Math.max(8, 15 + (lat > 40 ? 25 : 0) + (month >= 10 || month <= 3 ? 20 : 0))),
      threshold: `>${thresholds.windSpeed}m/s`,
      trend: 'stable',
      confidence: 0.65
    }
  ];
};

const calculateComfortIndex = (probabilities: WeatherProbability[]): number => {
  // Weighted comfort index (100 = perfect, 0 = terrible)
  const weights = { 'Very Hot': 0.3, 'Very Cold': 0.3, 'Heavy Rain': 0.25, 'Strong Wind': 0.15 };
  let discomfort = 0;
  
  probabilities.forEach(prob => {
    const weight = weights[prob.condition as keyof typeof weights] || 0.1;
    discomfort += (prob.probability / 100) * weight;
  });
  
  return Math.round(Math.max(0, Math.min(100, (1 - discomfort) * 100)));
};

export function Earth3DGlobe({ 
  onLocationSelect, 
  selectedLocation,
  weatherType = 'clear',
  onEventDateSelect,
  selectedEventDate
}: Earth3DGlobeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(6);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [globeRotation, setGlobeRotation] = useState(0);
  const [isWeatherEnabled, setIsWeatherEnabled] = useState(true);
  const [selectedWeatherType, setSelectedWeatherType] = useState<string>(weatherType);
  const [weatherThresholds, setWeatherThresholds] = useState<WeatherThresholds>({
    hotTemp: 32,
    coldTemp: 0,
    precipitation: 5,
    windSpeed: 15,
    comfortIndex: 70
  });
  const [weatherProbabilities, setWeatherProbabilities] = useState<WeatherProbability[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Simulate loading time for textures
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update selected weather type when prop changes
  useEffect(() => {
    setSelectedWeatherType(weatherType);
  }, [weatherType]);

  // Update event date when prop changes
  useEffect(() => {
    if (selectedEventDate && !isNaN(selectedEventDate.getTime())) {
      setEventDate(selectedEventDate);
    }
  }, [selectedEventDate]);

  // Analyze weather when location or date changes
  useEffect(() => {
    const analyzeWeather = async () => {
      if (selectedLocation) {
        try {
          const result = await analyzeWeatherRisk(selectedLocation, eventDate, weatherThresholds);
          setWeatherProbabilities(result.probabilities);
          setShowAnalysis(true);
        } catch (error) {
          console.error('Weather analysis failed:', error);
          // Use fallback local calculation
          const probabilities = calculateWeatherProbabilitiesLocal(selectedLocation, eventDate, weatherThresholds);
          setWeatherProbabilities(probabilities);
          setShowAnalysis(true);
        }
      } else {
        setShowAnalysis(false);
      }
    };

    analyzeWeather();
  }, [selectedLocation, eventDate, weatherThresholds]);

  // Get current location with improved accuracy and error handling
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    // First try with high accuracy
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('GPS Location found:', { latitude, longitude, accuracy });
        
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Get real location name using reverse geocoding
        try {
          const locationData = await GEOCODING_API.reverseGeocode(latitude, longitude);
          const locationName = locationData ? locationData.name : 'Current Location';
          onLocationSelect(latitude, longitude, locationName);
          
          // Animate camera to current location smoothly
          if (controlsRef.current) {
            // Use the same coordinate system as getMarkerPosition
            const latRad = latitude * (Math.PI / 180);
            const lngRad = longitude * (Math.PI / 180);
            const radius = 2.05;
            
            const x = radius * Math.cos(latRad) * Math.cos(lngRad);
            const y = radius * Math.sin(latRad);
            const z = -radius * Math.cos(latRad) * Math.sin(lngRad);
            
            const locationPosition = new THREE.Vector3(x, y, z);
            
            // Smooth camera animation
            const cameraDistance = 3.5; // Zoom in closer for better view
            const cameraPosition = locationPosition.clone().multiplyScalar(cameraDistance / locationPosition.length());
            
            // Animate camera smoothly
            const currentPosition = controlsRef.current.object.position.clone();
            const targetPosition = cameraPosition;
            
            // Simple animation
            const animateCamera = () => {
              if (!controlsRef.current) return;
              
              controlsRef.current.object.position.lerp(targetPosition, 0.1);
              controlsRef.current.target.lerp(locationPosition, 0.1);
              controlsRef.current.update();
              
              if (controlsRef.current.object.position.distanceTo(targetPosition) > 0.1) {
                requestAnimationFrame(animateCamera);
              }
            };
            animateCamera();
          }
          
          console.log('Successfully positioned camera at your location');
        } catch (error) {
          console.error('Error getting location name:', error);
          onLocationSelect(latitude, longitude, 'Current Location');
        }
        
        setIsGettingLocation(false);
      },
      async (error) => {
        console.error('GPS Geolocation error:', error);
        
        // Try IP-based location as fallback
        console.log('Trying IP-based location as fallback...');
        try {
          const ipLocation = await GEOCODING_API.getLocationByIP();
          if (ipLocation) {
            console.log('IP Location found:', ipLocation);
            setCurrentLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
            onLocationSelect(ipLocation.lat, ipLocation.lng, `${ipLocation.name} (Approximate)`);
            
            // Animate camera to IP location
            if (controlsRef.current) {
              const latRad = ipLocation.lat * (Math.PI / 180);
              const lngRad = ipLocation.lng * (Math.PI / 180);
              const radius = 2.05;
              
              const x = radius * Math.cos(latRad) * Math.cos(lngRad);
              const y = radius * Math.sin(latRad);
              const z = -radius * Math.cos(latRad) * Math.sin(lngRad);
              
              const locationPosition = new THREE.Vector3(x, y, z);
              const cameraDistance = 4; // Zoom out a bit more for IP location
              const cameraPosition = locationPosition.clone().multiplyScalar(cameraDistance / locationPosition.length());
              
              controlsRef.current.object.position.copy(cameraPosition);
              controlsRef.current.target.copy(locationPosition);
              controlsRef.current.update();
            }
            
            setIsGettingLocation(false);
            alert('GPS not available. Showing approximate location based on your internet connection.');
            return;
          }
        } catch (ipError) {
          console.error('IP geolocation also failed:', ipError);
        }
        
        // If both GPS and IP fail, show error
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get your current location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'GPS access denied. We tried to use your internet connection instead, but that also failed.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable from GPS or internet.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,    // Use GPS if available
        timeout: 15000,              // Wait up to 15 seconds
        maximumAge: 30000            // Accept cached location up to 30 seconds old
      }
    );
  };

  // Parse coordinates from various formats
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

  // Search for location using geocoding API or coordinate parsing
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
          
          // Animate camera to coordinates
          if (controlsRef.current) {
            const latRad = coords.lat * (Math.PI / 180);
            const lngRad = coords.lng * (Math.PI / 180);
            const radius = 2.05;
            
            const x = radius * Math.cos(latRad) * Math.cos(lngRad);
            const y = radius * Math.sin(latRad);
            const z = -radius * Math.cos(latRad) * Math.sin(lngRad);
            
            const locationPosition = new THREE.Vector3(x, y, z);
            const cameraDistance = 4;
            const cameraPosition = locationPosition.clone().multiplyScalar(cameraDistance / locationPosition.length());
            
            controlsRef.current.object.position.copy(cameraPosition);
            controlsRef.current.target.copy(locationPosition);
            controlsRef.current.update();
          }
          
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
        
        // Animate camera to searched location
        if (controlsRef.current) {
          const latRad = result.lat * (Math.PI / 180);
          const lngRad = result.lng * (Math.PI / 180);
          const radius = 2.05;
          
          const x = radius * Math.cos(latRad) * Math.cos(lngRad);
          const y = radius * Math.sin(latRad);
          const z = -radius * Math.cos(latRad) * Math.sin(lngRad);
          
          const locationPosition = new THREE.Vector3(x, y, z);
          const cameraDistance = 4;
          const cameraPosition = locationPosition.clone().multiplyScalar(cameraDistance / locationPosition.length());
          
          controlsRef.current.object.position.copy(cameraPosition);
          controlsRef.current.target.copy(locationPosition);
          controlsRef.current.update();
        }
        
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

  const handleEarthClick = (lat: number, lng: number, name?: string) => {
    console.log('Location selected:', { lat: lat.toFixed(4), lng: lng.toFixed(4), name });
    
    // Debug: Test known locations
    if (name === 'India') {
      console.log('India should be at:', { lat: 20.5937, lng: 78.9629 });
      console.log('Actual clicked:', { lat: lat.toFixed(4), lng: lng.toFixed(4) });
    }
    
    onLocationSelect(lat, lng, name);
  };

  // Track camera distance for zoom-based labels and globe rotation for compass
  const handleCameraChange = () => {
    if (controlsRef.current) {
      const distance = controlsRef.current.object.position.length();
      setCameraDistance(distance);
      
      // Calculate rotation for compass (azimuth angle around Y axis)
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      
      // Get the direction vector from target to camera
      const direction = camera.position.clone().sub(target).normalize();
      
      // Calculate azimuth angle (rotation around Y axis)
      const azimuth = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
      setGlobeRotation(azimuth);
    }
  };

  // Reset globe view to North orientation
  const resetGlobeView = () => {
    if (controlsRef.current) {
      // Reset camera to initial position facing North
      controlsRef.current.object.position.set(0, 0, 6);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Export weather analysis data
  const exportWeatherData = (format: 'csv' | 'json') => {
    if (!selectedLocation || !weatherProbabilities.length) return;

    const comfortIndex = calculateComfortIndex(weatherProbabilities);
    const locationName = selectedLocation.name || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`;
    
    const exportData = weatherProbabilities.map(prob => ({
      Location: locationName,
      Latitude: selectedLocation.lat.toFixed(6),
      Longitude: selectedLocation.lng.toFixed(6),
      EventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      Condition: prob.condition,
      Threshold: prob.threshold,
      Probability: (prob.probability / 100).toFixed(3),
      Trend: prob.trend,
      Confidence: prob.confidence.toFixed(2),
      ComfortIndex: comfortIndex,
      Dataset: 'MERRA-2, GPM IMERG (Simulated)',
      YearsAnalyzed: '1990-2024',
      GeneratedAt: new Date().toISOString()
    }));

    if (format === 'csv') {
      const csvHeaders = Object.keys(exportData[0]).join(',');
      const csvRows = exportData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `weather_risk_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_${eventDate && !isNaN(eventDate.getTime()) ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonContent = JSON.stringify({
        metadata: {
          location: locationName,
          coordinates: [selectedLocation.lat, selectedLocation.lng],
          eventDate: eventDate && !isNaN(eventDate.getTime()) ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          comfortIndex,
          analysisDate: new Date().toISOString(),
          dataSources: ['MERRA-2 (Temperature, Wind)', 'GPM IMERG (Precipitation)', 'Simulated Historical Analysis']
        },
        weatherRisks: exportData
      }, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `weather_analysis_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_${eventDate && !isNaN(eventDate.getTime()) ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-space z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading Earth...</p>
          </div>
        </div>
      )}
      
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        className="bg-gradient-space cursor-crosshair"
        onPointerMissed={() => {
          // Handle clicks that miss all objects
          document.body.style.cursor = 'crosshair';
        }}
      >
        <WeatherEffects weatherType={isWeatherEnabled ? selectedWeatherType : 'clear'} />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
        />
        
        <Earth 
          onClick={handleEarthClick}
          selectedLocation={selectedLocation}
          cameraDistance={cameraDistance}
          weatherType={isWeatherEnabled ? selectedWeatherType : 'clear'}
        />
        
        <OrbitControls 
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={10}
          rotateSpeed={0.8}
          zoomSpeed={0.6}
          autoRotate={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          onChange={handleCameraChange}
        />
      </Canvas>

      {/* Search Box - Minimal */}
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

      {/* Event Date Selector - Minimal */}
      <div className="absolute top-4 left-4 z-25">
        <div className="bg-card/70 backdrop-blur-sm border border-primary/20 rounded p-1 shadow-sm">
          <Input
            type="date"
            value={eventDate && !isNaN(eventDate.getTime()) ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                setEventDate(newDate);
                onEventDateSelect?.(newDate);
              }
            }}
            className="w-28 text-xs h-6 border-none bg-transparent"
          />
        </div>
      </div>

      {/* Current Location Button - Minimal */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          size="sm"
          className="bg-card/70 backdrop-blur-sm border-primary/20 hover:bg-primary/10 h-6 px-2"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
          ) : (
            <Locate className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">GPS</span>
        </Button>
      </div>





      {/* Minimal Weather Control Panel */}
      <div className="absolute top-4 left-4 z-30">
        <div className="bg-card/80 backdrop-blur-md border border-primary/30 rounded-lg p-2 shadow-md">
          {/* Compact Weather Toggle */}
          <div className="flex items-center gap-2">
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
            <div className="flex gap-1 mt-2">
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

      {/* Minimal Compass - positioned to be clearly visible */}
      <CompassComponent 
        className="absolute top-4 right-4 z-50" 
        rotation={globeRotation}
        onReset={resetGlobeView}
      />

      {/* Center crosshair - Simplified */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="w-2 h-2 border border-white/40 rounded-full bg-white/20"></div>
      </div>



      <style>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(99, 179, 237, 0.8));
        }
      `}</style>
    </div>
  );
}