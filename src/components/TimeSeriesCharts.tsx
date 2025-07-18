import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useMCPData } from "@/hooks/useMCPData";
import { Loader2, Calendar as CalendarIcon, TrendingUp, BarChart3, Clock } from "lucide-react";
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white">{`${label}`}</p>
        <p className="text-sm text-white">
          {`MCP: ₹${payload[0].value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh`}
        </p>
      </div>
    );
  }
  return null;
};

export const TimeSeriesCharts = ({ filters }: TimeSeriesChartsProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(filters?.timeRange || "1W");
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hourly");

  const { 
    data: mcpData, 
    dailyData, 
    weeklyData, 
    stats, 
    loading, 
    error 
  } = useMCPData(
    selectedTimeRange,
    selectedTimeRange === "custom" ? customDateRange : undefined
  );

  const timeRangeButtons = [
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
    { value: "1Y", label: "1Y" },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      default:
        return mcpData;
    }
  };

  const getChartTitle = () => {
    const baseTitle = "Market Clearing Price (MCP)";
    const period = selectedTimeRange === "custom" ? "Custom Period" : `Last ${selectedTimeRange}`;
    const granularity = activeTab === "daily" ? "Daily" : activeTab === "weekly" ? "Weekly" : "Hourly";
    return `${baseTitle} — ${granularity} (${period})`;
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
                  onClick={() => setSelectedTimeRange(button.value as TimeRange)}
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
                    onSelect={(range) => {
                      setCustomDateRange({ from: range?.from, to: range?.to });
                      setSelectedTimeRange("custom");
                    }}
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

      {/* Multi-Level Average Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hourly Average */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Hourly Average</h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : stats ? (
                  `₹${stats.average.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ) : (
                  "--"
                )}
              </div>
              <p className="text-xs text-muted-foreground">per MWh</p>
            </div>
          </div>
        </Card>

        {/* Daily Average */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Daily Average</h4>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : stats?.dailyAverage ? (
                  `₹${stats.dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ) : (
                  "--"
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalDays ? `${stats.totalDays} days` : "per MWh"}
              </p>
            </div>
          </div>
        </Card>

        {/* Weekly Average */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Weekly Average</h4>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : stats?.weeklyAverage ? (
                  `₹${stats.weeklyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ) : (
                  "--"
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {weeklyData.length > 0 ? `${weeklyData.length} weeks` : "per MWh"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* MCP Chart with Tabs */}
      <Card className="p-0 bg-[#0D1117] border-[#30363d] hover:shadow-trading transition-all duration-300">
        <div className="p-6 pb-2">
          <h3 className="text-xl font-bold text-white text-center mb-4 font-['Inter',sans-serif]">
            {getChartTitle()}
          </h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#161b22] border-[#30363d]">
              <TabsTrigger value="hourly" className="text-white data-[state=active]:bg-[#1e3a8a]">
                Hourly View
              </TabsTrigger>
              <TabsTrigger value="daily" className="text-white data-[state=active]:bg-[#1e3a8a]">
                Daily View
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-[#1e3a8a]">
                Weekly View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hourly" className="mt-4">
              <p className="text-sm text-[#8b949e] text-center mb-4">
                {loading ? 'Loading...' : `${mcpData.length} hourly data points`}
              </p>
            </TabsContent>
            
            <TabsContent value="daily" className="mt-4">
              <p className="text-sm text-[#8b949e] text-center mb-4">
                {loading ? 'Loading...' : `${dailyData.length} daily averages`}
              </p>
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-4">
              <p className="text-sm text-[#8b949e] text-center mb-4">
                {loading ? 'Loading...' : `${weeklyData.length} weekly averages`}
              </p>
            </TabsContent>
          </Tabs>
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
          ) : getCurrentData().length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-[#8b949e]">No data available</p>
                <p className="text-xs text-[#8b949e] mt-1">Try a different time range or view</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="midnightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#D1D5DA"
                  fontSize={10}
                  tickLine={{ stroke: '#D1D5DA' }}
                  axisLine={{ stroke: '#D1D5DA' }}
                  interval={activeTab === "hourly" ? 0 : "preserveStartEnd"}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#D1D5DA"
                  fontSize={11}
                  tickLine={{ stroke: '#D1D5DA' }}
                  axisLine={{ stroke: '#D1D5DA' }}
                  tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`}
                  domain={['dataMin - 200', 'dataMax + 200']}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <Tooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fill="url(#midnightGradient)"
                  dot={{ fill: "#ffffff", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Enhanced Stats Display */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#30363d]">
            <div className="text-center">
              <div className="text-sm text-[#8b949e]">Min</div>
              <div className="text-lg font-semibold text-green-400">
                {stats ? `₹${stats.min.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '--'}
              </div>
              <div className="text-xs text-[#8b949e]">{stats?.minTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[#8b949e]">Max</div>
              <div className="text-lg font-semibold text-red-400">
                {stats ? `₹${stats.max.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '--'}
              </div>
              <div className="text-xs text-[#8b949e]">{stats?.maxTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[#8b949e]">Hourly Avg</div>
              <div className="text-lg font-semibold text-blue-400">
                {stats ? `₹${stats.average.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '--'}
              </div>
              <div className="text-xs text-[#8b949e]">{stats?.totalHours} hours</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[#8b949e]">Daily Avg</div>
              <div className="text-lg font-semibold text-purple-400">
                {stats?.dailyAverage ? `₹${stats.dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '--'}
              </div>
              <div className="text-xs text-[#8b949e]">{stats?.totalDays || 0} days</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeSeriesCharts;
