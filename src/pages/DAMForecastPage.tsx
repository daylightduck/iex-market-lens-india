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
import PageNavigation from "@/components/PageNavigation";
import DashboardNavigation from "@/components/DashboardNavigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Real DAM forecast data from July 14-21, 2025
const damForecastData: { [key: string]: Array<{ hour: number; avgPrice: number }> } = {
  "2025-07-14": [
    { hour: 0, avgPrice: 8527.31 }, { hour: 1, avgPrice: 5878.47 }, { hour: 2, avgPrice: 4863.93 }, { hour: 3, avgPrice: 4446.22 },
    { hour: 4, avgPrice: 4324.84 }, { hour: 5, avgPrice: 4452.18 }, { hour: 6, avgPrice: 4306.21 }, { hour: 7, avgPrice: 3354.18 },
    { hour: 8, avgPrice: 2783.92 }, { hour: 9, avgPrice: 2394.73 }, { hour: 10, avgPrice: 2246.72 }, { hour: 11, avgPrice: 2237.29 },
    { hour: 12, avgPrice: 2216.75 }, { hour: 13, avgPrice: 2144.41 }, { hour: 14, avgPrice: 2387.98 }, { hour: 15, avgPrice: 2632.50 },
    { hour: 16, avgPrice: 3083.21 }, { hour: 17, avgPrice: 3490.38 }, { hour: 18, avgPrice: 4710.00 }, { hour: 19, avgPrice: 8803.43 },
    { hour: 20, avgPrice: 9522.39 }, { hour: 21, avgPrice: 9905.75 }, { hour: 22, avgPrice: 9909.22 }, { hour: 23, avgPrice: 9647.22 }
  ],
  "2025-07-15": [
    { hour: 0, avgPrice: 7326.76 }, { hour: 1, avgPrice: 4949.17 }, { hour: 2, avgPrice: 4221.53 }, { hour: 3, avgPrice: 4091.90 },
    { hour: 4, avgPrice: 4090.26 }, { hour: 5, avgPrice: 4543.42 }, { hour: 6, avgPrice: 4873.41 }, { hour: 7, avgPrice: 3506.68 },
    { hour: 8, avgPrice: 2891.49 }, { hour: 9, avgPrice: 2884.37 }, { hour: 10, avgPrice: 2673.47 }, { hour: 11, avgPrice: 2564.49 },
    { hour: 12, avgPrice: 2594.47 }, { hour: 13, avgPrice: 2541.89 }, { hour: 14, avgPrice: 2709.77 }, { hour: 15, avgPrice: 3044.93 },
    { hour: 16, avgPrice: 3168.99 }, { hour: 17, avgPrice: 3438.24 }, { hour: 18, avgPrice: 5819.20 }, { hour: 19, avgPrice: 9459.81 },
    { hour: 20, avgPrice: 9802.10 }, { hour: 21, avgPrice: 9883.28 }, { hour: 22, avgPrice: 9886.62 }, { hour: 23, avgPrice: 9715.05 }
  ],
  "2025-07-16": [
    { hour: 0, avgPrice: 5255.17 }, { hour: 1, avgPrice: 4428.83 }, { hour: 2, avgPrice: 3987.86 }, { hour: 3, avgPrice: 3859.29 },
    { hour: 4, avgPrice: 3779.26 }, { hour: 5, avgPrice: 3908.06 }, { hour: 6, avgPrice: 4328.60 }, { hour: 7, avgPrice: 3445.13 },
    { hour: 8, avgPrice: 2827.54 }, { hour: 9, avgPrice: 2739.66 }, { hour: 10, avgPrice: 2544.08 }, { hour: 11, avgPrice: 2510.04 },
    { hour: 12, avgPrice: 2467.19 }, { hour: 13, avgPrice: 2370.45 }, { hour: 14, avgPrice: 2557.62 }, { hour: 15, avgPrice: 2864.36 },
    { hour: 16, avgPrice: 3020.33 }, { hour: 17, avgPrice: 3261.22 }, { hour: 18, avgPrice: 4969.80 }, { hour: 19, avgPrice: 9640.11 },
    { hour: 20, avgPrice: 9835.92 }, { hour: 21, avgPrice: 9865.02 }, { hour: 22, avgPrice: 9870.36 }, { hour: 23, avgPrice: 9820.99 }
  ],
  "2025-07-17": [
    { hour: 0, avgPrice: 5265.37 }, { hour: 1, avgPrice: 4190.82 }, { hour: 2, avgPrice: 4053.52 }, { hour: 3, avgPrice: 3939.35 },
    { hour: 4, avgPrice: 3989.52 }, { hour: 5, avgPrice: 4703.06 }, { hour: 6, avgPrice: 5528.52 }, { hour: 7, avgPrice: 3351.96 },
    { hour: 8, avgPrice: 2795.19 }, { hour: 9, avgPrice: 2574.66 }, { hour: 10, avgPrice: 2263.80 }, { hour: 11, avgPrice: 2198.22 },
    { hour: 12, avgPrice: 2154.06 }, { hour: 13, avgPrice: 2081.23 }, { hour: 14, avgPrice: 2269.17 }, { hour: 15, avgPrice: 2724.17 },
    { hour: 16, avgPrice: 2952.84 }, { hour: 17, avgPrice: 3204.63 }, { hour: 18, avgPrice: 4632.09 }, { hour: 19, avgPrice: 9483.85 },
    { hour: 20, avgPrice: 9784.62 }, { hour: 21, avgPrice: 9819.19 }, { hour: 22, avgPrice: 9823.16 }, { hour: 23, avgPrice: 9524.95 }
  ],
  "2025-07-18": [
    { hour: 0, avgPrice: 8607.71 }, { hour: 1, avgPrice: 6111.41 }, { hour: 2, avgPrice: 5369.95 }, { hour: 3, avgPrice: 4351.36 },
    { hour: 4, avgPrice: 4411.02 }, { hour: 5, avgPrice: 7911.09 }, { hour: 6, avgPrice: 7802.55 }, { hour: 7, avgPrice: 3719.07 },
    { hour: 8, avgPrice: 2885.81 }, { hour: 9, avgPrice: 2995.07 }, { hour: 10, avgPrice: 2682.51 }, { hour: 11, avgPrice: 2623.14 },
    { hour: 12, avgPrice: 2535.77 }, { hour: 13, avgPrice: 2367.73 }, { hour: 14, avgPrice: 2860.18 }, { hour: 15, avgPrice: 3101.59 },
    { hour: 16, avgPrice: 3206.14 }, { hour: 17, avgPrice: 3348.14 }, { hour: 18, avgPrice: 5498.00 }, { hour: 19, avgPrice: 9788.86 },
    { hour: 20, avgPrice: 9807.30 }, { hour: 21, avgPrice: 9812.38 }, { hour: 22, avgPrice: 9820.60 }, { hour: 23, avgPrice: 9722.72 }
  ],
  "2025-07-19": [
    { hour: 0, avgPrice: 5390.81 }, { hour: 1, avgPrice: 4602.28 }, { hour: 2, avgPrice: 4072.04 }, { hour: 3, avgPrice: 3731.96 },
    { hour: 4, avgPrice: 3658.42 }, { hour: 5, avgPrice: 4331.45 }, { hour: 6, avgPrice: 4397.89 }, { hour: 7, avgPrice: 3022.96 },
    { hour: 8, avgPrice: 2411.21 }, { hour: 9, avgPrice: 2167.70 }, { hour: 10, avgPrice: 1850.17 }, { hour: 11, avgPrice: 1764.51 },
    { hour: 12, avgPrice: 1684.53 }, { hour: 13, avgPrice: 1677.46 }, { hour: 14, avgPrice: 2024.43 }, { hour: 15, avgPrice: 2320.12 },
    { hour: 16, avgPrice: 2580.16 }, { hour: 17, avgPrice: 3152.54 }, { hour: 18, avgPrice: 3669.81 }, { hour: 19, avgPrice: 6810.87 },
    { hour: 20, avgPrice: 8108.81 }, { hour: 21, avgPrice: 8755.05 }, { hour: 22, avgPrice: 8927.97 }, { hour: 23, avgPrice: 8290.67 }
  ],
  "2025-07-20": [
    { hour: 0, avgPrice: 5390.81 }, { hour: 1, avgPrice: 4602.28 }, { hour: 2, avgPrice: 4072.04 }, { hour: 3, avgPrice: 3731.96 },
    { hour: 4, avgPrice: 3658.42 }, { hour: 5, avgPrice: 4331.45 }, { hour: 6, avgPrice: 4397.89 }, { hour: 7, avgPrice: 3022.96 },
    { hour: 8, avgPrice: 2411.21 }, { hour: 9, avgPrice: 2167.70 }, { hour: 10, avgPrice: 1850.17 }, { hour: 11, avgPrice: 1764.51 },
    { hour: 12, avgPrice: 1684.53 }, { hour: 13, avgPrice: 1677.46 }, { hour: 14, avgPrice: 2024.43 }, { hour: 15, avgPrice: 2320.12 },
    { hour: 16, avgPrice: 2580.16 }, { hour: 17, avgPrice: 3152.54 }, { hour: 18, avgPrice: 3669.81 }, { hour: 19, avgPrice: 6810.87 },
    { hour: 20, avgPrice: 8108.81 }, { hour: 21, avgPrice: 8755.05 }, { hour: 22, avgPrice: 8927.97 }, { hour: 23, avgPrice: 8290.67 }
  ],
  "2025-07-21": [
    { hour: 0, avgPrice: 5139.09 }, { hour: 1, avgPrice: 4511.08 }, { hour: 2, avgPrice: 4466.73 }, { hour: 3, avgPrice: 4198.04 },
    { hour: 4, avgPrice: 3915.96 }, { hour: 5, avgPrice: 4315.17 }, { hour: 6, avgPrice: 4682.56 }, { hour: 7, avgPrice: 3472.51 },
    { hour: 8, avgPrice: 2987.54 }, { hour: 9, avgPrice: 2902.08 }, { hour: 10, avgPrice: 2655.91 }, { hour: 11, avgPrice: 2592.56 },
    { hour: 12, avgPrice: 2470.44 }, { hour: 13, avgPrice: 2485.31 }, { hour: 14, avgPrice: 2722.19 }, { hour: 15, avgPrice: 3018.81 },
    { hour: 16, avgPrice: 3273.98 }, { hour: 17, avgPrice: 3535.14 }, { hour: 18, avgPrice: 5249.50 }, { hour: 19, avgPrice: 9365.11 },
    { hour: 20, avgPrice: 9327.62 }, { hour: 21, avgPrice: 9738.50 }, { hour: 22, avgPrice: 9542.78 }, { hour: 23, avgPrice: 9639.51 }
  ]
};

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{`Hour: ${label}:00`}</p>
        <p className="text-primary">
          {`MCP: ${formatCurrency(payload[0].value)}/MWh`}
        </p>
      </div>
    );
  }
  return null;
};

const DAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-07-14'));

  const formatDateKey = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getCurrentData = () => {
    const dateKey = formatDateKey(selectedDate);
    return damForecastData[dateKey] || damForecastData["2025-07-14"];
  };

  const calculateStats = (data: Array<{ hour: number; avgPrice: number }>) => {
    const prices = data.map(d => d.avgPrice);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    const maxHour = data.find(d => d.avgPrice === maxPrice)?.hour || 0;
    const minHour = data.find(d => d.avgPrice === minPrice)?.hour || 0;
    
    return { maxPrice, minPrice, avgPrice, maxHour, minHour };
  };

  const currentData = getCurrentData();
  const stats = calculateStats(currentData);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              DAM Forecast for {format(selectedDate, 'dd MMMM yyyy')} (24-Hour View)
            </h1>
            <p className="text-muted-foreground">
              Day-Ahead Market clearing price predictions and analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    return !damForecastData[dateKey];
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
        </div>

        <DashboardNavigation />
        <PageNavigation />

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(stats.maxPrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                At {stats.maxHour}:00 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Off-Peak Price</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.minPrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                At {stats.minHour}:00 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {formatCurrency(stats.avgPrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                24-hour average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Volatility</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {(((stats.maxPrice - stats.minPrice) / stats.avgPrice) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Daily price range
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hourly MCP Forecast - {format(selectedDate, 'dd MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={stats.avgPrice} stroke="#8884d8" strokeDasharray="5 5" label="Avg" />
                  <Line 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Market Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Statistics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Peak Hours Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Highest prices typically occur between 19:00-22:00 hours, reaching up to {formatCurrency(stats.maxPrice)}/MWh
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Off-Peak Periods</h3>
                <p className="text-sm text-muted-foreground">
                  Lowest prices expected during 10:00-14:00 hours, dropping to {formatCurrency(stats.minPrice)}/MWh
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Price Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Daily average of {formatCurrency(stats.avgPrice)}/MWh with {(((stats.maxPrice - stats.minPrice) / stats.avgPrice) * 100).toFixed(1)}% volatility
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly DAM Price Forecasting Analysis (14th July - 21st July)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <img 
                src="/lovable-uploads/074a09b1-6454-4a7a-a63f-2260fff35d6f.png" 
                alt="Predicted MCP Heatmap (14th July to 21st July)" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DAMForecastPage;