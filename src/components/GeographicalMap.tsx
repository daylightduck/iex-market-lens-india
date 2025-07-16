import { Card } from "@/components/ui/card";
import { MapPin, TrendingUp, TrendingDown, Zap } from "lucide-react";

// Sample regional data
const regionalData = [
  { region: "Northern Region", demand: 1.2, supply: 3.4, mcp: 6.8, trend: "up", states: ["Delhi", "Punjab", "Haryana"] },
  { region: "Western Region", demand: 1.8, supply: 4.2, mcp: 7.2, trend: "up", states: ["Maharashtra", "Gujarat", "Rajasthan"] },
  { region: "Southern Region", demand: 1.1, supply: 3.1, mcp: 6.1, trend: "down", states: ["Tamil Nadu", "Karnataka", "Andhra Pradesh"] },
  { region: "Eastern Region", demand: 0.8, supply: 2.9, mcp: 5.9, trend: "down", states: ["West Bengal", "Odisha", "Jharkhand"] },
];

const RegionalCard = ({ region, demand, supply, mcp, trend, states }: any) => {
  const isPositive = trend === "up";
  const surplus = supply - demand;
  
  return (
    <Card className="p-4 bg-card border-border hover:shadow-trading transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">{region}</h4>
        </div>
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-medium">₹{mcp}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Demand:</span>
          <span className="font-medium text-bearish">{demand} GW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Supply:</span>
          <span className="font-medium text-bullish">{supply} GW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Surplus:</span>
          <span className={`font-medium ${surplus > 0 ? 'text-bullish' : 'text-bearish'}`}>
            {surplus > 0 ? '+' : ''}{surplus.toFixed(1)} GW
          </span>
        </div>
        
        {/* Supply/Demand Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Supply vs Demand</span>
            <span>{((supply / (supply + demand)) * 100).toFixed(0)}% Supply</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-bearish to-bullish h-2 rounded-full transition-all duration-500"
              style={{ width: `${(supply / (supply + demand)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* States */}
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Key States:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {states.map((state: string) => (
              <span key={state} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                {state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const GeographicalMap = () => {
  return (
    <Card className="p-6 bg-card border-border mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span>Regional Market Overview</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Interactive regional breakdown of demand, supply, and market clearing prices across India
        </p>
      </div>

      {/* Interactive Map Placeholder */}
      <div className="mb-6 relative">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20 min-h-[300px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 text-primary mx-auto animate-pulse-glow" />
            <div>
              <h4 className="text-lg font-semibold text-foreground">Interactive Map of India</h4>
              <p className="text-sm text-muted-foreground">
                Choropleth visualization showing regional energy metrics
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click on states below for detailed regional analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalData.map((region, index) => (
          <div key={region.region} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <RegionalCard {...region} />
          </div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-bullish rounded"></div>
            <span className="text-muted-foreground">High Supply</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning rounded"></div>
            <span className="text-muted-foreground">Balanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-bearish rounded"></div>
            <span className="text-muted-foreground">High Demand</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GeographicalMap;