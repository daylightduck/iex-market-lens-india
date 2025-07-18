import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MCPDataPoint {
  time: string;
  price: number;
  date?: string; // For daily/weekly aggregation
}

interface MCPStats {
  min: number;
  max: number;
  average: number;
  dailyAverage?: number;
  weeklyAverage?: number;
  minTime: string;
  maxTime: string;
  totalHours: number;
  totalDays?: number;
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
  const [dailyData, setDailyData] = useState<MCPDataPoint[]>([]);
  const [weeklyData, setWeeklyData] = useState<MCPDataPoint[]>([]);
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

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const getWeekNumber = (date: Date): string => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
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
        setDailyData([]);
        setWeeklyData([]);
        setStats(null);
        return;
      }

      // Get all unique dates and filter by time range
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );

      const filteredDates = availableDates.filter(dateStr => {
        const date = parseDate(dateStr);
        return date >= from && date <= to;
      });

      if (filteredDates.length === 0) {
        setData([]);
        setDailyData([]);
        setWeeklyData([]);
        setStats(null);
        return;
      }

      // Process data for multiple aggregation levels
      const allHourlyData = new Map<string, number[]>();
      const dailyAverages = new Map<string, number>();
      const weeklyAverages = new Map<string, number[]>();
      let allPrices: number[] = [];
      
      // Process each date
      filteredDates.forEach(targetDate => {
        const dayData = damData.filter((row) => row.Date === targetDate);
        const hourlyData = new Map<number, number[]>();
        const dayPrices: number[] = [];
        
        // Group by hour for this date
        dayData.forEach((row) => {
          const hour = Number(row.Hour);
          const mcpValue = Number(row['MCP (Rs/MWh)']);
          
          if (hour && mcpValue && hour >= 1 && hour <= 24) {
            if (!hourlyData.has(hour)) {
              hourlyData.set(hour, []);
            }
            hourlyData.get(hour)!.push(mcpValue);
            dayPrices.push(mcpValue);
            allPrices.push(mcpValue);
          }
        });

        // Calculate daily average
        if (dayPrices.length > 0) {
          const dailyAvg = dayPrices.reduce((sum, price) => sum + price, 0) / dayPrices.length;
          dailyAverages.set(targetDate, dailyAvg);
          
          // Group by week
          const date = parseDate(targetDate);
          const weekKey = getWeekNumber(date);
          if (!weeklyAverages.has(weekKey)) {
            weeklyAverages.set(weekKey, []);
          }
          weeklyAverages.get(weekKey)!.push(dailyAvg);
        }

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

      // Calculate overall hourly averages
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

      // Create daily data points
      const dailyPoints: MCPDataPoint[] = Array.from(dailyAverages.entries())
        .map(([date, avg]) => ({
          time: date,
          price: Math.round(avg * 100) / 100,
          date: date
        }))
        .sort((a, b) => parseDate(a.time).getTime() - parseDate(b.time).getTime());

      // Create weekly data points
      const weeklyPoints: MCPDataPoint[] = Array.from(weeklyAverages.entries())
        .map(([week, dailyAvgs]) => {
          const weeklyAvg = dailyAvgs.reduce((sum, avg) => sum + avg, 0) / dailyAvgs.length;
          return {
            time: week,
            price: Math.round(weeklyAvg * 100) / 100
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      // Sort hourly data
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

        // Calculate daily and weekly averages
        const dailyAvg = dailyPoints.length > 0 
          ? dailyPoints.reduce((sum, p) => sum + p.price, 0) / dailyPoints.length 
          : overallAverage;
        
        const weeklyAvg = weeklyPoints.length > 0 
          ? weeklyPoints.reduce((sum, p) => sum + p.price, 0) / weeklyPoints.length 
          : overallAverage;

        setStats({
          min: minPrice,
          max: maxPrice,
          average: Math.round(overallAverage * 100) / 100,
          dailyAverage: Math.round(dailyAvg * 100) / 100,
          weeklyAverage: Math.round(weeklyAvg * 100) / 100,
          minTime: minPoint?.time || '',
          maxTime: maxPoint?.time || '',
          totalHours: hourlyPoints.length,
          totalDays: dailyPoints.length
        });
      } else {
        setStats(null);
      }

      setData(hourlyPoints);
      setDailyData(dailyPoints);
      setWeeklyData(weeklyPoints);
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

  return { 
    data, 
    dailyData, 
    weeklyData, 
    stats, 
    loading, 
    error, 
    refetch: fetchMCPData 
  };
};
