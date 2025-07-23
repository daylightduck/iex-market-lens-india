import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactDatamaps from "react-india-states-map";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import PageNavigation from "@/components/PageNavigation";
import DashboardNavigation from "@/components/DashboardNavigation";

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = "0e2bee11b747994db8a18e35ebd3f599";

// Cache configuration
const CACHE_EXPIRY_MINUTES = 15;
const CACHE_KEY_PREFIX = "weather_cache_";
const ALL_STATES_CACHE_KEY = "all_states_weather_data";

// Cache utility functions
const getCacheKey = (location: string) => `${CACHE_KEY_PREFIX}${location}`;

const isValidCache = (timestamp: number) => {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_MINUTES * 60 * 1000; // 15 minutes in milliseconds
  return now - timestamp < expiryTime;
};

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (isValidCache(timestamp)) {
        return data;
      } else {
        // Remove expired cache
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error reading from cache:", error);
  }
  return null;
};

const setCachedData = (key: string, data: unknown) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};

const clearAllCache = () => {
  try {
    // Clear all weather cache entries
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX) || key === ALL_STATES_CACHE_KEY) {
        localStorage.removeItem(key);
      }
    });
    console.log("Weather cache cleared");
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

// Indian states mapping for the map library
const INDIAN_STATES = [
  "Andaman & Nicobar Island",
  "Andhra Pradesh",
  "Arunanchal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadara & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Function to get temperature-based color
const getTemperatureColor = (
  temp: number | null,
  isHighlighted: boolean = false
) => {
  if (temp === null) return isHighlighted ? "#94A3B8" : "#E5E7EB"; // Gray for no data

  if (isHighlighted) {
    // Brighter colors for highlighted state
    if (temp <= 10) return "#1E40AF"; // Dark blue
    if (temp <= 20) return "#3B82F6"; // Blue
    if (temp <= 30) return "#10B981"; // Green
    if (temp <= 35) return "#F59E0B"; // Orange
    return "#DC2626"; // Red
  } else {
    // Muted colors for normal states
    if (temp <= 10) return "#DBEAFE"; // Light blue
    if (temp <= 20) return "#BFDBFE"; // Light blue
    if (temp <= 30) return "#D1FAE5"; // Light green
    if (temp <= 35) return "#FED7AA"; // Light orange
    return "#FECACA"; // Light red
  }
};

// Function to normalize state names for comparison
const normalizeStateName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/state$/, "")
    .replace(/pradesh$/, "pradesh")
    .replace(/^west\s+/, "west ");
};

// Function to find matching Indian state for search results
const findMatchingIndianState = (searchName: string, country: string) => {
  if (country !== "IN") return null;

  const normalizedSearch = normalizeStateName(searchName);

  return INDIAN_STATES.find((state) => {
    const normalizedState = normalizeStateName(state);
    return (
      normalizedState === normalizedSearch ||
      normalizedState.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedState) ||
      // Handle common name variations
      (normalizedSearch === "mumbai" &&
        normalizedState.includes("maharashtra")) ||
      (normalizedSearch === "bangalore" &&
        normalizedState.includes("karnataka")) ||
      (normalizedSearch === "chennai" &&
        normalizedState.includes("tamil nadu")) ||
      (normalizedSearch === "kolkata" &&
        normalizedState.includes("west bengal")) ||
      (normalizedSearch === "hyderabad" &&
        normalizedState.includes("telangana")) ||
      (normalizedSearch === "pune" && normalizedState.includes("maharashtra"))
    );
  });
};

// State capital mapping for better geocoding results
const STATE_CAPITALS = {
  "Andhra Pradesh": "Amaravati",
  "Arunachal Pradesh": "Itanagar",
  Assam: "Guwahati",
  Bihar: "Patna",
  Chhattisgarh: "Raipur",
  Goa: "Panaji",
  Gujarat: "Gandhinagar",
  Haryana: "Chandigarh",
  "Himachal Pradesh": "Shimla",
  Jharkhand: "Ranchi",
  Karnataka: "Bangalore",
  Kerala: "Thiruvananthapuram",
  "Madhya Pradesh": "Bhopal",
  Maharashtra: "Mumbai",
  Manipur: "Imphal",
  Meghalaya: "Shillong",
  Mizoram: "Aizawl",
  Nagaland: "Kohima",
  Odisha: "Bhubaneswar",
  Punjab: "Chandigarh",
  Rajasthan: "Jaipur",
  Sikkim: "Gangtok",
  "Tamil Nadu": "Chennai",
  Telangana: "Hyderabad",
  Tripura: "Agartala",
  "Uttar Pradesh": "Lucknow",
  Uttarakhand: "Dehradun",
  "West Bengal": "Kolkata",
  Delhi: "New Delhi",
  "Jammu & Kashmir": "Srinagar",
  Chandigarh: "Chandigarh",
  "Dadara & Nagar Haveli": "Silvassa",
  "Daman & Diu": "Daman",
  Lakshadweep: "Kavaratti",
  Puducherry: "Puducherry",
  "Andaman & Nicobar Island": "Port Blair",
};

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

