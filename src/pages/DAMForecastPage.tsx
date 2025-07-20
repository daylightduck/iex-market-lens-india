
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 36-hour data for July 1, 2025 (6 hours from June 30 + 24 hours July 1 + 6 hours July 2)
const july1Data36Hours = [
  // June 30, 2025 - Last 6 hours
  { time: "18:00", fullTime: "30-Jun 18:00", price: 2299.62, day: "prev" },
  { time: "18:15", fullTime: "30-Jun 18:15", price: 2505.18, day: "prev" },
  { time: "18:30", fullTime: "30-Jun 18:30", price: 2640.28, day: "prev" },
  { time: "18:45", fullTime: "30-Jun 18:45", price: 2648.41, day: "prev" },
  { time: "19:00", fullTime: "30-Jun 19:00", price: 2505.87, day: "prev" },
  { time: "19:15", fullTime: "30-Jun 19:15", price: 2870.16, day: "prev" },
  { time: "19:30", fullTime: "30-Jun 19:30", price: 2960.17, day: "prev" },
  { time: "19:45", fullTime: "30-Jun 19:45", price: 3112.58, day: "prev" },
  { time: "20:00", fullTime: "30-Jun 20:00", price: 3359.28, day: "prev" },
  { time: "20:15", fullTime: "30-Jun 20:15", price: 3488.29, day: "prev" },
  { time: "20:30", fullTime: "30-Jun 20:30", price: 3569.35, day: "prev" },
  { time: "20:45", fullTime: "30-Jun 20:45", price: 3569.71, day: "prev" },
  { time: "21:00", fullTime: "30-Jun 21:00", price: 3569.77, day: "prev" },
  { time: "21:15", fullTime: "30-Jun 21:15", price: 3677.16, day: "prev" },
  { time: "21:30", fullTime: "30-Jun 21:30", price: 3628.74, day: "prev" },
  { time: "21:45", fullTime: "30-Jun 21:45", price: 3569.5, day: "prev" },
  { time: "22:00", fullTime: "30-Jun 22:00", price: 3820.27, day: "prev" },
  { time: "22:15", fullTime: "30-Jun 22:15", price: 4000.75, day: "prev" },
  { time: "22:30", fullTime: "30-Jun 22:30", price: 4468.34, day: "prev" },
  { time: "22:45", fullTime: "30-Jun 22:45", price: 4999.27, day: "prev" },
  { time: "23:00", fullTime: "30-Jun 23:00", price: 5250.23, day: "prev" },
  { time: "23:15", fullTime: "30-Jun 23:15", price: 5499.33, day: "prev" },
  { time: "23:30", fullTime: "30-Jun 23:30", price: 4639.83, day: "prev" },
  { time: "23:45", fullTime: "30-Jun 23:45", price: 4999.12, day: "prev" },
  
  // July 1, 2025 - Full 24 hours
  { time: "00:00", fullTime: "01-Jul 00:00", price: 2999.75, day: "current" },
  { time: "00:15", fullTime: "01-Jul 00:15", price: 2999.46, day: "current" },
  { time: "00:30", fullTime: "01-Jul 00:30", price: 2999.26, day: "current" },
  { time: "00:45", fullTime: "01-Jul 00:45", price: 2999.08, day: "current" },
  { time: "01:00", fullTime: "01-Jul 01:00", price: 2920.38, day: "current" },
  { time: "01:15", fullTime: "01-Jul 01:15", price: 2870.75, day: "current" },
  { time: "01:30", fullTime: "01-Jul 01:30", price: 2870.88, day: "current" },
  { time: "01:45", fullTime: "01-Jul 01:45", price: 2919.22, day: "current" },
  { time: "02:00", fullTime: "01-Jul 02:00", price: 2870.67, day: "current" },
  { time: "02:15", fullTime: "01-Jul 02:15", price: 2870.87, day: "current" },
  { time: "02:30", fullTime: "01-Jul 02:30", price: 2870.87, day: "current" },
  { time: "02:45", fullTime: "01-Jul 02:45", price: 2870.88, day: "current" },
  { time: "03:00", fullTime: "01-Jul 03:00", price: 2870.68, day: "current" },
  { time: "03:15", fullTime: "01-Jul 03:15", price: 2870.31, day: "current" },
  { time: "03:30", fullTime: "01-Jul 03:30", price: 2784.2, day: "current" },
  { time: "03:45", fullTime: "01-Jul 03:45", price: 2829.09, day: "current" },
  { time: "04:00", fullTime: "01-Jul 04:00", price: 2590.88, day: "current" },
  { time: "04:15", fullTime: "01-Jul 04:15", price: 2739.17, day: "current" },
  { time: "04:30", fullTime: "01-Jul 04:30", price: 2739.13, day: "current" },
  { time: "04:45", fullTime: "01-Jul 04:45", price: 2640.55, day: "current" },
  { time: "05:00", fullTime: "01-Jul 05:00", price: 2829.4, day: "current" },
  { time: "05:15", fullTime: "01-Jul 05:15", price: 2870, day: "current" },
  { time: "05:30", fullTime: "01-Jul 05:30", price: 2870.47, day: "current" },
  { time: "05:45", fullTime: "01-Jul 05:45", price: 2900.46, day: "current" },
  { time: "06:00", fullTime: "01-Jul 06:00", price: 2960.72, day: "current" },
  { time: "06:15", fullTime: "01-Jul 06:15", price: 2960.82, day: "current" },
  { time: "06:30", fullTime: "01-Jul 06:30", price: 2960.64, day: "current" },
  { time: "06:45", fullTime: "01-Jul 06:45", price: 2889.84, day: "current" },
  { time: "07:00", fullTime: "01-Jul 07:00", price: 2701.93, day: "current" },
  { time: "07:15", fullTime: "01-Jul 07:15", price: 2532.36, day: "current" },
  { time: "07:30", fullTime: "01-Jul 07:30", price: 2400.83, day: "current" },
  { time: "07:45", fullTime: "01-Jul 07:45", price: 2172.36, day: "current" },
  { time: "08:00", fullTime: "01-Jul 08:00", price: 2059.94, day: "current" },
  { time: "08:15", fullTime: "01-Jul 08:15", price: 2139.23, day: "current" },
  { time: "08:30", fullTime: "01-Jul 08:30", price: 2142.64, day: "current" },
  { time: "08:45", fullTime: "01-Jul 08:45", price: 2124.02, day: "current" },
  { time: "09:00", fullTime: "01-Jul 09:00", price: 1667.75, day: "current" },
  { time: "09:15", fullTime: "01-Jul 09:15", price: 1667.42, day: "current" },
  { time: "09:30", fullTime: "01-Jul 09:30", price: 1667.46, day: "current" },
  { time: "09:45", fullTime: "01-Jul 09:45", price: 1500.87, day: "current" },
  { time: "10:00", fullTime: "01-Jul 10:00", price: 1667.02, day: "current" },
  { time: "10:15", fullTime: "01-Jul 10:15", price: 1667.32, day: "current" },
  { time: "10:30", fullTime: "01-Jul 10:30", price: 1667.93, day: "current" },
  { time: "10:45", fullTime: "01-Jul 10:45", price: 1699.62, day: "current" },
  { time: "11:00", fullTime: "01-Jul 11:00", price: 1667.69, day: "current" },
  { time: "11:15", fullTime: "01-Jul 11:15", price: 1667.63, day: "current" },
  { time: "11:30", fullTime: "01-Jul 11:30", price: 1667.22, day: "current" },
  { time: "11:45", fullTime: "01-Jul 11:45", price: 1667.27, day: "current" },
  { time: "12:00", fullTime: "01-Jul 12:00", price: 1667.1, day: "current" },
  { time: "12:15", fullTime: "01-Jul 12:15", price: 1667.21, day: "current" },
  { time: "12:30", fullTime: "01-Jul 12:30", price: 1667.27, day: "current" },
  { time: "12:45", fullTime: "01-Jul 12:45", price: 1667.27, day: "current" },
  { time: "13:00", fullTime: "01-Jul 13:00", price: 1500.82, day: "current" },
  { time: "13:15", fullTime: "01-Jul 13:15", price: 1449.26, day: "current" },
  { time: "13:30", fullTime: "01-Jul 13:30", price: 1486.2, day: "current" },
  { time: "13:45", fullTime: "01-Jul 13:45", price: 1500.33, day: "current" },
  { time: "14:00", fullTime: "01-Jul 14:00", price: 1726.2, day: "current" },
  { time: "14:15", fullTime: "01-Jul 14:15", price: 1758.56, day: "current" },
  { time: "14:30", fullTime: "01-Jul 14:30", price: 1861.59, day: "current" },
  { time: "14:45", fullTime: "01-Jul 14:45", price: 1895.2, day: "current" },
  { time: "15:00", fullTime: "01-Jul 15:00", price: 1989.78, day: "current" },
  { time: "15:15", fullTime: "01-Jul 15:15", price: 2100.08, day: "current" },
  { time: "15:30", fullTime: "01-Jul 15:30", price: 2499.88, day: "current" },
  { time: "15:45", fullTime: "01-Jul 15:45", price: 2499.19, day: "current" },
  { time: "16:00", fullTime: "01-Jul 16:00", price: 2100.71, day: "current" },
  { time: "16:15", fullTime: "01-Jul 16:15", price: 2185.93, day: "current" },
  { time: "16:30", fullTime: "01-Jul 16:30", price: 2100.87, day: "current" },
  { time: "16:45", fullTime: "01-Jul 16:45", price: 2100.84, day: "current" },
  { time: "17:00", fullTime: "01-Jul 17:00", price: 2505.98, day: "current" },
  { time: "17:15", fullTime: "01-Jul 17:15", price: 2532.87, day: "current" },
  { time: "17:30", fullTime: "01-Jul 17:30", price: 2648.93, day: "current" },
  { time: "17:45", fullTime: "01-Jul 17:45", price: 2701.97, day: "current" },
  { time: "18:00", fullTime: "01-Jul 18:00", price: 2801.3, day: "current" },
  { time: "18:15", fullTime: "01-Jul 18:15", price: 2870.07, day: "current" },
  { time: "18:30", fullTime: "01-Jul 18:30", price: 2900.17, day: "current" },
  { time: "18:45", fullTime: "01-Jul 18:45", price: 2999.93, day: "current" },
  { time: "19:00", fullTime: "01-Jul 19:00", price: 3396.8, day: "current" },
  { time: "19:15", fullTime: "01-Jul 19:15", price: 3503.86, day: "current" },
  { time: "19:30", fullTime: "01-Jul 19:30", price: 3913.08, day: "current" },
  { time: "19:45", fullTime: "01-Jul 19:45", price: 4689.13, day: "current" },
  { time: "20:00", fullTime: "01-Jul 20:00", price: 4689.03, day: "current" },
  { time: "20:15", fullTime: "01-Jul 20:15", price: 4639.12, day: "current" },
  { time: "20:30", fullTime: "01-Jul 20:30", price: 4219.14, day: "current" },
  { time: "20:45", fullTime: "01-Jul 20:45", price: 4069.95, day: "current" },
  { time: "21:00", fullTime: "01-Jul 21:00", price: 4119.02, day: "current" },
  { time: "21:15", fullTime: "01-Jul 21:15", price: 4140, day: "current" },
  { time: "21:30", fullTime: "01-Jul 21:30", price: 4119.44, day: "current" },
  { time: "21:45", fullTime: "01-Jul 21:45", price: 4219.15, day: "current" },
  { time: "22:00", fullTime: "01-Jul 22:00", price: 4589.21, day: "current" },
  { time: "22:15", fullTime: "01-Jul 22:15", price: 4600.74, day: "current" },
  { time: "22:30", fullTime: "01-Jul 22:30", price: 4510.6, day: "current" },
  { time: "22:45", fullTime: "01-Jul 22:45", price: 4589.94, day: "current" },
  { time: "23:00", fullTime: "01-Jul 23:00", price: 4419.6, day: "current" },
  { time: "23:15", fullTime: "01-Jul 23:15", price: 4219.04, day: "current" },
  { time: "23:30", fullTime: "01-Jul 23:30", price: 4069.66, day: "current" },
  { time: "23:45", fullTime: "01-Jul 23:45", price: 3943.03, day: "current" },
  
  // July 2, 2025 - First 6 hours
  { time: "00:00", fullTime: "02-Jul 00:00", price: 3060.32, day: "next" },
  { time: "00:15", fullTime: "02-Jul 00:15", price: 3060.66, day: "next" },
  { time: "00:30", fullTime: "02-Jul 00:30", price: 2999.69, day: "next" },
  { time: "00:45", fullTime: "02-Jul 00:45", price: 2950.01, day: "next" },
  { time: "01:00", fullTime: "02-Jul 01:00", price: 2950.15, day: "next" },
  { time: "01:15", fullTime: "02-Jul 01:15", price: 2919.76, day: "next" },
  { time: "01:30", fullTime: "02-Jul 01:30", price: 2940.01, day: "next" },
  { time: "01:45", fullTime: "02-Jul 01:45", price: 2830.91, day: "next" },
  { time: "02:00", fullTime: "02-Jul 02:00", price: 2940.45, day: "next" },
  { time: "02:15", fullTime: "02-Jul 02:15", price: 2920.88, day: "next" },
  { time: "02:30", fullTime: "02-Jul 02:30", price: 2830.15, day: "next" },
  { time: "02:45", fullTime: "02-Jul 02:45", price: 2920.26, day: "next" },
  { time: "03:00", fullTime: "02-Jul 03:00", price: 2829.89, day: "next" },
  { time: "03:15", fullTime: "02-Jul 03:15", price: 2829.95, day: "next" },
  { time: "03:30", fullTime: "02-Jul 03:30", price: 2830.02, day: "next" },
  { time: "03:45", fullTime: "02-Jul 03:45", price: 2729.82, day: "next" },
  { time: "04:00", fullTime: "02-Jul 04:00", price: 2729.63, day: "next" },
  { time: "04:15", fullTime: "02-Jul 04:15", price: 2729.53, day: "next" },
  { time: "04:30", fullTime: "02-Jul 04:30", price: 2729.63, day: "next" },
  { time: "04:45", fullTime: "02-Jul 04:45", price: 2729.98, day: "next" },
  { time: "05:00", fullTime: "02-Jul 05:00", price: 2729.9, day: "next" },
  { time: "05:15", fullTime: "02-Jul 05:15", price: 2849.86, day: "next" },
  { time: "05:30", fullTime: "02-Jul 05:30", price: 2960.22, day: "next" },
  { time: "05:45", fullTime: "02-Jul 05:45", price: 2950.88, day: "next" }
];

// Calculate statistics only from July 1st data (24 hours)
const july1OnlyData = july1Data36Hours.filter(item => item.day === "current");

const DAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 1)); // July 1, 2025
  
  const currentData = july1Data36Hours; // Always show 36-hour data for July 1st
  const currentTitle = "July 1, 2025 (36-hour view)";
  
  // Calculate min/max/avg only from July 1st data (excluding prev/next day data)
  const july1Prices = july1OnlyData.map(d => d.price);
  const maxPrice = Math.max(...july1Prices);
  const minPrice = Math.min(...july1Prices);
  const avgPrice = july1Prices.reduce((sum, price) => sum + price, 0) / july1Prices.length;
  
  const maxPricePoint = july1OnlyData.find(d => d.price === maxPrice);
  const minPricePoint = july1OnlyData.find(d => d.price === minPrice);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.fullTime}</p>
          <p className="text-sm text-primary">
            MCP: ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh
          </p>
          {data.day === 'prev' && <p className="text-xs text-muted-foreground">Previous Day</p>}
          {data.day === 'next' && <p className="text-xs text-muted-foreground">Next Day</p>}
        </div>
      );
    }
    return null;
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
                <p className="text-xs text-muted-foreground">DAM Forecast</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <PageNavigation />
            <Link to="/gdam-forecast">
              <Button variant="outline" className="bg-accent/10 border-accent/20 hover:bg-accent/20">
                GDAM Dashboard
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
              Day-Ahead Market (DAM) Forecast
            </h1>
            <p className="text-muted-foreground mt-1">
              36-hour continuous price data (June 30 18:00 - July 2 06:00)
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
                  disabled={(date) => {
                    const day = date.getDate();
                    const month = date.getMonth();
                    const year = date.getFullYear();
                    return !(year === 2025 && month === 6 && day === 1);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Chart */}
          <div className="xl:col-span-3">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card/50 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  MCP Price Chart - {currentTitle}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted-foreground/50"></div>
                    <span>Previous Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span>July 1st</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted-foreground/30"></div>
                    <span>Next Day</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="fullTime" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={3}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[1000, 6000]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Day boundary markers */}
                      <ReferenceLine x="01-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                      <ReferenceLine x="02-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                      
                      {/* Average reference line for July 1st only */}
                      <ReferenceLine y={avgPrice} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                      
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={(props) => {
                          const { payload } = props;
                          let fill = "hsl(var(--primary))";
                          if (payload.day === "prev") fill = "hsl(var(--muted-foreground))";
                          if (payload.day === "next") fill = "hsl(var(--muted-foreground))";
                          return <circle {...props} fill={fill} r={2} />;
                        }}
                        activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics - Based on July 1st data only */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">July 1st Statistics</h3>
            
            <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Max</p>
                    <p className="text-2xl font-bold text-destructive">₹{maxPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">at {maxPricePoint?.time}</p>
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
                    <p className="text-2xl font-bold text-success">₹{minPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">at {minPricePoint?.time}</p>
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
                    <p className="text-2xl font-bold text-primary">₹{avgPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h4 className="font-medium">36-Hour Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Data Points:</span>
                      <span className="font-medium">144 (15-min intervals)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peak Hours:</span>
                      <span className="font-medium">19:30 - 20:15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Off-Peak Hours:</span>
                      <span className="font-medium">09:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price Volatility:</span>
                      <span className="font-medium">High Evening</span>
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

export default DAMForecastPage;
