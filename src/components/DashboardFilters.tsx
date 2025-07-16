import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";

export const DashboardFilters = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("1D");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "1D", label: "24 Hours" },
    { value: "1W", label: "7 Days" },
    { value: "1M", label: "30 Days" },
    { value: "1Y", label: "1 Year" },
    { value: "custom", label: "Custom" },
  ];

  const regions = [
    { value: "all", label: "All Regions" },
    { value: "north", label: "Northern Region" },
    { value: "south", label: "Southern Region" },
    { value: "east", label: "Eastern Region" },
    { value: "west", label: "Western Region" },
  ];

  const states = [
    { value: "all", label: "All States" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "gujarat", label: "Gujarat" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "tamil-nadu", label: "Tamil Nadu" },
    { value: "karnataka", label: "Karnataka" },
  ];

  return (
    <Card className="p-6 mb-6 bg-card border-border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        
        {/* Time Controls */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Time Range</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedTimeRange === range.value ? "trading" : "filter"}
                size="sm"
                onClick={() => setSelectedTimeRange(range.value)}
                className="min-w-fit"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedTimeRange === "custom" && (
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Custom Date Range</span>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[150px]",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[150px]",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Geographical Filters */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-end">
          <Button variant="success" className="min-w-fit">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DashboardFilters;