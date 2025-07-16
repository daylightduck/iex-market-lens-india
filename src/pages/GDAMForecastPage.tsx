import { useState } from "react";
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

// Generate mock forecast data for a day (96 time slots)
const generateForecastData = (date: Date) => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const timeSlot = hour * 4 + quarter;
      // Generate realistic price patterns (higher during peak hours)
      let basePrice = 3.8; // Slightly higher base for GDAM
      if (hour >= 6 && hour <= 10) basePrice = 5.5; // Morning peak
      if (hour >= 18 && hour <= 22) basePrice = 7.2; // Evening peak
      if (hour >= 23 || hour <= 5) basePrice = 2.3; // Night low
      
      const variation = (Math.random() - 0.5) * 2.2;
      const price = Math.max(1.7, basePrice + variation);
      
      // Generate confidence score (70-95%)
      const baseConfidence = 82; // Slightly lower for GDAM
      const confidenceVariation = (Math.random() - 0.5) * 22;
      const confidence = Math.max(70, Math.min(95, baseConfidence + confidenceVariation));
      
      data.push({
        hour,
        quarter,
        timeSlot,
        price: Number(price.toFixed(2)),
        confidence: Number(confidence.toFixed(1)),
        timeRange: `${hour.toString().padStart(2, '0')}:${(quarter * 15).toString().padStart(2, '0')} - ${hour.toString().padStart(2, '0')}:${((quarter + 1) * 15).toString().padStart(2, '0')}`
      });
    }
  }
  return data;
};

const GDAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 17)); // July 17, 2025
  const forecastData = generateForecastData(selectedDate);
  
  const maxPrice = Math.max(...forecastData.map(d => d.price));
  const minPrice = Math.min(...forecastData.map(d => d.price));
  const avgPrice = forecastData.reduce((sum, d) => sum + d.price, 0) / forecastData.length;
  
  const maxPriceSlot = forecastData.find(d => d.price === maxPrice);
  const minPriceSlot = forecastData.find(d => d.price === minPrice);

  const getPriceColor = (price: number) => {
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
    if (normalizedPrice <= 0.33) return "hsl(var(--success))";
    if (normalizedPrice <= 0.66) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getPriceColorClass = (price: number) => {
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
    if (normalizedPrice <= 0.33) return "bg-success/20 border-success/40";
    if (normalizedPrice <= 0.66) return "bg-warning/20 border-warning/40";
    return "bg-destructive/20 border-destructive/40";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  IEX Market Monitor
                </h1>
                <p className="text-xs text-muted-foreground">GDAM Forecast</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/dam-forecast">
              <Button variant="outline" className="bg-primary/10 border-primary/20 hover:bg-primary/20">
                DAM Dashboard
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title and Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Green Day-Ahead Market (GDAM) Forecast
            </h1>
            <p className="text-muted-foreground mt-1">
              96 time-slot price predictions for the selected day
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Forecast Date:
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Heatmap */}
          <div className="xl:col-span-3">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card/50 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Projected Heat Map
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success/40"></div>
                    <span>Low Price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-warning/40"></div>
                    <span>Medium Price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive/40"></div>
                    <span>High Price</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Hour labels */}
                  <div className="grid grid-cols-25 gap-1 text-xs text-muted-foreground">
                    <div></div> {/* Empty corner */}
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-center font-medium">
                        {i.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap grid */}
                  {Array.from({ length: 4 }, (_, quarterIndex) => (
                    <div key={quarterIndex} className="grid grid-cols-25 gap-1">
                      {/* Quarter label */}
                      <div className="text-xs text-muted-foreground font-medium flex items-center">
                        :{(quarterIndex * 15).toString().padStart(2, '0')}
                      </div>
                      
                      {/* Hour cells */}
                      {Array.from({ length: 24 }, (_, hourIndex) => {
                        const dataPoint = forecastData.find(
                          d => d.hour === hourIndex && d.quarter === quarterIndex
                        );
                        return (
                          <div
                            key={`${hourIndex}-${quarterIndex}`}
                            className={cn(
                              "relative h-12 rounded border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group",
                              getPriceColorClass(dataPoint?.price || 0)
                            )}
                            title={`${dataPoint?.timeRange} - ₹${dataPoint?.price}/kWh`}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-foreground">
                                ₹{dataPoint?.price}
                              </span>
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium">{dataPoint?.timeRange}</div>
                              <div className="text-xs text-muted-foreground">
                                Confidence: {dataPoint?.confidence}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Forecast Summary</h3>
            
            <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Max</p>
                    <p className="text-2xl font-bold text-destructive">₹{maxPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">at {maxPriceSlot?.timeRange}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Min</p>
                    <p className="text-2xl font-bold text-success">₹{minPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">at {minPriceSlot?.timeRange}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg</p>
                    <p className="text-2xl font-bold text-primary">₹{avgPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per kWh</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Confidence Scores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Confidence:</span>
                      <span className="font-medium">
                        {(forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Confidence:</span>
                      <span className="font-medium">
                        {Math.min(...forecastData.map(d => d.confidence)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Max Confidence:</span>
                      <span className="font-medium">
                        {Math.max(...forecastData.map(d => d.confidence)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GDAMForecastPage;