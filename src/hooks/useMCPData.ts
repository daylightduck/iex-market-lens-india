import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MCPDataPoint {
  time: string;
  price: number;
}

interface MCPStats {
  min: number;
  max: number;
  average: number;
  minTime: string;
  maxTime: string;
  totalHours: number;
}

type TimeRange = '1D' | '1W' | '1M' | '1Y' | 'custom';

interface DateRange {
  from?: Date;
  to?: Date;
}

export const useMCPData = (
  timeRange: TimeRange = '1D',
  dateRange?: DateRange
) => {
  const [data, setData] = useState<MCPDataPoint[]>([]);
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const safeParseMCP = (value: any): number | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return null;
    }
    
    return numValue;
  };

  const fetchMCPData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all data from Supabase
      const { data: damData, error: fetchError } = await supabase
        .from('dam_snapshot')
        .select('*')
        .order('Date', { ascending: true })
        .order('Hour', { ascending: true })
        .order('Time Block', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (!damData || damData.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      console.log('Raw data sample:', damData.slice(0, 5));

      // Get the most recent date
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );

      const sortedDates = availableDates.sort((a, b) => {
        return parseDate(b).getTime() - parseDate(a).getTime();
      });

      let filteredDates: string[] = [];
      
      if (timeRange === 'custom' && dateRange?.from && dateRange?.to) {
        filteredDates = availableDates.filter(dateStr => {
          const date = parseDate(dateStr);
          return date >= dateRange.from! && date <= dateRange.to!;
        });
      } else {
        switch (timeRange) {
          case '1D':
            filteredDates = sortedDates.slice(1, 2);
            break;
          case '1W':
            filteredDates = sortedDates.slice(0, 7);
            break;
          case '1M':
            filteredDates = sortedDates.slice(0, 30);
            break;
          case '1Y':
            filteredDates = sortedDates.slice(0, 365);
            break;
          default:
            filteredDates = sortedDates.slice(0, 1);
        }
      }

      if (filteredDates.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      console.log('Processing dates:', filteredDates);

      // Process data for all filtered dates
      const allHourlyData = new Map<number, number[]>();
      let allPrices: number[] = [];
      
      filteredDates.forEach(targetDate => {
        const dayData = damData.filter((row) => row.Date === targetDate);
        console.log(`Data for ${targetDate}:`, dayData.length, 'rows');
        
        // Group by hour for this date
        const hourlyData = new Map<number, number[]>();
        
        dayData.forEach((row, index) => {
          const hour = Number(row.Hour);
          const mcpValue = safeParseMCP(row['MCP (Rs/MWh)']);
          
          console.log(`Row ${index}: Hour=${hour}, MCP=${mcpValue}, Raw=${row['MCP (Rs/MWh)']}`);
          
          if (hour >= 1 && hour <= 24 && mcpValue !== null) {
            if (!hourlyData.has(hour)) {
              hourlyData.set(hour, []);
            }
            hourlyData.get(hour)!.push(mcpValue);
            allPrices.push(mcpValue);
          }
        });

        console.log('Hours with data:', Array.from(hourlyData.keys()).sort((a, b) => a - b));

        // Store hourly averages
        for (let hour = 1; hour <= 24; hour++) {
          const hourPrices = hourlyData.get(hour);
          if (hourPrices && hourPrices.length > 0) {
            const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
            
            if (!allHourlyData.has(hour)) {
              allHourlyData.set(hour, []);
            }
            allHourlyData.get(hour)!.push(avgPrice);
          }
        }
      });

      console.log('Final hours with data:', Array.from(allHourlyData.keys()).sort((a, b) => a - b));

      // Create hourly points for ALL 24 hours
      const hourlyPoints: MCPDataPoint[] = [];
      
      for (let hour = 1; hour <= 24; hour++) {
        const hourPrices = allHourlyData.get(hour);
        
        if (hourPrices && hourPrices.length > 0) {
          const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
          
          // Convert hour to display format
          const displayHour = hour === 24 ? 0 : hour;
          const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
          
          hourlyPoints.push({
            time: timeLabel,
            price: Math.round(avgPrice * 100) / 100
          });
        } else {
          // Handle missing hours - you can either skip them or interpolate
          console.warn(`No data for hour ${hour}`);
          
          // Option 1: Skip missing hours (current behavior)
          // continue;
          
          // Option 2: Add placeholder with average of available hours
          if (allPrices.length > 0) {
            const globalAvg = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
            const displayHour = hour === 24 ? 0 : hour;
            const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
            
            hourlyPoints.push({
              time: timeLabel,
              price: Math.round(globalAvg * 100) / 100
            });
          }
        }
      }

      // Sort by time (00:00 should come first)
      hourlyPoints.sort((a, b) => {
        const timeToMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      console.log('Final hourly points:', hourlyPoints.length, hourlyPoints);

      // Calculate comprehensive statistics
      if (hourlyPoints.length > 0 && allPrices.length > 0) {
        const hourlyPrices = hourlyPoints.map((p) => p.price);
        const minPrice = Math.min(...hourlyPrices);
        const maxPrice = Math.max(...hourlyPrices);
        const overallAverage = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
        const minPoint = hourlyPoints.find((p) => p.price === minPrice);
        const maxPoint = hourlyPoints.find((p) => p.price === maxPrice);

        setStats({
          min: minPrice,
          max: maxPrice,
          average: Math.round(overallAverage * 100) / 100,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || '',
          totalHours: hourlyPoints.length
        });
      } else {
        setStats(null);
      }

      setData(hourlyPoints);
    } catch (err) {
      console.error('Error fetching MCP data:', err);
      setError(
        err instanceof Error ? err.message : 'Unexpected error fetching data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMCPData();
  }, [timeRange, dateRange?.from, dateRange?.to]);

  return { data, stats, loading, error, refetch: fetchMCPData };
};
