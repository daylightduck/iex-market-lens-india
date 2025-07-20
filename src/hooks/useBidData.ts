import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BidDataPoint {
  time: string;
  purchaseBid: number;
  sellBid: number;
}

interface BidStats {
  purchaseBid: {
    min: number;
    max: number;
    average: number;
    minTime: string;
    maxTime: string;
  };
  sellBid: {
    min: number;
    max: number;
    average: number;
    minTime: string;
    maxTime: string;
  };
  totalHours: number;
}

type TimeRange = '1D' | '1W' | '1M' | '1Y' | 'custom';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatabaseRow {
  Date: string | null;
  Hour: number | null;
  'Time Block': string | null;
  'Purchase Bid (MW)': number | null;
  'Sell Bid (MW)': number | null;
  'MCV (MW)': number | null;
  'Final Scheduled Volume (MW)': number | null;
  'MCP (Rs/MWh)': number | null;
}

export const useBidData = (
  timeRange: TimeRange = '1D',
  dateRange?: DateRange
) => {
  const [data, setData] = useState<BidDataPoint[]>([]);
  const [stats, setStats] = useState<BidStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const safeParseBid = (value: any): number | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(numValue) || numValue < 0) {
      return null;
    }
    
    return numValue;
  };

  const fetchBidData = async (): Promise<void> => {
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

      const typedDamData = damData as DatabaseRow[];

      // Get available dates and filter based on time range
      const availableDates = Array.from(
        new Set(typedDamData.map((row) => row.Date).filter((date): date is string => Boolean(date)))
      );

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
      const allHourlyData = new Map<number, { purchaseBids: number[], sellBids: number[] }>();
      const allPurchaseBids: number[] = [];
      const allSellBids: number[] = [];
      
      filteredDates.forEach(targetDate => {
        const dayData = typedDamData.filter((row) => row.Date === targetDate);
        
        // Group by hour for this date
        const hourlyData = new Map<number, { purchaseBids: number[], sellBids: number[] }>();
        
        dayData.forEach((row) => {
          const hour = row.Hour;
          if (hour === null) return;
          
          const purchaseBidValue = safeParseBid(row['Purchase Bid (MW)']);
          const sellBidValue = safeParseBid(row['Sell Bid (MW)']);
          
          if (hour >= 1 && hour <= 24) {
            if (!hourlyData.has(hour)) {
              hourlyData.set(hour, { purchaseBids: [], sellBids: [] });
            }
            
            const hourData = hourlyData.get(hour)!;
            if (purchaseBidValue !== null) {
              hourData.purchaseBids.push(purchaseBidValue);
              allPurchaseBids.push(purchaseBidValue);
            }
            if (sellBidValue !== null) {
              hourData.sellBids.push(sellBidValue);
              allSellBids.push(sellBidValue);
            }
          }
        });

        // Store hourly averages
        for (let hour = 1; hour <= 24; hour++) {
          const hourData = hourlyData.get(hour);
          if (hourData) {
            if (!allHourlyData.has(hour)) {
              allHourlyData.set(hour, { purchaseBids: [], sellBids: [] });
            }
            
            const allHourData = allHourlyData.get(hour)!;
            
            if (hourData.purchaseBids.length > 0) {
              const avgPurchase = hourData.purchaseBids.reduce((sum, bid) => sum + bid, 0) / hourData.purchaseBids.length;
              allHourData.purchaseBids.push(avgPurchase);
            }
            
            if (hourData.sellBids.length > 0) {
              const avgSell = hourData.sellBids.reduce((sum, bid) => sum + bid, 0) / hourData.sellBids.length;
              allHourData.sellBids.push(avgSell);
            }
          }
        }
      });

      // Create hourly points for ALL 24 hours
      const hourlyPoints: BidDataPoint[] = [];
      
      for (let hour = 1; hour <= 24; hour++) {
        const hourData = allHourlyData.get(hour);
        
        // Convert hour to display format
        const displayHour = hour === 24 ? 0 : hour;
        const timeLabel = `${displayHour.toString().padStart(2, '0')}:00`;
        
        let avgPurchase = 0;
        let avgSell = 0;
        
        if (hourData) {
          if (hourData.purchaseBids.length > 0) {
            avgPurchase = hourData.purchaseBids.reduce((sum, bid) => sum + bid, 0) / hourData.purchaseBids.length;
          }
          if (hourData.sellBids.length > 0) {
            avgSell = hourData.sellBids.reduce((sum, bid) => sum + bid, 0) / hourData.sellBids.length;
          }
        }
        
        hourlyPoints.push({
          time: timeLabel,
          purchaseBid: Math.round(avgPurchase * 100) / 100,
          sellBid: Math.round(avgSell * 100) / 100
        });
      }

      // Sort by time (00:00 should come first)
      hourlyPoints.sort((a, b) => {
        const timeToMinutes = (time: string): number => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });

      // Calculate comprehensive statistics
      if (hourlyPoints.length > 0) {
        const purchaseBids = hourlyPoints.map((p) => p.purchaseBid).filter(bid => bid > 0);
        const sellBids = hourlyPoints.map((p) => p.sellBid).filter(bid => bid > 0);
        
        if (purchaseBids.length > 0 && sellBids.length > 0) {
          const minPurchase = Math.min(...purchaseBids);
          const maxPurchase = Math.max(...purchaseBids);
          const avgPurchase = purchaseBids.reduce((sum, bid) => sum + bid, 0) / purchaseBids.length;
          const minPurchasePoint = hourlyPoints.find((p) => p.purchaseBid === minPurchase);
          const maxPurchasePoint = hourlyPoints.find((p) => p.purchaseBid === maxPurchase);
          
          const minSell = Math.min(...sellBids);
          const maxSell = Math.max(...sellBids);
          const avgSell = sellBids.reduce((sum, bid) => sum + bid, 0) / sellBids.length;
          const minSellPoint = hourlyPoints.find((p) => p.sellBid === minSell);
          const maxSellPoint = hourlyPoints.find((p) => p.sellBid === maxSell);

          setStats({
            purchaseBid: {
              min: minPurchase,
              max: maxPurchase,
              average: Math.round(avgPurchase * 100) / 100,
              minTime: minPurchasePoint?.time || '',
              maxTime: maxPurchasePoint?.time || ''
            },
            sellBid: {
              min: minSell,
              max: maxSell,
              average: Math.round(avgSell * 100) / 100,
              minTime: minSellPoint?.time || '',
              maxTime: maxSellPoint?.time || ''
            },
            totalHours: hourlyPoints.length
          });
        }
      } else {
        setStats(null);
      }

      setData(hourlyPoints);
    } catch (err) {
      console.error('Error fetching bid data:', err);
      setError(
        err instanceof Error ? err.message : 'Unexpected error fetching data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidData();
  }, [timeRange, dateRange?.from, dateRange?.to]);

  return { data, stats, loading, error, refetch: fetchBidData };
};
