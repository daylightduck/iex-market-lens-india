
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useMCPData } from "@/hooks/useMCPData";
import { Loader2 } from "lucide-react";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";

interface TimeSeriesChartsProps {
  filters?: {
    timeRange: TimeRange;
    dateRange: { from?: Date; to?: Date };
    region: string;
    state: string;
  };
}

// Sample data for demonstration
const demandSupplyData = [
  { time: "00:00", demand: 3.2, supply: 12.1 },
  { time: "04:00", demand: 2.8, supply: 11.5 },
  { time: "08:00", demand: 4.1, supply: 13.2 },
  { time: "12:00", demand: 4.8, supply: 14.0 },
  { time: "16:00", demand: 5.2, supply: 14.5 },
  { time: "20:00", demand: 4.5, supply: 13.8 },
  { time: "24:00", demand: 3.6, supply: 12.9 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-trading">
        <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'price' 
              ? `${entry.name}: ₹${entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : `${entry.name}: ${entry.value} GW`
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TimeSeriesCharts = ({ filters }: TimeSeriesChartsProps) => {
  const { data: mcpData, stats, loading, error } = useMCPData(
    filters?.timeRange || "1D",
    filters?.dateRange
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Demand vs Supply Chart */}
      <Card className="p-6 bg-card border-border hover:shadow-trading transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Demand & Supply Trend</h3>
          <p className="text-sm text-muted-foreground">Real-time power demand and supply over 24 hours</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demandSupplyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Power (GW)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="demand" 
                stroke="hsl(var(--bearish))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--bearish))", r: 4 }}
                name="Demand"
              />
              <Line 
                type="monotone" 
                dataKey="supply" 
                stroke="hsl(var(--bullish))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--bullish))", r: 4 }}
                name="Supply"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-bearish rounded"></div>
            <span className="text-sm text-muted-foreground">Demand</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-bullish rounded"></div>
            <span className="text-sm text-muted-foreground">Supply</span>
          </div>
        </div>
      </Card>

      {/* Modern MCP Chart */}
      <Card className="p-0 bg-[#0D1117] border-[#30363d] col-span-full">
        <div className="p-6 pb-2">
          <h3 className="text-xl font-bold text-white text-center mb-1 font-['Inter',sans-serif]">
            Market Clearing Price (MCP) — 02 July 2025
          </h3>
          <p className="text-sm text-[#8b949e] text-center">
            {loading ? 'Loading...' : 'Historical price trends with min/max indicators'}
          </p>
        </div>
        <div className="h-96 px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-red-400">Error loading data</p>
                <p className="text-xs text-[#8b949e] mt-1">{error}</p>
              </div>
            </div>
          ) : mcpData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#8b949e]">No MCP data available for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mcpData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  interval={15}
                  angle={0}
                  textAnchor="middle"
                  height={50}
                />
                <YAxis 
                  stroke="#D1D5DA"
                  fontSize={11}
                  tickLine={{ stroke: '#D1D5DA' }}
                  axisLine={{ stroke: '#D1D5DA' }}
                  tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`}
                  domain={['dataMin - 500', 'dataMax + 500']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
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
                  }}
                />
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
        <div className="flex justify-between px-6 pb-6">
          <div className="text-left">
            <span className="text-sm font-medium text-green-400">Min: </span>
            <span className="text-sm text-green-400">
              {stats ? `₹${stats.min.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/MWh` : '₹1,667.48/MWh'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-red-400">Max: </span>
            <span className="text-sm text-red-400">
              {stats ? `₹${stats.max.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/MWh` : '₹5,200.78/MWh'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeSeriesCharts;
