import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

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

const priceData = [
  { time: "00:00", price: 4.2 },
  { time: "04:00", price: 3.8 },
  { time: "08:00", price: 6.1 },
  { time: "12:00", price: 8.2 },
  { time: "16:00", price: 9.7 },
  { time: "20:00", price: 7.8 },
  { time: "24:00", price: 5.4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-trading">
        <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'price' ? ' ₹' : ' GW'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TimeSeriesCharts = () => {
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

      {/* Historical Price Chart */}
      <Card className="p-6 bg-card border-border hover:shadow-trading transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Market Clearing Price (MCP)</h3>
          <p className="text-sm text-muted-foreground">Historical price trends with min/max indicators</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#priceGradient)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center space-x-2 text-bullish">
            <span className="font-medium">Min:</span>
            <span>₹2.30</span>
          </div>
          <div className="flex items-center space-x-2 text-bearish">
            <span className="font-medium">Max:</span>
            <span>₹9.70</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeSeriesCharts;