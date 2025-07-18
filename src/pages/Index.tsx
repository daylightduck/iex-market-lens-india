
import { useState } from "react";
import { Zap, BarChart3, Clock, Map, Battery, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KPIBanner from "@/components/KPIBanner";
import DashboardFilters from "@/components/DashboardFilters";
import TimeSeriesCharts from "@/components/TimeSeriesCharts";
import ThemeToggle from "@/components/ThemeToggle";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";

const Index = () => {
  const [filters, setFilters] = useState<{
    timeRange: TimeRange;
    dateRange: { from?: Date; to?: Date };
    region: string;
    state: string;
  }>({
    timeRange: "1D",
    dateRange: {},
    region: "all",
    state: "all"
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Indian Energy Exchange (IEX)
                  </h1>
                  <p className="text-sm text-muted-foreground">Market Monitor Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/dam-forecast">
                <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <TrendingUp className="h-4 w-4" />
                  DAM Forecast
                </Button>
              </Link>
              
              <Link to="/regional-market">
                <Button variant="outline" size="sm" className="gap-2">
                  <Map className="h-4 w-4" />
                  Regional Market
                </Button>
              </Link>
              
              <Link to="/energy-sources">
                <Button variant="outline" size="sm" className="gap-2">
                  <Battery className="h-4 w-4" />
                  Energy Sources
                </Button>
              </Link>

              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })} IST
                </span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-bullish/10 border border-bullish/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-bullish" />
                <span className="text-sm font-medium text-bullish">Market Open</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Global Controls & Filters */}
        <DashboardFilters onFiltersChange={handleFiltersChange} />
        
        {/* KPI Banner */}
        <KPIBanner />
        
        {/* Time Series Charts */}
        <TimeSeriesCharts filters={filters} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Indian Energy Exchange Market Monitor. Real-time energy trading data.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Last Updated: {new Date().toLocaleTimeString('en-IN')}</span>
              <span>•</span>
              <span className="text-bullish">Live Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
