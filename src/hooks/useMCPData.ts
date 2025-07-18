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

  const getDateFilter = (): { from: string; to: string } => {
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
        from = dateRange?.from ?? now;
        to = dateRange?.to ?? now;
        break;
      default:
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Supabase stores dates as text "DD-MM-YYYY"
    const formatDate = (d: Date) =>
      d
        .toLocaleDateString('en-GB') // "DD/MM/YYYY"
        .split('/')
        .join('-'); // "DD-MM-YYYY"

    return { from: formatDate(from), to: formatDate(to) };
  };

  const fetchMCPData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getDateFilter();

      // Query supabase with date range filter
      const { data: damData, error: fetchError } = await supabase
        .from('dam_snapshot')
        .select('*')
        .gte('Date', from)
        .lte('Date', to)
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

      // Process into time-series points for the first available date
      const availableDates = Array.from(
        new Set(damData.map((row) => row.Date).filter(Boolean))
      );
      const targetDate = availableDates[0];
      const rows = damData.filter((r) => r.Date === targetDate);

      const points: MCPDataPoint[] = rows.map((row) => {
        // extract start time from "HH:MM - HH:MM"
        const match = row['Time Block'].match(/^(\d{1,2}):(\d{2})/);
        const time = match
          ? `${match[1].padStart(2, '0')}:${match[2]}`
          : `${String(row.Hour - 1).padStart(2, '0')}:00`;
        return {
          time,
          price: parseFloat(row['MCP (Rs/MWh)'].toFixed(2)),
        };
      });

      // Dedupe and sort
      const unique = Array.from(
        new Map(points.map((p) => [p.time, p])).values()
      ).sort((a, b) => a.time.localeCompare(b.time));

      // Compute stats
      if (unique.length) {
        const prices = unique.map((p) => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const minTime = unique.find((p) => p.price === min)!.time;
        const maxTime = unique.find((p) => p.price === max)!.time;
        setStats({ min, max, minTime, maxTime });
      } else {
        setStats(null);
      }

      setData(unique);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Unexpected error fetching data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMCPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, dateRange?.from, dateRange?.to]);

  return { data, stats, loading, error, refetch: fetchMCPData };
};
