import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { Earth3DGlobe } from '@/components/Earth3DGlobe';
import { Map2D } from '@/components/Map2D';
import { DateThresholdSelector } from '@/components/DateThresholdSelector';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { WeatherEffects } from '@/components/WeatherEffects';
import { CurrentWeatherWidget } from '@/components/CurrentWeatherWidget';
import { WeatherAnalysisPanel } from '@/components/WeatherAnalysisPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapIcon, Globe, ArrowLeft, Rocket, Cloud, Sun, CloudRain, CloudSnow, Zap, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WeatherAnalysisResponse {
  location: { latitude: number; longitude: number };
  event_date: string;
  comfort_index: number;
  probabilities: Array<{
    condition: string;
    probability: number;
    threshold: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    historical_mean: number;
    trend_slope: number;
    p_value: number;
  }>;
  alternative_dates: Array<{
    date: string;
    comfort_index: number;
    offset_days: number;
    recommendation: 'Better' | 'Monitor' | 'Risky';
  }>;
  metadata: {
    datasets_used: string[];
    years_analyzed: string;
    analysis_date: string;
    confidence_level: string;
    data_window: string;
  };
}

const Index = () => {
  const { toast } = useToast();
  const [view, setView] = useState<'hero' | 'app'>('hero');
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [weatherType, setWeatherType] = useState<'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'>('clear');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  const [thresholds, setThresholds] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<WeatherAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    setSelectedLocation({ lat, lng, name });
  };

  const handleExportData = (format: 'csv' | 'json') => {
    if (!analysisData) return;

    const data = {
      location: analysisData.location,
      event_date: analysisData.event_date,
      comfort_index: analysisData.comfort_index,
      probabilities: analysisData.probabilities,
      alternative_dates: analysisData.alternative_dates,
      metadata: analysisData.metadata
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Condition', 'Probability (%)', 'Threshold', 'Trend', 'Confidence'];
      const csvRows = analysisData.probabilities.map(prob => [
        prob.condition,
        prob.probability.toString(),
        prob.threshold,
        prob.trend,
        prob.confidence.toString()
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-analysis-${analysisData.event_date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as JSON
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-analysis-${analysisData.event_date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Complete",
      description: `Weather analysis data exported as ${format.toUpperCase()}.`,
    });
  };

  const handleAnalyze = async () => {
    if (!selectedLocation || !selectedDate || !thresholds) {
      toast({
        title: "Missing Information",
        description: "Please select a location, date, and set your thresholds.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Ensure we're using the most current date format
      const eventDate = selectedDate.toISOString().split('T')[0];
      const isToday = eventDate === new Date().toISOString().split('T')[0];
      
      const requestData = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        event_date: eventDate,
        thresholds: {
          hot_temp: thresholds.temperature?.enabled ? thresholds.temperature.value : 32.0,
          cold_temp: 0.0, // We don't have cold temp in the UI yet, using default
          precipitation: thresholds.precipitation?.enabled ? thresholds.precipitation.value : 5.0,
          wind_speed: thresholds.wind?.enabled ? thresholds.wind.value : 15.0
        },
        // Add flag to indicate if this is for today (for real-time data)
        is_current_date: isToday
      };

      console.log('Sending weather analysis request:', requestData);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WeatherAnalysisResponse = await response.json();
      console.log('Received weather analysis:', data);
      
      setAnalysisData(data);
      setShowResults(true);
      
      toast({
        title: "Analysis Complete!",
        description: `Weather risk analysis completed for ${selectedLocation.name || 'your location'}.`,
      });
      
    } catch (error) {
      console.error('Failed to fetch weather analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to connect to the weather analysis service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (view === 'hero') {
    return <HeroSection onGetStarted={() => setView('app')} />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-space">
      <WeatherEffects type={weatherType} intensity={30} />
      
      {/* Enhanced Background Coverage */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-purple-900/95 -z-10"></div>
      <div className="fixed inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-black/60 -z-10"></div>
      
      {/* Header */}
      <header className="relative z-30 border-b border-primary/20 bg-card/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('hero')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {/* NASA & Bluesoft Icons */}
            <div className="flex items-center gap-3">
              <img 
                src="/NSAC@2025 Harohalli icon.svg" 
                alt="NASA Space Apps Challenge 2025 - Harohalli" 
                className="h-12 w-12"
              />
              <img 
                src="/Bluesoft icon.svg" 
                alt="Bluesoft Team" 
                className="h-12 w-12"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Weather Parade Predictor
              </h1>
            </div>
          </div>
          
          {/* Map mode toggle */}
          <div className="flex items-center gap-2 p-1 bg-card/50 rounded-lg">
            <Button
              variant={mapMode === '3d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapMode('3d')}
            >
              <Globe className="h-4 w-4 mr-1" />
              3D Globe
            </Button>
            <Button
              variant={mapMode === '2d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapMode('2d')}
            >
              <MapIcon className="h-4 w-4 mr-1" />
              2D Map
            </Button>
          </div>
          
          {/* Weather type selector */}
          <div className="flex gap-1">
            <Button variant={weatherType === 'clear' ? 'default' : 'ghost'} size="icon" onClick={() => setWeatherType('clear')}>
              <Sun className="h-4 w-4" />
            </Button>
            <Button variant={weatherType === 'cloudy' ? 'default' : 'ghost'} size="icon" onClick={() => setWeatherType('cloudy')}>
              <Cloud className="h-4 w-4" />
            </Button>
            <Button variant={weatherType === 'rainy' ? 'default' : 'ghost'} size="icon" onClick={() => setWeatherType('rainy')}>
              <CloudRain className="h-4 w-4" />
            </Button>
            <Button variant={weatherType === 'stormy' ? 'default' : 'ghost'} size="icon" onClick={() => setWeatherType('stormy')}>
              <Zap className="h-4 w-4" />
            </Button>
            <Button variant={weatherType === 'snowy' ? 'default' : 'ghost'} size="icon" onClick={() => setWeatherType('snowy')}>
              <CloudSnow className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-20 w-full min-h-screen">
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-900/10 via-transparent to-purple-900/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
        {!showResults ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Panel - Bento Grid for Controls */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 h-[700px]">
                {/* Current Weather - Top Left, Tall */}
                <div className="col-span-2 row-span-2">
                  {selectedLocation ? (
                    <CurrentWeatherWidget
                      latitude={selectedLocation.lat}
                      longitude={selectedLocation.lng}
                      locationName={selectedLocation.name}
                    />
                  ) : (
                    <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl p-6 h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-4">📍</div>
                        <h3 className="text-lg font-semibold mb-2">Select Location</h3>
                        <p className="text-sm">
                          Click on the map to select a location for weather analysis.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Date Selector - Bottom Left */}
                <div className="col-span-1 row-span-1">
                  <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl p-4 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-sm">Event Date</h3>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal text-xs",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {selectedDate ? format(selectedDate, "MMM dd") : <span>Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedDate(new Date())}
                          >
                            📅 Today
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </Card>
                </div>

                {/* Analyze Button - Bottom Right */}
                <div className="col-span-1 row-span-1">
                  <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl p-4 h-full flex items-center justify-center">
                    {selectedLocation && thresholds ? (
                      <Button
                        onClick={handleAnalyze}
                        variant="hero"
                        size="sm"
                        className="w-full h-full"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            <span className="text-xs">Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-1 h-4 w-4" />
                            <span className="text-xs">Analyze Risk</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Rocket className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Select location & set thresholds</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Weather Thresholds - Bottom Full Width */}
                <div className="col-span-2 row-span-2">
                  <DateThresholdSelector
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onThresholdsChange={setThresholds}
                  />
                </div>
              </div>
            </div>

            {/* Center Panel - Map (Keep as is) */}
            <div className="lg:col-span-6">
              <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="h-[700px]">
                  {mapMode === '3d' ? (
                    <Earth3DGlobe
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation || undefined}
                      weatherType={weatherType}
                    />
                  ) : (
                    <Map2D
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation || undefined}
                      weatherType={weatherType}
                    />
                  )}
                </div>
              </Card>
              
              {selectedLocation && (
                <Card className="mt-4 p-4 border-primary/30 bg-card/95 backdrop-blur-xl shadow-lg">
                  <p className="text-sm text-muted-foreground">Selected Location:</p>
                  <p className="font-semibold">
                    {selectedLocation.name || `${selectedLocation.lat.toFixed(4)}°, ${selectedLocation.lng.toFixed(4)}°`}
                  </p>
                </Card>
              )}
            </div>

            {/* Right Panel - Analysis Results (Keep as is) */}
            <div className="lg:col-span-3">
              {analysisData && analysisData.probabilities.length > 0 ? (
                <WeatherAnalysisPanel
                  weatherProbabilities={analysisData.probabilities}
                  comfortIndex={analysisData.comfort_index}
                  onExportData={handleExportData}
                  isVisible={true}
                  eventDate={analysisData.event_date}
                />
              ) : (
                <Card className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-xl p-6 h-[700px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-4xl mb-4">🌦️</div>
                    <h3 className="text-lg font-semibold mb-2">Weather Analysis</h3>
                    <p className="text-sm">
                      Select a location and date, then click "Analyze Weather Risk" to see detailed weather predictions and comfort analysis.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowResults(false)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Selection
            </Button>
            
            <WeatherDashboard
              location={selectedLocation!}
              date={selectedDate}
              analysisData={analysisData || undefined}
            />
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
