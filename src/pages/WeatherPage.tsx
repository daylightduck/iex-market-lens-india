import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cloud, Clock, Search, MapPin, Thermometer, Eye, Wind, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import PageNavigation from "@/components/PageNavigation";

interface WeatherData {
  name: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  visibility: number;
  wind_speed: number;
  description: string;
  icon: string;
}

const WeatherPage = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Using OpenWeatherMap API
      const API_KEY = "your_api_key_here"; // This would need to be set up properly
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error("City not found");
      }
      
      const data = await response.json();
      
      setWeatherData({
        name: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        visibility: Math.round(data.visibility / 1000),
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      });
    } catch (err) {
      setError("Failed to fetch weather data. Please check the city name and try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Weather Monitor
                  </h1>
                  <p className="text-sm text-muted-foreground">Current weather conditions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PageNavigation />
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })} IST
                </span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <Card className="p-6 bg-card border-border mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Search Weather</h2>
            <p className="text-sm text-muted-foreground">
              Enter a city or state name to get current weather information
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-md">
            <Input
              type="text"
              placeholder="Enter city or state name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </Card>

        {/* Weather Display */}
        {weatherData && (
          <Card className="p-6 bg-card border-border">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  {weatherData.name}, {weatherData.country}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weatherData.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Temperature */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Thermometer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold text-foreground">{weatherData.temp}°C</p>
                    <p className="text-xs text-muted-foreground">
                      Feels like {weatherData.feels_like}°C
                    </p>
                  </div>
                </div>
              </Card>

              {/* Humidity */}
              <Card className="p-4 bg-secondary/5 border-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Droplets className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-2xl font-bold text-foreground">{weatherData.humidity}%</p>
                  </div>
                </div>
              </Card>

              {/* Wind Speed */}
              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Wind className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                    <p className="text-2xl font-bold text-foreground">{weatherData.wind_speed} m/s</p>
                  </div>
                </div>
              </Card>

              {/* Visibility */}
              <Card className="p-4 bg-muted/5 border-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/20 rounded-lg">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visibility</p>
                    <p className="text-2xl font-bold text-foreground">{weatherData.visibility} km</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Indian Energy Exchange Weather Monitor.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Last Updated: {new Date().toLocaleTimeString('en-IN')}</span>
              <span>•</span>
              <span className="text-bullish">Live Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeatherPage;