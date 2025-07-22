import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cloud,
  Clock,
  Search,
  MapPin,
  Thermometer,
  Eye,
  Wind,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import PageNavigation from "@/components/PageNavigation";

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = "0e2bee11b747994db8a18e35ebd3f599";

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

interface LocationSuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const WeatherPage = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Debounced search for city suggestions
  const searchCitySuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );

      if (response.ok) {
        const data: LocationSuggestion[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } else {
        console.error(
          "Geocoding API error:",
          response.status,
          response.statusText
        );
        // Don't show error to user for failed suggestions, just hide them
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Failed to fetch city suggestions:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    setSelectedIndex(-1); // Reset selection when typing

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchCitySuggestions(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          // If no selection, use the regular form submit
          fetchWeather();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const displayName = suggestion.state
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;

    setCity(displayName);
    setShowSuggestions(false);
    setSuggestions([]);

    // Automatically fetch weather for selected location
    fetchWeatherByCoordinates(suggestion.lat, suggestion.lon, displayName);
  };

  const fetchWeatherByCoordinates = async (
    lat: number,
    lon: number,
    displayName: string
  ) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
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
      setError("Failed to fetch weather data. Please try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Using OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${OPENWEATHER_API_KEY}&units=metric`
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

      // Hide suggestions after successful search
      setShowSuggestions(false);
      setSuggestions([]);
    } catch (err) {
      setError(
        "Failed to fetch weather data. Please check the city name and try again."
      );
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
                  <p className="text-sm text-muted-foreground">
                    Current weather conditions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <PageNavigation />

              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {new Date().toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}{" "}
                  IST
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
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Search Weather
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter a city or state name to get current weather information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative max-w-md">
            <div className="flex gap-4">
              <div className="relative flex-1" ref={dropdownRef}>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter city or state name..."
                  value={city}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="pr-10"
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute z-50 w-full mt-1 bg-card border-border shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.name}-${suggestion.country}-${index}`}
                        className={`px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
                          index === selectedIndex
                            ? "bg-primary/10 border-primary/20"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {suggestion.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.state ? `${suggestion.state}, ` : ""}
                              {suggestion.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
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
                    <p className="text-2xl font-bold text-foreground">
                      {weatherData.temp}°C
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {weatherData.humidity}%
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {weatherData.wind_speed} m/s
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {weatherData.visibility} km
                    </p>
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
              <span>
                Last Updated: {new Date().toLocaleTimeString("en-IN")}
              </span>
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