interface StateWeatherData {
  [stateName: string]: {
    temp: number;
    description: string;
    humidity: number;
    windSpeed: number;
  };
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
  const [highlightedState, setHighlightedState] = useState<string | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(
    null
  );
  const [stateWeatherData, setStateWeatherData] = useState<StateWeatherData>(
    {}
  );
  const [mapLoading, setMapLoading] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing weather data..."
  );
  const [isDataFromCache, setIsDataFromCache] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load weather data for all Indian states on page load
  useEffect(() => {
    const loadAllStatesWeatherData = async () => {
      setInitialLoading(true);
      setLoadingProgress(0);
      setLoadingMessage("Checking cached weather data...");

      // Check if we have cached data for all states
      const cachedAllStatesData = getCachedData(ALL_STATES_CACHE_KEY);
      if (cachedAllStatesData) {
        setLoadingMessage("Loading cached weather data...");
        setStateWeatherData(cachedAllStatesData);
        setIsDataFromCache(true);
        setLoadingProgress(100);
        setLoadingMessage("Weather data loaded from cache!");
        setTimeout(() => {
          setInitialLoading(false);
        }, 500);
        return;
      }

      setLoadingMessage("Fetching fresh weather data for all Indian states...");

      // Get all states with their capitals
      const stateCapitalPairs = Object.entries(STATE_CAPITALS);
      const totalStates = stateCapitalPairs.length;
      let completedStates = 0;
      const newStateWeatherData: StateWeatherData = {};

      // Process states in batches to avoid overwhelming the API
      const batchSize = 5; // Process 5 states at a time
      for (let i = 0; i < stateCapitalPairs.length; i += batchSize) {
        const batch = stateCapitalPairs.slice(i, i + batchSize);

        // Process current batch
        await Promise.all(
          batch.map(async ([stateName, capitalName]) => {
            try {
              setLoadingMessage(`Loading weather for ${stateName}...`);

              // Check individual state cache first
              const cacheKey = getCacheKey(`${stateName}_${capitalName}`);
              const cachedStateData = getCachedData(cacheKey);

              if (cachedStateData) {
                newStateWeatherData[stateName] = cachedStateData;
              } else {
                // First, get coordinates for the state capital
                const geoResponse = await fetch(
                  `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
                    `${capitalName}, ${stateName}, India`
                  )}&limit=1&appid=${OPENWEATHER_API_KEY}`
                );

                if (geoResponse.ok) {
                  const geoData = await geoResponse.json();
                  if (geoData.length > 0) {
                    const location = geoData[0];

                    // Get weather data using coordinates
                    const weatherResponse = await fetch(
                      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
                    );

                    if (weatherResponse.ok) {
                      const weatherData = await weatherResponse.json();

                      const stateWeather = {
                        temp: Math.round(weatherData.main.temp),
                        description: weatherData.weather[0].description,
                        humidity: weatherData.main.humidity,
                        windSpeed: weatherData.wind.speed,
                      };

                      // Cache individual state data
                      setCachedData(cacheKey, stateWeather);
                      newStateWeatherData[stateName] = stateWeather;
                    }
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to fetch weather for ${stateName}:`, err);
            }

            completedStates++;
            const progress = Math.round((completedStates / totalStates) * 100);
            setLoadingProgress(progress);
          })
        );

        // Small delay between batches to respect API rate limits
        if (i + batchSize < stateCapitalPairs.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Cache all states data
      setCachedData(ALL_STATES_CACHE_KEY, newStateWeatherData);
      setStateWeatherData(newStateWeatherData);
      setIsDataFromCache(false);

      setLoadingMessage("Weather data loaded successfully!");
      setTimeout(() => {
        setInitialLoading(false);
      }, 500);
    };

    loadAllStatesWeatherData();
  }, []);

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

  // Fetch weather data for a specific state
  const fetchStateWeather = async (
    stateName: string,
    lat: number,
    lon: number
  ) => {
    try {
      // Check cache first
      const cacheKey = getCacheKey(`${stateName}_coords_${lat}_${lon}`);
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setStateWeatherData((prev) => ({
          ...prev,
          [stateName]: cachedData,
        }));
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (response.ok) {
        const data = await response.json();
        const weatherData = {
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        };

        // Cache the data
        setCachedData(cacheKey, weatherData);

        setStateWeatherData((prev) => ({
          ...prev,
          [stateName]: weatherData,
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch weather for ${stateName}:`, err);
    }
  };

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

    // Find and highlight the matching Indian state
    if (suggestion.country === "IN") {
      const matchingState =
        findMatchingIndianState(suggestion.name, suggestion.country) ||
        findMatchingIndianState(suggestion.state || "", suggestion.country);

      if (matchingState) {
        setHighlightedState(matchingState);
        // Fetch weather data for the highlighted state
        fetchStateWeather(matchingState, suggestion.lat, suggestion.lon);
      }
    }

    // Automatically fetch weather for selected location
    fetchWeatherByCoordinates(suggestion.lat, suggestion.lon, displayName);
  };

  // Create the region data for the map
  const createMapData = () => {
    const mapData: {
      [key: string]: { value: number; color: string; hoverColor?: string };
    } = {};

    INDIAN_STATES.forEach((state) => {
      const weatherData = stateWeatherData[state];
      const temp = weatherData?.temp || null;
      const isHighlighted = state === highlightedState;

      mapData[state] = {
        value: temp || 0,
        color: getTemperatureColor(temp, isHighlighted),
        hoverColor: isHighlighted ? getTemperatureColor(temp, true) : "#6366F1",
      };
    });

    return mapData;
  };

  // Handle state click on map
  const handleStateClick = async (
    data: { value: number; color: string },
    stateName: string
  ) => {
    setHighlightedState(stateName);
    setCity(stateName);

    // If we don't have weather data for this state, try to fetch it
    if (!stateWeatherData[stateName]) {
      setMapLoading(true);
      // Use state capital for more accurate geocoding
      const capitalCity =
        STATE_CAPITALS[stateName as keyof typeof STATE_CAPITALS] || stateName;
      const searchQuery = `${capitalCity}, ${stateName}, India`;

      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            searchQuery
          )}&limit=1&appid=${OPENWEATHER_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const location = data[0];
            await fetchStateWeather(stateName, location.lat, location.lon);
            await fetchWeatherByCoordinates(
              location.lat,
              location.lon,
              stateName
            );
          }
        }
      } catch (err) {
        console.error(`Failed to fetch data for ${stateName}:`, err);
      } finally {
        setMapLoading(false);
      }
    } else {
      // If we have weather data, just update the main weather display
      const stateData = stateWeatherData[stateName];

      setSelectedStateName(stateName);
      setWeatherData({
        name: stateName, // Show state name instead of capital city name
        country: "IN",
        temp: stateData.temp,
        feels_like: stateData.temp, // We don't have feels_like in state data, so use temp
        humidity: stateData.humidity,
        visibility: 10, // Default value as we don't store this
        wind_speed: stateData.windSpeed,
        description: stateData.description,
        icon: "01d", // Default icon
      });
    }
  };

  const fetchWeatherByCoordinates = async (
    lat: number,
    lon: number,
    displayName: string
  ) => {
    setLoading(true);
    setError("");

    try {
      // Check cache first
      const cacheKey = getCacheKey(`coords_${lat}_${lon}`);
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setWeatherData({
          ...cachedData,
          name: displayName, // Use the provided display name
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      const weatherData = {
        name: displayName, // Use the provided display name instead of API response name
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        visibility: Math.round(data.visibility / 1000),
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };

      // Cache the data (without the custom display name for reusability)
      const cacheableData = {
        ...weatherData,
        name: data.name, // Store original name for cache reusability
      };
      setCachedData(cacheKey, cacheableData);

      setWeatherData(weatherData);
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
      // Check cache first
      const cacheKey = getCacheKey(`city_${city.toLowerCase()}`);
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setWeatherData(cachedData);

        // If it's an Indian location, try to highlight the corresponding state
        if (cachedData.country === "IN") {
          const matchingState = findMatchingIndianState(cachedData.name, "IN");
          if (matchingState) {
            setHighlightedState(matchingState);
            // Update state weather data from cache if available
            const stateCacheKey = getCacheKey(`${matchingState}_state`);
            const cachedStateData = getCachedData(stateCacheKey);
            if (cachedStateData) {
              setStateWeatherData((prev) => ({
                ...prev,
                [matchingState]: cachedStateData,
              }));
            }
          }
        }

        // Hide suggestions after successful cache hit
        setShowSuggestions(false);
        setSuggestions([]);
        setLoading(false);
        return;
      }

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

      const weatherData = {
        name: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        visibility: Math.round(data.visibility / 1000),
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };

      // Cache the data
      setCachedData(cacheKey, weatherData);
      setWeatherData(weatherData);

      // If it's an Indian location, try to highlight the corresponding state
      if (data.sys.country === "IN") {
        const matchingState = findMatchingIndianState(data.name, "IN");
        if (matchingState) {
          setHighlightedState(matchingState);
          // Update state weather data
          const stateWeatherData = {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
          };

          // Cache state data
          const stateCacheKey = getCacheKey(`${matchingState}_state`);
          setCachedData(stateCacheKey, stateWeatherData);

          setStateWeatherData((prev) => ({
            ...prev,
            [matchingState]: stateWeatherData,
          }));
        }
      }

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

  const handleRefreshData = () => {
    clearAllCache();
    setIsDataFromCache(false);
    // Reload the page to fetch fresh data
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Screen */}
      {initialLoading && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[100] flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 p-8 bg-card border-border shadow-2xl">
            <div className="text-center space-y-6">
              {/* Loading Icon */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>

                  {/* Inner pulsing circle */}
                  <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Loading Text */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Loading Weather Data
                </h2>
                <p className="text-sm text-muted-foreground">
                  {loadingMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingProgress}% Complete
                </p>
              </div>

              {/* Loading Details */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Fetching weather data for all Indian states...</p>
                <p>This may take a moment for the first load</p>
              </div>
            </div>
          </Card>
        </div>
      )}

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
        <DashboardNavigation />
        <PageNavigation />

              {/* Cache Status Indicator */}
              {isDataFromCache && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-primary">
                    Cached Data (15min)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshData}
                    className="h-6 px-2 text-xs text-primary hover:bg-primary/20"
                  >
                    Refresh
                  </Button>
                </div>
              )}

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

        {/* India Weather Map */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Map Section */}
          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  India Weather Map
                  {mapLoading && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                </CardTitle>
                {highlightedState && (
                  <p className="text-center text-sm text-muted-foreground">
                    Highlighted:{" "}
                    <span className="font-medium text-primary">
                      {highlightedState}
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6 h-[800px]">
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      aspectRatio: "4/3",
                    }}
                  >
                    <ReactDatamaps
                      regionData={createMapData()}
                      mapLayout={{
                        hoverTitle: "State",
                        noDataColor: "#E5E7EB",
                        borderColor: "#ffffff",
                        hoverBorderColor: hoveredState
                          ? getTemperatureColor(
                              stateWeatherData[hoveredState]?.temp || null,
                              true
                            )
                          : "#4F46E5",
                        hoverColor: hoveredState
                          ? getTemperatureColor(
                              stateWeatherData[hoveredState]?.temp || null,
                              true
                            )
                          : "#4F46E5",
                      }}
                      hoverComponent={({
                        value,
                      }: {
                        value: { name: string };
                      }) => {
                        const weatherData = stateWeatherData[value.name];

                        // Update hovered state for dynamic color
                        if (hoveredState !== value.name) {
                          setHoveredState(value.name);
                        }

                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {value.name}
                            </p>
                            {weatherData ? (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Thermometer className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm font-medium">
                                    {weatherData.temp}°C
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Droplets className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs">
                                    {weatherData.humidity}% humidity
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                  {weatherData.description}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                Click to load weather data
                              </p>
                            )}
                          </div>
                        );
                      }}
                      onClick={handleStateClick}
                      onMouseEnter={(stateName: string) =>
                        setHoveredState(stateName)
                      }
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Temperature Legend */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  Temperature Scale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    temp: "≤ 10°C",
                    color: getTemperatureColor(5),
                    label: "Very Cold",
                  },
                  {
                    temp: "11-20°C",
                    color: getTemperatureColor(15),
                    label: "Cold",
                  },
                  {
                    temp: "21-30°C",
                    color: getTemperatureColor(25),
                    label: "Pleasant",
                  },
                  {
                    temp: "31-35°C",
                    color: getTemperatureColor(33),
                    label: "Hot",
                  },
                  {
                    temp: "> 35°C",
                    color: getTemperatureColor(40),
                    label: "Very Hot",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.temp}</span>
                      <div className="text-xs text-muted-foreground">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
                {highlightedState && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary">
                      Selected: {highlightedState}
                    </p>
                    {stateWeatherData[highlightedState] && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>{stateWeatherData[highlightedState].temp}°C</p>
                        <p className="capitalize">
                          {stateWeatherData[highlightedState].description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-sm">
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>• Search for a city to highlight its state</p>
                  <p>• Click on any state to view weather</p>
                  <p>• Hover over states for quick info</p>
                  <p>• Colors represent temperature ranges</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
