import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart3, Battery, RotateCcw } from "lucide-react";

const DashboardNavigation = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: "DAM Forecast",
      icon: TrendingUp,
      onClick: () => navigate("/"),
    },
    {
      label: "Regional Market", 
      icon: BarChart3,
      onClick: () => navigate("/"),
    },
    {
      label: "Energy Sources",
      icon: Battery,
      onClick: () => navigate("/"),
    },
    {
      label: "Weather",
      icon: RotateCcw,
      onClick: () => navigate("/"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-card rounded-lg border">
      {navigationItems.map((item) => (
        <Button
          key={item.label}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3 h-auto"
          onClick={item.onClick}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default DashboardNavigation;