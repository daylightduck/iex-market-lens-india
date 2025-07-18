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

  const getDateRange = () => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (timeRange) {
      case '1D':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1W':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        from = dateRange?.from ?? new Date(now.getTime() - 24 * 60 * 60 * 1000);
        to = dateRange?.to ?? now;
        break;
      default:
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { from, to };
  };

  const fetchMCPData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getDateRange();
      
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

      // Get all unique dates in the dataset
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );

      // Filter dates based on time range
      const filteredDates = availableDates.filter(dateStr => {
        const [day, month, year] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date >= from && date <= to;
      });

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
            const key = `${targetDate}-${timeLabel}`;
            
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
