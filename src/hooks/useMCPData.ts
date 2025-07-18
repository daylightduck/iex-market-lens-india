
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
        .order('Date', { ascending: true })
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

      // Process the real data from Supabase
      const validData: MCPDataPoint[] = [];
      
      // Get available dates from the data
      const availableDates = [...new Set(damData.map((row: any) => row['Date']).filter(Boolean))];
      console.log("Available dates:", availableDates);
      
      // Use the first available date if it exists
      const targetDate = availableDates.length > 0 ? availableDates[0] : null;
      
      if (!targetDate) {
        console.log("No dates found in data");
        setData([]);
        setStats(null);
        return;
      }
      
      console.log("Using target date:", targetDate);
      const filteredData = damData.filter((row: any) => row['Date'] === targetDate);
      
      console.log("Filtered data for", targetDate, ":", filteredData);
      
      // Sort by hour and time block to get proper chronological order
      filteredData.sort((a, b) => {
        const hourA = parseInt(String(a['Hour'])) || 0;
        const hourB = parseInt(String(b['Hour'])) || 0;
        if (hourA !== hourB) return hourA - hourB;
        
        // If same hour, sort by time block
        const timeA = a['Time Block'] || '';
        const timeB = b['Time Block'] || '';
        return timeA.localeCompare(timeB);
      });
      
      // Process each data point
      filteredData.forEach((row: any) => {
        const hour = parseInt(String(row['Hour'])) || 0;
        const timeBlock = String(row['Time Block'] || '');
        const mcpValue = parseFloat(String(row['MCP (Rs/MWh)'])) || 0;
        
        if (mcpValue > 0 && hour > 0) {
          // Extract start time from time block (e.g., "00:15 - 00:30" -> "00:15")
          let displayTime = '';
          const timeMatch = timeBlock.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            displayTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          } else {
            // Fallback to hour-based time
            displayTime = `${(hour - 1).toString().padStart(2, '0')}:00`;
          }
          
          validData.push({
            time: displayTime,
            price: Math.round(mcpValue * 100) / 100
          });
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
