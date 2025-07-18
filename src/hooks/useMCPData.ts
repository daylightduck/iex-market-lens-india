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

      // Get all unique dates
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );

      // Use the most recent date for 1D view
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
            filteredDates = sortedDates.slice(0, 1);
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

      // Process data for all filtered dates
      const allHourlyData = new Map<string, number[]>();
      let allPrices: number[] = [];
      
      filteredDates.forEach(targetDate => {
        const dayData = damData.filter((row) => row.Date === targetDate);
        
        // Group by hour for this date
        const hourlyData = new Map<number, number[]>();
        
        dayData.forEach((row) => {
          const hour = Number(row.Hour);
          const mcpValue = parseFloat(row['MCP (Rs/MWh)']);
          
          // More lenient validation - accept any positive number
          if (hour >= 1 && hour <= 24 && mcpValue > 0 && !isNaN(mcpValue)) {
            if (!hourlyData.has(hour)) {
              hourlyData.set(hour, []);
            }
            hourlyData.get(hour)!.push(mcpValue);
            allPrices.push(mcpValue);
          }
        });

        // Calculate hourly averages for ALL 24 hours
        for (let hour = 1; hour <= 24; hour++) {
          const hourPrices = hourlyData.get(hour);
          if (hourPrices && hourPrices.length > 0) {
            const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
            // Convert hour to display format (1-24 becomes 01:00-24:00, but 24 becomes 00:00)
            const displayHour = hour === 24 ? 0 : hour;
            const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
            
            if (!allHourlyData.has(timeLabel)) {
              allHourlyData.set(timeLabel, []);
            }
            allHourlyData.get(timeLabel)!.push(avgPrice);
          }
        }
      });

      // Create hourly points ensuring all 24 hours are included
      const hourlyPoints: MCPDataPoint[] = [];
      
      // Process hours 1-23 first (01:00 to 23:00)
      for (let hour = 1; hour <= 23; hour++) {
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
        const hourPrices = allHourlyData.get(timeLabel);
        
        if (hourPrices && hourPrices.length > 0) {
          const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
          hourlyPoints.push({
            time: timeLabel,
            price: Math.round(avgPrice * 100) / 100
          });
        }
      }
      
      // Handle hour 24 (which displays as 00:00)
      const midnightPrices = allHourlyData.get('00:00');
      if (midnightPrices && midnightPrices.length > 0) {
        const avgPrice = midnightPrices.reduce((sum, price) => sum + price, 0) / midnightPrices.length;
        hourlyPoints.push({
          time: '00:00',
          price: Math.round(avgPrice * 100) / 100
        });
      }

      // Sort by time (00:00 should come first)
      hourlyPoints.sort((a, b) => {
        // Convert time to minutes for proper sorting
        const timeToMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

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

      console.log('Final hourly points:', hourlyPoints.length, hourlyPoints);
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
