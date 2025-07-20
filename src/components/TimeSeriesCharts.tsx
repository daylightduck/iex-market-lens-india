import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { useMCPData } from "@/hooks/useMCPData";
import { useBidData } from "@/hooks/useBidData";
import { Loader2, Calendar as CalendarIcon, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";

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

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-trading">
        <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
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

export const TimeSeriesCharts: React.FC<TimeSeriesChartsProps> = ({ filters }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(filters?.timeRange || "1D");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  const { data: mcpData, stats, loading, error } = useMCPData(
    selectedTimeRange,
    selectedTimeRange === "custom" ? customDateRange : undefined
  );

  const { data: bidData, stats: bidStats, loading: bidLoading, error: bidError } = useBidData(
    selectedTimeRange,
    selectedTimeRange === "custom" ? customDateRange : undefined
  );

  const timeRangeButtons: Array<{ value: TimeRange; label: string }> = [
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
  ];

  const handleTimeRangeChange = (value: TimeRange): void => {
    setSelectedTimeRange(value);
  };

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined): void => {
    setCustomDateRange({ from: range?.from, to: range?.to });
    setSelectedTimeRange("custom");
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter Controls */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4">
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
          
          {selectedTimeRange === "custom" && (customDateRange.from || customDateRange.to) && (
            <div className="text-sm text-muted-foreground">
              {customDateRange.from && format(customDateRange.from, "MMM dd, yyyy")} 
              {customDateRange.from && customDateRange.to && " - "}
              {customDateRange.to && format(customDateRange.to, "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards Row */}
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

      {/* Two-column layout for both charts */}
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
                    dot={{ fill: "hsl(var(--bullish))", r: 4 }}
                    name="Purchase Bid"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sellBid" 
                    stroke="hsl(var(--bearish))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--bearish))", r: 4 }}
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
    </div>
  );
};

export default TimeSeriesCharts;
