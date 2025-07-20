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

// Real data for July 1 and July 2, 2025
const july1Data = [
  { time: "18:00", price: 2800 },
  { time: "19:00", price: 3200 },
  { time: "20:00", price: 3800 },
  { time: "21:00", price: 4200 },
  { time: "22:00", price: 5400 },
  { time: "23:00", price: 5200 },
  { time: "00:00", price: 3200 },
  { time: "01:00", price: 2900 },
  { time: "02:00", price: 2800 },
  { time: "03:00", price: 2700 },
  { time: "04:00", price: 2800 },
  { time: "05:00", price: 2900 },
  { time: "06:00", price: 2100 },
  { time: "07:00", price: 1800 },
  { time: "08:00", price: 1600 },
  { time: "09:00", price: 1500 },
  { time: "10:00", price: 1400 },
  { time: "11:00", price: 1300 },
  { time: "12:00", price: 1400 },
  { time: "13:00", price: 2000 },
  { time: "14:00", price: 2400 },
  { time: "15:00", price: 2600 },
  { time: "16:00", price: 2800 },
  { time: "17:00", price: 3000 },
  { time: "18:00", price: 4800 },
  { time: "19:00", price: 4600 },
  { time: "20:00", price: 4400 },
  { time: "21:00", price: 4200 },
  { time: "22:00", price: 3800 },
  { time: "23:00", price: 3000 },
  { time: "00:00", price: 2900 }
];

const july2Data = [
  { time: "18:00", price: 2900 },
  { time: "19:00", price: 3000 },
  { time: "20:00", price: 4600 },
  { time: "21:00", price: 4400 },
  { time: "22:00", price: 4600 },
  { time: "23:00", price: 4400 },
  { time: "00:00", price: 2900 },
  { time: "01:00", price: 2800 },
  { time: "02:00", price: 2700 },
  { time: "03:00", price: 2600 },
  { time: "04:00", price: 2800 },
  { time: "05:00", price: 3000 },
  { time: "06:00", price: 2000 },
  { time: "07:00", price: 1800 },
  { time: "08:00", price: 1700 },
  { time: "09:00", price: 1600 },
  { time: "10:00", price: 1700 },
  { time: "11:00", price: 1800 },
  { time: "12:00", price: 1700 },
  { time: "13:00", price: 2600 },
  { time: "14:00", price: 2800 },
  { time: "15:00", price: 2600 },
  { time: "16:00", price: 2400 },
  { time: "17:00", price: 2600 },
  { time: "18:00", price: 5100 },
  { time: "19:00", price: 5200 },
  { time: "20:00", price: 4900 },
  { time: "21:00", price: 4600 },
  { time: "22:00", price: 4200 },
  { time: "23:00", price: 3800 },
  { time: "00:00", price: 3600 }
];

const DAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 1)); // July 1, 2025
  
  const currentData = selectedDate.getDate() === 2 ? july2Data : july1Data;
  const currentTitle = selectedDate.getDate() === 2 ? "July 2, 2025" : "July 1, 2025";
  
  const maxPrice = Math.max(...currentData.map(d => d.price));
  const minPrice = Math.min(...currentData.map(d => d.price));
  const avgPrice = currentData.reduce((sum, d) => sum + d.price, 0) / currentData.length;
  
  const maxPricePoint = currentData.find(d => d.price === maxPrice);
  const minPricePoint = currentData.find(d => d.price === minPrice);

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
              Historical price data for July 1 & 2, 2025
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
                    return !(year === 2025 && month === 6 && (day === 1 || day === 2));
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
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[1000, 6000]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          color: "hsl(var(--popover-foreground))"
                        }}
                        formatter={(value: number) => [`₹${value}`, "MCP (Rs/MWh)"]}
                      />
                      <ReferenceLine y={2800} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                    <p className="text-2xl font-bold text-destructive">₹{maxPrice}</p>
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
                    <p className="text-2xl font-bold text-success">₹{minPrice}</p>
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
                  <h4 className="font-medium">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Price Spread:</span>
                      <span className="font-medium">
                        ₹{maxPrice - minPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peak Hours:</span>
                      <span className="font-medium">
                        18:00 - 22:00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Off-Peak Hours:</span>
                      <span className="font-medium">
                        10:00 - 17:00
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

export default DAMForecastPage;