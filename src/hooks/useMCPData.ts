
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

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "custom";

interface DateRange {
  from?: Date;
  to?: Date;
}

export const useMCPData = (timeRange: TimeRange = "1D", dateRange?: DateRange) => {
  const [data, setData] = useState<MCPDataPoint[]>([]);
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateFilter = () => {
    const now = new Date();
    
    switch (timeRange) {
      case "1D":
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return { from: oneDayAgo, to: now };
      case "1W":
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: oneWeekAgo, to: now };
      case "1M":
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: oneMonthAgo, to: now };
      case "1Y":
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { from: oneYearAgo, to: now };
      case "custom":
        return dateRange || { from: new Date(), to: new Date() };
      default:
        return { from: new Date(), to: new Date() };
    }
  };

  const fetchMCPData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: damData, error: fetchError } = await supabase
        .from('dam_snapshot')
        .select('*')
        .order('date', { ascending: true })
        .limit(1000);

      if (fetchError) {
        throw fetchError;
      }
      
      console.log("Raw data:", damData);
      
      if (!damData || damData.length === 0) {
        setData([]);
        setStats(null);
        return;
      }

      const { from, to } = getDateFilter();
      console.log("Date filter:", { from, to, timeRange });

      // Filter and process data based on date range
      const validData: MCPDataPoint[] = [];
      
      damData.forEach((row: any) => {
        // Extract valid MCP price and date
        let price = null;
        let dateStr = '';
        let timeStr = '';
        
        // Handle the data structure
        if (row.id === 1 && row.mcp_rs_per_mwh !== null) {
          price = row.mcp_rs_per_mwh;
          dateStr = row.date || '';
          timeStr = row.time_block || '00:00';
        } else if (row.mcv_mw && typeof row.mcv_mw === 'number') {
          price = row.mcv_mw;
          dateStr = row.date || '';
          if (typeof row.hour === 'string' && row.hour.includes(':')) {
            timeStr = row.hour;
          } else if (typeof row.time_block === 'string') {
            timeStr = row.time_block;
          }
        }

        if (price && dateStr) {
          // Parse date - handle different date formats
          let rowDate: Date | null = null;
          
          // Try different date parsing approaches
          if (dateStr.includes('/')) {
            // Format: DD/MM/YYYY or MM/DD/YYYY
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Assume DD/MM/YYYY format for Indian data
              rowDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          } else if (dateStr.includes('-')) {
            // Format: YYYY-MM-DD
            rowDate = new Date(dateStr);
          } else {
            // Try direct parsing
            rowDate = new Date(dateStr);
          }

          // Check if date is within range
          if (rowDate && !isNaN(rowDate.getTime())) {
            if (timeRange === "custom" && dateRange) {
              if (dateRange.from && rowDate < dateRange.from) return;
              if (dateRange.to && rowDate > dateRange.to) return;
            } else {
              if (rowDate < from || rowDate > to) return;
            }

            // Extract time for display
            let displayTime = '';
            if (timeStr) {
              const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
              if (timeMatch) {
                const hour = parseInt(timeMatch[1]);
                displayTime = `${hour.toString().padStart(2, '0')}:00`;
              }
            }

            // For longer periods, show date + time, for 1D show only time
            const label = timeRange === "1D" 
              ? displayTime || `${validData.length}:00`
              : `${rowDate.toLocaleDateString('en-GB')} ${displayTime}`;

            validData.push({
              time: label,
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
  }, [timeRange, dateRange?.from, dateRange?.to]);

  return { data, stats, loading, error, refetch: fetchMCPData };
};
