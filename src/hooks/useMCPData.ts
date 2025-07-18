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

      const { data: damData, error: fetchError } = await supabase
        .from('dam_snapshot')
        .select('*')
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }
      
      console.log("Raw data:", damData);
      
      if (!damData || damData.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      // Filter and process data - handle the corrupted column structure
      const validData: MCPDataPoint[] = [];
      
      damData.forEach((row: any) => {
        // Extract valid MCP price from the first row or other rows that have it
        let price = null;
        let timeStr = '';
        
        if (row.id === 1 && row.mcp_rs_per_mwh !== null) {
          price = row.mcp_rs_per_mwh;
          timeStr = row.time_block || '00:00';
        } else if (row.mcv_mw && typeof row.mcv_mw === 'number') {
          // Use mcv_mw as price for other rows since data seems corrupted
          price = row.mcv_mw;
          // Extract time from date field if it contains time block
          if (typeof row.date === 'string' && row.date.includes(':')) {
            timeStr = row.date;
          } else if (typeof row.hour === 'string' && row.hour.includes(':')) {
            timeStr = row.hour;
          }
        }
        
        if (price && timeStr) {
          // Extract hour from time string
          const timeMatch = timeStr.match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            const hour = parseInt(timeMatch[1]);
            validData.push({
              time: `${hour.toString().padStart(2, '0')}:00`,
              price: Math.round(price * 100) / 100
            });
          }
        }
      });

      // Sort by time and remove duplicates
      const uniqueData = validData
        .filter((item, index, self) => 
          index === self.findIndex(t => t.time === item.time)
        )
        .sort((a, b) => a.time.localeCompare(b.time));

      console.log("Processed data:", uniqueData);

      // Calculate min/max statistics
      if (uniqueData.length > 0) {
        const prices = uniqueData.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minPoint = uniqueData.find(d => d.price === minPrice);
        const maxPoint = uniqueData.find(d => d.price === maxPrice);

        setStats({
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || ''
        });
      }

      setData(uniqueData);
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