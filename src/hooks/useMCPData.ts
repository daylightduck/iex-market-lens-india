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
 console.log('Raw data from Supabase:', damData);
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
      console.log('Using target date:', targetDate);

      // Filter data for the target date
      const dayData = damData.filter((row) => row.Date === targetDate);
      console.log('Filtered data for target date:', dayData);

      // Process data points
      const points: MCPDataPoint[] = dayData
        .map((row) => {
          // Extract hour and MCP value
          const hour = Number(row.Hour);
          const mcpValue = Number(row['MCP (Rs/MWh)']);
          const timeBlock = row['Time Block'];

          // Skip invalid data
          if (!hour || !mcpValue || !timeBlock) return null;

          // Extract start time from "HH:MM - HH:MM" format
          const timeMatch = timeBlock.match(/^(\d{1,2}):(\d{2})/);
          let displayTime = '';
          
          if (timeMatch) {
            displayTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          } else {
            // Fallback: use hour to generate time
            const adjustedHour = hour === 1 ? 0 : hour - 1;
            displayTime = `${adjustedHour.toString().padStart(2, '0')}:00`;
          }

          return {
            time: displayTime,
            price: Math.round(mcpValue * 100) / 100
          };
        })
        .filter(Boolean) as MCPDataPoint[];

      // Remove duplicates and sort by time
      const uniquePoints = Array.from(
        new Map(points.map((p) => [p.time, p])).values()
      ).sort((a, b) => a.time.localeCompare(b.time));

      console.log('Processed unique points:', uniquePoints);

      // Calculate statistics
      if (uniquePoints.length > 0) {
        const prices = uniquePoints.map((p) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minPoint = uniquePoints.find((p) => p.price === minPrice);
        const maxPoint = uniquePoints.find((p) => p.price === maxPrice);

        setStats({
          min: minPrice,
          max: maxPrice,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || ''
        });
      } else {
        setStats(null);
      }

      setData(uniquePoints);
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
