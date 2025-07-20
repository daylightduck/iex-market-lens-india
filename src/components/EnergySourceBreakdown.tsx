import { Card } from "@/components/ui/card";
import { Sun, Wind, Droplets, Flame, Battery, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EnergySourceCardProps {
  title: string;
  current: number;
  capacity: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
}

const EnergySourceCard = ({ title, current, capacity, percentage, trend, icon, color }: EnergySourceCardProps) => {
  const trendIndicator = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  const trendColor = trend === "up" ? "text-bullish" : trend === "down" ? "text-bearish" : "text-muted-foreground";

  return (
    <Card className="p-6 bg-card border-border hover:shadow-trading transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <div className={`text-sm font-medium ${trendColor} flex items-center space-x-1`}>
          <span>{trendIndicator}</span>
          <span>{percentage}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Output:</span>
          <span className="font-medium text-foreground">{current} GW</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Installed Capacity:</span>
          <span className="font-medium text-foreground">{capacity} GW</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span className="text-muted-foreground">{Math.round((current / capacity) * 100)}%</span>
          </div>
          <Progress 
            value={(current / capacity) * 100} 
            className="h-2"
          />
        </div>

        {/* 24h Mini Chart Placeholder */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">24h Trend</p>
          <div className="flex items-end space-x-1 h-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${color.replace('bg-', 'bg-').replace('/20', '/40')} rounded-sm transition-all duration-300 group-hover:opacity-80`}
                style={{ 
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const WeatherCard = ({ title, value, unit, icon, trend }: any) => {
  return (
    <Card className="p-4 bg-card border-border hover:shadow-trading transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
            {icon}
          </div>
          <div>
            <h5 className="font-medium text-foreground">{title}</h5>
            <p className="text-sm text-muted-foreground">{value} {unit}</p>
          </div>
        </div>
        <div className={`text-xs ${trend > 0 ? 'text-bullish' : 'text-bearish'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      </div>
    </Card>
  );
};

export const EnergySourceBreakdown = () => {
  const energySources = [
    {
      title: "Solar Power",
      current: 2.8,
      capacity: 8.2,
      percentage: 12.5,
      trend: "up" as const,
      icon: <Sun className="h-5 w-5" />,
      color: "bg-warning/20 text-warning",
    },
    {
      title: "Wind Power",
      current: 1.9,
      capacity: 6.1,
      percentage: 8.7,
      trend: "up" as const,
      icon: <Wind className="h-5 w-5" />,
      color: "bg-secondary/20 text-secondary",
    },
    {
      title: "Hydro Power",
      current: 3.2,
      capacity: 4.8,
      percentage: 14.8,
      trend: "stable" as const,
      icon: <Droplets className="h-5 w-5" />,
      color: "bg-primary/20 text-primary",
    },
    {
      title: "Thermal Power",
      current: 5.8,
      capacity: 12.4,
      percentage: 26.9,
      trend: "down" as const,
      icon: <Flame className="h-5 w-5" />,
      color: "bg-bearish/20 text-bearish",
    },
  ];

  const weatherFactors = [
    {
      title: "Solar Irradiance",
      value: "901",
      unit: "W/m²",
      icon: <Sun className="h-4 w-4" />,
      trend: 8.2
    },
    {
      title: "Wind Speed",
      value: "7 km/h",
      unit: "km/h",
      icon: <Wind className="h-4 w-4" />,
      trend: 5.1
    },
    {
      title: "Rainfall",
      value: "8.7",
      unit: "mm",
      icon: <Droplets className="h-4 w-4" />,
      trend: -2.3
    },
  ];

  return (
    <div className="space-y-8">
      {/* Energy Sources Grid */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center space-x-2">
            <Battery className="h-6 w-6 text-primary" />
            <span>Energy Source Breakdown</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Current generation and capacity utilization across different energy sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {energySources.map((source, index) => (
            <div key={source.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <EnergySourceCard {...source} />
            </div>
          ))}
        </div>
      </div>

      {/* Weather Influencing Factors */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span>Influencing Weather Factors</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Current weather conditions affecting renewable energy generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weatherFactors.map((factor, index) => (
            <div key={factor.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <WeatherCard {...factor} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnergySourceBreakdown;