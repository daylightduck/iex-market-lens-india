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

export const useMCPData = () => {
  const [data, setData] = useState<MCPDataPoint[]>([]);
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMCPData = async () => {
    try {
      setLoading(true);
      setError(null);


    const { data: damData, error:fetchError  } = await supabase
      .from('dam_snapshot')
      .select('*')

      if (fetchError) {
        throw fetchError;
      }
      console.log("---")
      console.log(damData)
      
      if (!damData || damData.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      // Group by hour and average the prices
      const hourlyData = new Map<number, number[]>();
      
      damData.forEach((row: any) => {
        const hour = Number(row.hour);
        const price = row.mcp_rs_per_mwh;
        
        if (!isNaN(hour) && price !== null && hour >= 1 && hour <= 24) {
          if (!hourlyData.has(hour)) {
            hourlyData.set(hour, []);
          }
          hourlyData.get(hour)!.push(price);
        }
      });

      // Calculate average price for each hour and convert to 24-hour format
      const processedData: MCPDataPoint[] = Array.from(hourlyData.entries())
        .map(([hour, prices]) => {
          const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          // Convert hour (1-24) to time format (00:00-23:00)
          const displayHour = hour === 24 ? 0 : hour;
          const timeStr = displayHour.toString().padStart(2, '0') + ':00';
          
          return {
            time: timeStr,
            price: Math.round(avgPrice * 100) / 100 // Round to 2 decimal places
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      // Calculate min/max statistics
      if (processedData.length > 0) {
        const prices = processedData.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minPoint = processedData.find(d => d.price === minPrice);
        const maxPoint = processedData.find(d => d.price === maxPrice);

        setStats({
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || ''
        });
      }

      setData(processedData);
    } catch (err) {
      console.error('Error fetching MCP data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMCPData();
  }, []);

  return { data, stats, loading, error, refetch: fetchMCPData };
};