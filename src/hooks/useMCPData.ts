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
      // Get all data from Supabase first
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
        console.log('No data found in database');
        setData([]);
        setStats(null);
        return;
      }

      console.log('Total rows fetched:', damData.length);

      // Get all unique dates in the dataset
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );

      console.log('Available dates:', availableDates);

      // For development/testing: Use available data instead of strict date filtering
      // This ensures we always show data if it exists
      let filteredDates: string[] = [];

      if (timeRange === 'custom' && dateRange?.from && dateRange?.to) {
        // Only filter for custom ranges
        filteredDates = availableDates.filter(dateStr => {
          const date = parseDate(dateStr);
          return date >= dateRange.from! && date <= dateRange.to!;
        });
      } else {
        // For preset ranges, use all available data (for development)
        // In production, you'd want to implement proper date filtering
        filteredDates = availableDates;
        
        // Alternative: Use the most recent N dates based on timeRange
        const sortedDates = availableDates.sort((a, b) => {
          return parseDate(b).getTime() - parseDate(a).getTime();
        });
        
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

      console.log('Filtered dates:', filteredDates);

      if (filteredDates.length === 0) {
        console.log('No dates match the filter criteria');
        setData([]);
        setStats(null);
        return;
      }

      // Process data for all filtered dates
      const allHourlyData = new Map<string, number[]>();
      let allPrices: number[] = [];
      
      filteredDates.forEach(targetDate => {
        const dayData = damData.filter((row) => row.Date === targetDate);
        console.log(`Processing ${targetDate}: ${dayData.length} rows`);
        
        // Group by hour for this date
        const hourlyData = new Map<number, number[]>();
        
        dayData.forEach((row) => {
          const hour = Number(row.Hour);
          const mcpValue = Number(row['MCP (Rs/MWh)']);
          
          if (hour && mcpValue && hour >= 1 && hour <= 24) {
            if (!hourlyData.has(hour)) {
              hourlyData.set(hour, []);
            }
            hourlyData.get(hour)!.push(mcpValue);
            allPrices.push(mcpValue);
          }
        });

        // Calculate hourly averages for this date
        for (let hour = 1; hour <= 24; hour++) {
          const hourPrices = hourlyData.get(hour);
          if (hourPrices && hourPrices.length > 0) {
            const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
            const displayHour = hour === 24 ? 0 : hour;
            const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
            
            if (!allHourlyData.has(timeLabel)) {
              allHourlyData.set(timeLabel, []);
            }
            allHourlyData.get(timeLabel)!.push(avgPrice);
          }
        }
      });

      // Calculate overall hourly averages across all dates
      const hourlyPoints: MCPDataPoint[] = [];
      
      for (let hour = 1; hour <= 24; hour++) {
        const displayHour = hour === 24 ? 0 : hour;
        const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
        const hourPrices = allHourlyData.get(timeLabel);
        
        if (hourPrices && hourPrices.length > 0) {
          const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
          hourlyPoints.push({
            time: timeLabel,
            price: Math.round(avgPrice * 100) / 100
          });
        }
      }

      // Sort by time
      hourlyPoints.sort((a, b) => {
        const timeA = a.time === '00:00' ? '24:00' : a.time;
        const timeB = b.time === '00:00' ? '24:00' : b.time;
        return timeA.localeCompare(timeB);
      });

      console.log('Processed hourly points:', hourlyPoints.length);

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
