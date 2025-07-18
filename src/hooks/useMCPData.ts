import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MCPDataPoint {
  time: string;
  price: number;
}

interface MCPStats {
  min: number;
  max: number;
  minTime: string;
  maxTime: string;
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

      // Get unique dates and use the first available date
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );
      
      if (availableDates.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      const targetDate = availableDates[0];
      const dayData = damData.filter((row) => row.Date === targetDate);

      // Group data by hour and calculate hourly averages
      const hourlyData = new Map<number, number[]>();
      
      dayData.forEach((row) => {
        const hour = Number(row.Hour);
        const mcpValue = Number(row['MCP (Rs/MWh)']);
        
        if (hour && mcpValue && hour >= 1 && hour <= 24) {
          if (!hourlyData.has(hour)) {
            hourlyData.set(hour, []);
          }
          hourlyData.get(hour)!.push(mcpValue);
        }
      });

      // Calculate average MCP for each hour
      const hourlyPoints: MCPDataPoint[] = [];
      
      for (let hour = 1; hour <= 24; hour++) {
        const hourPrices = hourlyData.get(hour);
        if (hourPrices && hourPrices.length > 0) {
          const avgPrice = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
          const displayHour = hour === 24 ? 0 : hour; // Convert hour 24 to 0 for display
          const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
          
          hourlyPoints.push({
            time: timeLabel,
            price: Math.round(avgPrice * 100) / 100
          });
        }
      }

      // Sort by time for proper display
      hourlyPoints.sort((a, b) => {
        const timeA = a.time === '00:00' ? '24:00' : a.time; // Sort 00:00 at the end
        const timeB = b.time === '00:00' ? '24:00' : b.time;
        return timeA.localeCompare(timeB);
      });

      // Calculate statistics
      if (hourlyPoints.length > 0) {
        const prices = hourlyPoints.map((p) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minPoint = hourlyPoints.find((p) => p.price === minPrice);
        const maxPoint = hourlyPoints.find((p) => p.price === maxPrice);

        setStats({
          min: minPrice,
          max: maxPrice,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || ''
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
