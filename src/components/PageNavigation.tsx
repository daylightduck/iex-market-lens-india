import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Map, Battery } from "lucide-react";

const PageNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      path: "/dam-forecast",
      label: "DAM Forecast",
      icon: TrendingUp,
    },
    {
      path: "/regional-market",
      label: "Regional Market",
      icon: Map,
    },
    {
      path: "/energy-sources",
      label: "Energy Sources",
      icon: Battery,
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        const Icon = item.icon;
        
        return (
          <Link key={item.path} to={item.path}>
            <Button 
              variant={isActive ? "default" : "outline"} 
              size="sm" 
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default PageNavigation;