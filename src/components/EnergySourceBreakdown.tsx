import { Card } from "@/components/ui/card";
import { Sun, Wind, Droplets, Flame, Battery, Zap, Atom } from "lucide-react";
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
          <span className="text-muted-foreground">Daily Generation:</span>
          <span className="font-medium text-foreground">{current.toLocaleString('en-IN')} GWH</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Installed Capacity:</span>
          <span className="font-medium text-foreground">{capacity.toLocaleString('en-IN')} MW</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Daily Generation %</span>
            <span className="text-muted-foreground">{percentage.toFixed(2)}%</span>
          </div>
          <Progress 
            value={Math.min(percentage * 10, 100)} 
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


export const EnergySourceBreakdown = () => {
  // Real data from July 2025 India energy statistics
  // Percentages calculated as: (Daily Generation / Monthly Capacity) * 100
  const energySources = [
    {
      title: "Nuclear Power",
      current: 140.67, // GWH daily generation
      capacity: 8780, // MW installed capacity
      percentage: (140.67 / 8780) * 100, // 1.60%
      trend: "stable" as const,
      icon: <Atom className="h-5 w-5" />,
      color: "bg-bearish/20 text-bearish",
    },
    {
      title: "Hydro Power",
      current: 739.41, // GWH daily generation
      capacity: 49628.16, // MW installed capacity
      percentage: (739.41 / 49628.16) * 100, // 1.49%
      trend: "stable" as const,
      icon: <Droplets className="h-5 w-5" />,
      color: "bg-primary/20 text-primary",
    },
    {
      title: "Thermal Power",
      current: 3677.28, // GWH daily generation
      capacity: 242389.63, // MW installed capacity
      percentage: (3677.28 / 242389.63) * 100, // 1.52%
      trend: "down" as const,
      icon: <Flame className="h-5 w-5" />,
      color: "bg-warning/20 text-warning",
    },
    {
      title: "RES (Renewable)",
      current: 0, // No generation data available
      capacity: 184621.03, // MW installed capacity
      percentage: 0, // No data available
      trend: "up" as const,
      icon: <Sun className="h-5 w-5" />,
      color: "bg-bullish/20 text-bullish",
    },
    {
      title: "Bhutan Import",
      current: 38.24, // GWH daily import
      capacity: 38.24, // Treating import as capacity for display
      percentage: 100, // Showing as 100% since it's an import
      trend: "stable" as const,
      icon: <Zap className="h-5 w-5" />,
      color: "bg-secondary/20 text-secondary",
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
            Daily generation data for July 19, 2025 across India's energy sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {energySources.map((source, index) => (
            <div key={source.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <EnergySourceCard {...source} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EnergySourceBreakdown;