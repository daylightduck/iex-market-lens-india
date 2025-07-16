import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap, DollarSign, Activity } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  className?: string;
}

const KPICard = ({ title, value, subtitle, trend, icon, className }: KPICardProps) => {
  const trendColor = trend === "up" ? "text-bullish" : trend === "down" ? "text-bearish" : "text-muted-foreground";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className={`p-6 bg-card border-border hover:shadow-trading transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            {subtitle && (
              <span className={`text-sm font-medium ${trendColor} flex items-center space-x-1`}>
                {TrendIcon && <TrendIcon className="h-4 w-4" />}
                <span>{subtitle}</span>
              </span>
            )}
          </div>
        </div>
        <div className="text-primary/70 transform transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const KPIBanner = () => {
  const kpiData = [
    {
      title: "Total Traded Volume",
      value: "12.5 GW",
      subtitle: "+2.3%",
      trend: "up" as const,
      icon: <Activity className="h-8 w-8" />,
    },
    {
      title: "Current Demand",
      value: "4.2 GW",
      subtitle: "Supply: 13.7 GW",
      trend: "neutral" as const,
      icon: <Zap className="h-8 w-8" />,
    },
    {
      title: "MCP (Average)",
      value: "₹6.78",
      subtitle: "Per Unit",
      trend: "up" as const,
      icon: <DollarSign className="h-8 w-8" />,
    },
    {
      title: "MCP Range",
      value: "₹2.30",
      subtitle: "Max: ₹9.70",
      trend: "neutral" as const,
      icon: <TrendingUp className="h-8 w-8" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
          <KPICard {...kpi} />
        </div>
      ))}
    </div>
  );
};

export default KPIBanner;