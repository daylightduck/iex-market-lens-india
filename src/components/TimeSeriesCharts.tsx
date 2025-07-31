import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { useMCPData } from "@/hooks/useMCPData";
import { useBidData } from "@/hooks/useBidData";
import { Loader2, Calendar as CalendarIcon, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";
import useDailyMCPData from "@/hooks/useDailyMCPData";
import Papa from 'papaparse';

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";
type DayRange = "1D" | "5D" | "1M" | "6M" | "1Y" | "MAX" | "custom";

interface TimeSeriesChartsProps {
  filters?: {
    timeRange: TimeRange;
    dateRange: { from?: Date; to?: Date };
    region: string;
    state: string;
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

interface CustomTooltipProps extends TooltipProps {
  dayRange?: DayRange;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, dayRange }) => {
  if (active && payload && payload.length) {
    // Format the date label if it's in DD-MM-YYYY format
    let formattedLabel = label;
    if (dayRange !== "1D" && label && label.includes('-')) {
      try {
        const [day, month, year] = label.split('-');
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          formattedLabel = date.toLocaleDateString('en-US', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-trading">
        <p className="text-sm font-medium text-foreground">
          {dayRange === "1D" ? `Time: ${label}` : `Date: ${formattedLabel}`}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'price' 
              ? `${entry.name}: ₹${entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : `${entry.name}: ${entry.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} MW`
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface MCPTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const MCPTooltip: React.FC<MCPTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white">{`Time: ${label}`}</p>
        <p className="text-sm text-white">
          {`MCP: ₹${payload[0].value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh`}
        </p>
      </div>
    );
  }
  return null;
};

interface DailyMCPTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const DailyMCPTooltip: React.FC<DailyMCPTooltipProps & { dayRange?: DayRange; isPositiveTrend?: boolean }> = ({ 
  active, payload, label, dayRange, isPositiveTrend 
}) => {
  if (active && payload && payload.length) {
    const textColor = isPositiveTrend ? "text-green-600" : "text-red-600";
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-trading">
        <p className="text-sm font-medium text-foreground">
          {dayRange === "1D" ? `Time: ${label}` : `Date: ${label}`}
        </p>
        <p className={`text-sm font-medium ${textColor}`}>
          {dayRange === "1D" 
            ? `MCP: ₹${payload[0].value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh`
            : `Avg. MCP: ₹${payload[0].value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh`
          }
        </p>
      </div>
    );
  }
  return null;
};

export const TimeSeriesCharts: React.FC<TimeSeriesChartsProps> = ({ filters }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(filters?.timeRange || "1D");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  
  // State for daily view
  const [selectedDayRange, setSelectedDayRange] = useState<DayRange>("1M");
  const [dayCustomDateRange, setDayCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [dayDatePickerOpen, setDayDatePickerOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'hourly' | 'daily'>('hourly');
  
  // State for daily bid data from CSV
  const [dailyBidDataFromCSV, setDailyBidDataFromCSV] = useState<{ date: string; purchaseBid: number; sellBid: number; }[]>([]);
  const [loadingCSV, setLoadingCSV] = useState<boolean>(false);

  // Function to load and process CSV data for bids
  const fetchBidDataFromCSV = async () => {
    setLoadingCSV(true);
    try {
      const csvFilePath = '/Final_IEX_2023_Data_TO_July14_2025(final).csv';
      const response = await fetch(csvFilePath);
      const csvText = await response.text();
      
      // Parse the CSV
      const { data } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });
      
      // Process data for daily view (aggregate by date)
      const groupedByDate: Record<string, { 
        purchaseBidSum: number; 
        sellBidSum: number; 
        count: number 
      }> = {};
      
      interface CSVRow {
        Date: string;
        'Purchase Bid (MW)': string;
        'Sell Bid (MW)': string;
        [key: string]: string;
      }
      
      (data as CSVRow[]).forEach((row) => {
        if (!row.Date || !row['Purchase Bid (MW)'] || !row['Sell Bid (MW)']) return;
        
        const dateKey = row.Date.trim();
        const purchaseBid = parseFloat(row['Purchase Bid (MW)']);
        const sellBid = parseFloat(row['Sell Bid (MW)']);
        
        if (isNaN(purchaseBid) || isNaN(sellBid)) return;
        
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {
            purchaseBidSum: 0,
            sellBidSum: 0,
            count: 0
          };
        }
        
        groupedByDate[dateKey].purchaseBidSum += purchaseBid;
        groupedByDate[dateKey].sellBidSum += sellBid;
        groupedByDate[dateKey].count++;
      });
      
      // Convert to array format
      const result = Object.entries(groupedByDate).map(([date, data]) => ({
        date,
        purchaseBid: data.purchaseBidSum / data.count,
        sellBid: data.sellBidSum / data.count
      })).sort((a, b) => {
        // Sort by date (DD-MM-YYYY format)
        const [aDay, aMonth, aYear] = a.date.split('-').map(Number);
        const [bDay, bMonth, bYear] = b.date.split('-').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      });
      
      setDailyBidDataFromCSV(result);
    } catch (error) {
      console.error('Error loading CSV data:', error);
    } finally {
      setLoadingCSV(false);
    }
  };

  const { data: mcpData, stats, loading, error } = useMCPData(
    selectedTimeRange,
    selectedTimeRange === "custom" ? customDateRange : undefined
  );

  const { data: bidData, stats: bidStats, loading: bidLoading, error: bidError } = useBidData(
    selectedTimeRange,
    selectedTimeRange === "custom" ? customDateRange : undefined
  );
  
  // Fetch daily data
  const { 
    data: dailyMCPData, 
    stats: dailyStats, 
    loading: dailyLoading, 
    error: dailyError 
  } = useDailyMCPData(
    selectedDayRange,
    selectedDayRange === "custom" ? dayCustomDateRange : undefined
  );

  // Fetch daily bid data
  const { 
    data: dailyBidData, 
    stats: dailyBidStats, 
    loading: dailyBidLoading, 
    error: dailyBidError 
  } = useBidData(
    selectedDayRange as TimeRange,
    selectedDayRange === "custom" ? dayCustomDateRange : undefined
  );
  
  // Load CSV data for bids on component mount or when view mode or day range changes
  useEffect(() => {
    fetchBidDataFromCSV();
  }, [viewMode, selectedDayRange]);

  const timeRangeButtons: Array<{ value: TimeRange; label: string }> = [
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
  ];
  
  const dayRangeButtons: Array<{ value: DayRange; label: string }> = [
    { value: "1D", label: "1D" },
    { value: "5D", label: "5D" },
    { value: "1M", label: "1M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
    { value: "MAX", label: "MAX" },
  ];

  const handleTimeRangeChange = (value: TimeRange): void => {
    setSelectedTimeRange(value);
  };
  
  const handleDayRangeChange = (value: DayRange): void => {
    setSelectedDayRange(value);
  };

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined): void => {
    setCustomDateRange({ from: range?.from, to: range?.to });
    setSelectedTimeRange("custom");
  };
  
  const handleDayCustomDateSelect = (range: { from?: Date; to?: Date } | undefined): void => {
    setDayCustomDateRange({ from: range?.from, to: range?.to });
    setSelectedDayRange("custom");
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">View Mode:</span>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'hourly' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('hourly')}
              >
                Hourly
              </Button>
              <Button
                variant={viewMode === 'daily' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('daily')}
              >
                Daily
              </Button>
            </div>
          </div>
          
          {/* Time Range Filter Controls - Only show when hourly view is selected */}
          {viewMode === 'hourly' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Time Range:</span>
              <div className="flex gap-1">
                {timeRangeButtons.map((button) => (
                  <Button
                    key={button.value}
                    variant={selectedTimeRange === button.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange(button.value)}
                  >
                    {button.label}
                  </Button>
                ))}
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={selectedTimeRange === "custom" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeRange("custom")}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={{ from: customDateRange.from, to: customDateRange.to }}
                      onSelect={handleCustomDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          {/* Day Range Filter Controls - Only show when daily view is selected */}
          {viewMode === 'daily' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Day Range:</span>
              <div className="flex gap-1">
                {dayRangeButtons.map((button) => (
                  <Button
                    key={button.value}
                    variant={selectedDayRange === button.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayRangeChange(button.value)}
                  >
                    {button.label}
                  </Button>
                ))}
                <Popover open={dayDatePickerOpen} onOpenChange={setDayDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={selectedDayRange === "custom" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDayRange("custom")}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={{ from: dayCustomDateRange.from, to: dayCustomDateRange.to }}
                      onSelect={handleDayCustomDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
        
        {/* Selected range display */}
        {viewMode === 'hourly' && selectedTimeRange === "custom" && (customDateRange.from || customDateRange.to) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {customDateRange.from && format(customDateRange.from, "MMM dd, yyyy")} 
            {customDateRange.from && customDateRange.to && " - "}
            {customDateRange.to && format(customDateRange.to, "MMM dd, yyyy")}
          </div>
        )}
        
        {viewMode === 'daily' && selectedDayRange === "custom" && (dayCustomDateRange.from || dayCustomDateRange.to) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {dayCustomDateRange.from && format(dayCustomDateRange.from, "MMM dd, yyyy")} 
            {dayCustomDateRange.from && dayCustomDateRange.to && " - "}
            {dayCustomDateRange.to && format(dayCustomDateRange.to, "MMM dd, yyyy")}
          </div>
        )}
      </Card>

      {/* Summary Cards Row - Hourly View */}
      {viewMode === 'hourly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average MCP Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Average MCP</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTimeRange === "custom" ? "Custom Period" : `Last ${selectedTimeRange}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : stats ? (
                    `₹${stats.average.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  ) : (
                    "--"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">per MWh</div>
              </div>
            </div>
          </Card>

          {/* Average Bid Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Average Bids</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTimeRange === "custom" ? "Custom Period" : `Last ${selectedTimeRange}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {bidLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : bidStats ? (
                    <>
                      <div className="text-sm text-green-600">
                        Buy: {bidStats.purchaseBid.average.toLocaleString('en-IN', { maximumFractionDigits: 0 })} MW
                      </div>
                      <div className="text-sm text-red-600">
                        Sell: {bidStats.sellBid.average.toLocaleString('en-IN', { maximumFractionDigits: 0 })} MW
                      </div>
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Summary Cards Row - Daily View */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Average MCP Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Daily Average MCP</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDayRange === "custom" ? "Custom Period" : `Last ${selectedDayRange}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">
                  {dailyLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : dailyStats ? (
                    `₹${dailyStats.average.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  ) : (
                    "--"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">per MWh</div>
              </div>
            </div>
          </Card>

          {/* Min/Max MCP Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">MCP Range</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDayRange === "custom" ? "Custom Period" : `Last ${selectedDayRange}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {dailyLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : dailyStats ? (
                    <>
                      <div className="text-sm text-green-600">
                        Min: ₹{dailyStats.min.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-red-600">
                        Max: ₹{dailyStats.max.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Two-column layout for both charts - Hourly View */}
      {viewMode === 'hourly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase vs Sell Bid Chart */}
          <Card className="p-6 bg-card border-border hover:shadow-trading transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Purchase vs Sell Bids</h3>
              <p className="text-sm text-muted-foreground">
                Average hourly bids over {selectedTimeRange === "custom" ? "custom period" : `last ${selectedTimeRange}`}
              </p>
            </div>
            <div className="h-80">
              {bidLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm">Loading bid data...</span>
                </div>
              ) : bidError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm text-red-500">Error loading bid data</p>
                    <p className="text-xs text-muted-foreground mt-1">{bidError}</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bidData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Volume (MW)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value: number) => `${(value/1000).toFixed(1)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="purchaseBid" 
                      stroke="hsl(var(--bullish))" 
                      strokeWidth={3}
                      dot={false}
                      name="Purchase Bid"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sellBid" 
                      stroke="hsl(var(--bearish))" 
                      strokeWidth={3}
                      dot={false}
                      name="Sell Bid"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-bullish rounded"></div>
                <span className="text-sm text-muted-foreground">Purchase Bid</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-bearish rounded"></div>
                <span className="text-sm text-muted-foreground">Sell Bid</span>
              </div>
            </div>
          </Card>

          {/* MCP Chart */}
          <Card className="p-0 bg-[#0D1117] border-[#30363d] hover:shadow-trading transition-all duration-300">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-bold text-white text-center mb-1 font-['Inter',sans-serif]">
                Market Clearing Price (MCP) — {selectedTimeRange === "custom" ? "Custom Period" : `Last ${selectedTimeRange}`}
              </h3>
              <p className="text-sm text-[#8b949e] text-center">
                {loading ? 'Loading market data...' : `${mcpData.length} hourly averages • Average: ₹${stats?.average.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '--'}/MWh`}
              </p>
            </div>
            <div className="h-96 px-6 pb-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="ml-2 text-white text-sm">Loading MCP data...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm text-red-400">Error loading MCP data</p>
                    <p className="text-xs text-[#8b949e] mt-1">{error}</p>
                  </div>
                </div>
              ) : mcpData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-sm text-[#8b949e]">No MCP data available</p>
                    <p className="text-xs text-[#8b949e] mt-1">Try a different time range</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mcpData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="midnightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#D1D5DA"
                      fontSize={11}
                      tickLine={{ stroke: '#D1D5DA' }}
                      axisLine={{ stroke: '#D1D5DA' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#D1D5DA"
                      fontSize={11}
                      tickLine={{ stroke: '#D1D5DA' }}
                      axisLine={{ stroke: '#D1D5DA' }}
                      tickFormatter={(value: number) => `₹${(value/1000).toFixed(1)}k`}
                      domain={['dataMin - 200', 'dataMax + 200']}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                    <Tooltip content={<MCPTooltip />} />
                    
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#ffffff"
                      strokeWidth={2}
                      fill="url(#midnightGradient)"
                      dot={{ fill: "#ffffff", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#ffffff", strokeWidth: 2 }}
                    />
                    
                    {/* Min price reference line */}
                    {stats && (
                      <ReferenceLine 
                        y={stats.min} 
                        stroke="#22c55e" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: `Min: ₹${stats.min.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 
                          position: "insideTopLeft",
                          fill: "#22c55e",
                          fontSize: 12,
                          fontWeight: "bold"
                        }}
                      />
                    )}
                    
                    {/* Max price reference line */}
                    {stats && (
                      <ReferenceLine 
                        y={stats.max} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ 
                          value: `Max: ₹${stats.max.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 
                          position: "insideTopRight",
                          fill: "#ef4444",
                          fontSize: 12,
                          fontWeight: "bold"
                        }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {/* Daily MCP Chart and Bid Chart - Daily View */}
      {viewMode === 'daily' && (
        <div className="space-y-6">
          {/* Time range buttons shared by both charts */}
          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "1D" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("1D")}
            >
              1D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "5D" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("5D")}
            >
              5D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "1M" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("1M")}
            >
              1M
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "6M" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("6M")}
            >
              6M
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "1Y" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("1Y")}
            >
              1Y
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 h-auto rounded hover:bg-muted ${selectedDayRange === "MAX" ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => handleDayRangeChange("MAX")}
            >
              MAX
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily MCP Chart */}
            <Card className="p-6 bg-card border-border shadow-sm">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {selectedDayRange === "1D" ? "Hourly Market Clearing Price" : "Daily Market Clearing Price"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDayRange === "1D" 
                      ? "Hourly prices from last 24 hours" 
                      : selectedDayRange === "5D"
                      ? "Daily averages from latest 5 days"
                      : `Daily averages from ${selectedDayRange === "custom" ? "custom period" : selectedDayRange === "MAX" ? "all available data" : `last ${selectedDayRange}`}`
                    }
                  </p>
                </div>
                <div className="text-2xl font-semibold">
                  {dailyStats && `₹${Math.round(dailyStats.average).toLocaleString()}`}
                </div>
              </div>
              <div className="h-80">
                {dailyLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm">
                      {selectedDayRange === "1D" 
                        ? "Loading hourly MCP data..." 
                        : "Loading daily MCP data..."}
                    </span>
                  </div>
                ) : dailyError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm text-red-500">Error loading daily MCP data</p>
                      <p className="text-xs text-muted-foreground mt-1">{dailyError}</p>
                    </div>
                  </div>
                ) : dailyMCPData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedDayRange === "1D" 
                          ? "No hourly MCP data available" 
                          : "No daily MCP data available"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different date range</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyMCPData} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
                      <defs>
                        <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#e11d48" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        interval={selectedDayRange === "1D" ? 1 : "preserveStartEnd"}
                        angle={selectedDayRange === "1D" ? -45 : 0}
                        textAnchor={selectedDayRange === "1D" ? "end" : "middle"}
                        height={selectedDayRange === "1D" ? 80 : 60}
                        tickFormatter={(value) => {
                          // For 1D view, show hourly format as is
                          if (selectedDayRange === "1D") {
                            return value;
                          }
                          // For 5D view, show day and month (e.g., "12 Jul")
                          else if (selectedDayRange === "5D") {
                            const parts = value.split(' ');
                            if (parts.length >= 2) {
                              return `${parts[0]} ${parts[1]}`;
                            }
                            return value;
                          }
                          // For other views, show month and year (e.g., "Sep 2024")
                          else {
                            const parts = value.split(' ');
                            if (parts.length >= 3) {
                              return `${parts[1]} ${parts[2]}`;
                            }
                            return value;
                          }
                        }}
                        tickCount={selectedDayRange === "1D" ? 24 : undefined}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value: number) => `₹${value.toLocaleString()}`}
                        domain={['dataMin - 500', 'dataMax + 500']}
                        tickCount={7}
                      />
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      
                      {(() => {
                        // Calculate if the trend is positive or negative
                        let isPositiveTrend = false;
                        
                        if (dailyMCPData.length >= 2) {
                          // Compare first and last point to determine overall trend
                          const firstPoint = dailyMCPData[0].price;
                          const lastPoint = dailyMCPData[dailyMCPData.length - 1].price;
                          isPositiveTrend = lastPoint >= firstPoint;
                        }
                        
                        // Determine colors based on trend
                        const strokeColor = isPositiveTrend ? "#22c55e" : "#e11d48"; // Green or Red
                        const fillUrl = isPositiveTrend ? "url(#positiveGradient)" : "url(#negativeGradient)";
                        const dotFill = isPositiveTrend ? "#22c55e" : "#e11d48";
                        
                        return (
                          <>
                            <Tooltip content={<DailyMCPTooltip dayRange={selectedDayRange} isPositiveTrend={isPositiveTrend} />} />
                            
                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke={strokeColor}
                              strokeWidth={1.5}
                              fill={fillUrl}
                              dot={false}
                              activeDot={{ r: 4, fill: dotFill, stroke: dotFill, strokeWidth: 0 }}
                              animationDuration={500}
                              isAnimationActive={true}
                            />
                          </>
                        );
                      })()}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Purchase vs Sell Bid Chart */}
            <Card className="p-6 bg-card border-border shadow-sm">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Purchase vs Sell Bids
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDayRange === "1D" 
                      ? "Hourly bids from last 24 hours" 
                      : selectedDayRange === "5D"
                      ? "Daily bid averages from latest 5 days"
                      : `Daily bid averages from ${selectedDayRange === "custom" ? "custom period" : selectedDayRange === "MAX" ? "all available data" : `last ${selectedDayRange}`}`
                    }
                  </p>
                </div>
              </div>
              <div className="h-80">
                {(dailyBidLoading || loadingCSV) ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm">Loading bid data...</span>
                  </div>
                ) : dailyBidError && selectedDayRange === "1D" ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm text-red-500">Error loading bid data</p>
                      <p className="text-xs text-muted-foreground mt-1">{dailyBidError}</p>
                    </div>
                  </div>
                ) : (selectedDayRange === "1D" && !dailyBidData) || 
                   (selectedDayRange !== "1D" && (!dailyBidDataFromCSV || dailyBidDataFromCSV.length === 0)) ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">No bid data available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try a different date range 
                        {selectedDayRange !== "1D" && (
                          <> (CSV data: {dailyBidDataFromCSV?.length || 0} records)</>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={
                        // For 1D view, use hourly data from API
                        selectedDayRange === "1D" 
                          ? dailyBidData 
                          : (() => {
                              // For non-1D views, use the CSV data we processed
                              // Filter based on the selected time range
                              const now = new Date();
                              let startDate: Date;
                              
                              if (selectedDayRange === "custom" && dayCustomDateRange.from && dayCustomDateRange.to) {
                                startDate = dayCustomDateRange.from;
                                const endDate = dayCustomDateRange.to;
                                
                                return dailyBidDataFromCSV.filter(item => {
                                  if (!item.date) return false;
                                  
                                  const [day, month, year] = item.date.split('-').map(Number);
                                  const itemDate = new Date(year, month - 1, day);
                                  
                                  return itemDate >= startDate && itemDate <= endDate;
                                });
                              } else {
                                switch (selectedDayRange) {
                                  case "5D": {
                                    startDate = new Date(now);
                                    startDate.setDate(now.getDate() - 5);
                                    
                                    // For 5D view, get the latest 5 entries regardless of date
                                    const lastFiveDays = [...dailyBidDataFromCSV]
                                      .sort((a, b) => {
                                        // Sort by date (DD-MM-YYYY format) in descending order
                                        const [aDay, aMonth, aYear] = a.date.split('-').map(Number);
                                        const [bDay, bMonth, bYear] = b.date.split('-').map(Number);
                                        
                                        if (aYear !== bYear) return bYear - aYear;
                                        if (aMonth !== bMonth) return bMonth - aMonth;
                                        return bDay - aDay;
                                      })
                                      .slice(0, 5)
                                      .reverse(); // Reverse to get chronological order
                                      
                                    console.log("5D data:", lastFiveDays);
                                    return lastFiveDays;
                                  }
                                    
                                  case "1M":
                                    startDate = new Date(now);
                                    startDate.setMonth(now.getMonth() - 1);
                                    break;
                                  case "6M":
                                    startDate = new Date(now);
                                    startDate.setMonth(now.getMonth() - 6);
                                    break;
                                  case "1Y":
                                    startDate = new Date(now);
                                    startDate.setFullYear(now.getFullYear() - 1);
                                    break;
                                  case "MAX":
                                    return dailyBidDataFromCSV;
                                  default:
                                    startDate = new Date(now);
                                    startDate.setMonth(now.getMonth() - 1);
                                }
                                
                                return dailyBidDataFromCSV.filter(item => {
                                  if (!item.date) return false;
                                  
                                  const [day, month, year] = item.date.split('-').map(Number);
                                  const itemDate = new Date(year, month - 1, day);
                                  
                                  return itemDate >= startDate;
                                });
                              }
                            })()
                      } 
                      margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey={selectedDayRange === "1D" ? "time" : "date"}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        interval={selectedDayRange === "1D" ? 1 : "preserveStartEnd"}
                        angle={selectedDayRange === "1D" ? -45 : 0}
                        textAnchor={selectedDayRange === "1D" ? "end" : "middle"}
                        height={selectedDayRange === "1D" ? 80 : 60}
                        tickFormatter={(value) => {
                          // Mirror the formatting used in the MCP chart
                          if (selectedDayRange === "1D") {
                            return value;
                          }
                          
                          try {
                            // Parse the date from DD-MM-YYYY format
                            const [day, month, year] = value.split('-');
                            if (day && month && year) {
                              // Create date object
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              
                              // For 5D view, show day and month (e.g., "12 Jul")
                              if (selectedDayRange === "5D") {
                                return date.toLocaleDateString('en-US', { 
                                  day: 'numeric', 
                                  month: 'short'
                                });
                              }
                              // For other views, show month and year (e.g., "Sep 2024")
                              else {
                                return date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                });
                              }
                            }
                          } catch (e) {
                            console.error("Date parsing error:", e);
                          }
                          
                          // Return original if parsing fails
                          return value;
                        }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value: number) => `${(value/1000).toFixed(1)}k`}
                        label={{ value: 'Volume (MW)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                      />
                      <Tooltip 
                        content={<CustomTooltip dayRange={selectedDayRange} />}
                        formatter={(value, name) => {
                          return [
                            `${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 1 })} MW`, 
                            name === "purchaseBid" ? "Purchase Bid" : "Sell Bid"
                          ];
                        }}
                        labelFormatter={(label) => {
                          // For 1D view, time is already formatted properly as HH:00
                          if (selectedDayRange === "1D") {
                            return `Time: ${label}`;
                          }
                          
                          // For other views, parse the date
                          try {
                            // Parse the date from DD-MM-YYYY format
                            const [day, month, year] = label.split('-');
                            if (day && month && year) {
                              // Create date object
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              
                              return `Date: ${date.toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}`;
                            }
                          } catch (e) {
                            console.error("Date parsing error:", e);
                          }
                          return label;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="purchaseBid" 
                        stroke="hsl(var(--bullish))" 
                        strokeWidth={2}
                        dot={false}
                        name="Purchase Bid"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sellBid" 
                        stroke="hsl(var(--bearish))" 
                        strokeWidth={2}
                        dot={false}
                        name="Sell Bid"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-bullish rounded"></div>
                  <span className="text-sm text-muted-foreground">Purchase Bid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-bearish rounded"></div>
                  <span className="text-sm text-muted-foreground">Sell Bid</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesCharts;
