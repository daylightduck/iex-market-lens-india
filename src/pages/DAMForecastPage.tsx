
import { useState } from "react";
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import PageNavigation from "@/components/PageNavigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 36-hour data for July 1, 2025 (6 hours from June 30 + 24 hours July 1 + 6 hours July 2)
const july1Data36Hours = [
  // June 30, 2025 - Last 6 hours
  { time: "18:00", fullTime: "30-Jun 18:00", price: 2299.62, day: "prev" },
  { time: "18:15", fullTime: "30-Jun 18:15", price: 2505.18, day: "prev" },
  { time: "18:30", fullTime: "30-Jun 18:30", price: 2640.28, day: "prev" },
  { time: "18:45", fullTime: "30-Jun 18:45", price: 2648.41, day: "prev" },
  { time: "19:00", fullTime: "30-Jun 19:00", price: 2505.87, day: "prev" },
  { time: "19:15", fullTime: "30-Jun 19:15", price: 2870.16, day: "prev" },
  { time: "19:30", fullTime: "30-Jun 19:30", price: 2960.17, day: "prev" },
  { time: "19:45", fullTime: "30-Jun 19:45", price: 3112.58, day: "prev" },
  { time: "20:00", fullTime: "30-Jun 20:00", price: 3359.28, day: "prev" },
  { time: "20:15", fullTime: "30-Jun 20:15", price: 3488.29, day: "prev" },
  { time: "20:30", fullTime: "30-Jun 20:30", price: 3569.35, day: "prev" },
  { time: "20:45", fullTime: "30-Jun 20:45", price: 3569.71, day: "prev" },
  { time: "21:00", fullTime: "30-Jun 21:00", price: 3569.77, day: "prev" },
  { time: "21:15", fullTime: "30-Jun 21:15", price: 3677.16, day: "prev" },
  { time: "21:30", fullTime: "30-Jun 21:30", price: 3628.74, day: "prev" },
  { time: "21:45", fullTime: "30-Jun 21:45", price: 3569.5, day: "prev" },
  { time: "22:00", fullTime: "30-Jun 22:00", price: 3820.27, day: "prev" },
  { time: "22:15", fullTime: "30-Jun 22:15", price: 4000.75, day: "prev" },
  { time: "22:30", fullTime: "30-Jun 22:30", price: 4468.34, day: "prev" },
  { time: "22:45", fullTime: "30-Jun 22:45", price: 4999.27, day: "prev" },
  { time: "23:00", fullTime: "30-Jun 23:00", price: 5250.23, day: "prev" },
  { time: "23:15", fullTime: "30-Jun 23:15", price: 5499.33, day: "prev" },
  { time: "23:30", fullTime: "30-Jun 23:30", price: 4639.83, day: "prev" },
  { time: "23:45", fullTime: "30-Jun 23:45", price: 4999.12, day: "prev" },
  
  // July 1, 2025 - Full 24 hours
  { time: "00:00", fullTime: "01-Jul 00:00", price: 2999.75, day: "current" },
  { time: "00:15", fullTime: "01-Jul 00:15", price: 2999.46, day: "current" },
  { time: "00:30", fullTime: "01-Jul 00:30", price: 2999.26, day: "current" },
  { time: "00:45", fullTime: "01-Jul 00:45", price: 2999.08, day: "current" },
  { time: "01:00", fullTime: "01-Jul 01:00", price: 2920.38, day: "current" },
  { time: "01:15", fullTime: "01-Jul 01:15", price: 2870.75, day: "current" },
  { time: "01:30", fullTime: "01-Jul 01:30", price: 2870.88, day: "current" },
  { time: "01:45", fullTime: "01-Jul 01:45", price: 2919.22, day: "current" },
  { time: "02:00", fullTime: "01-Jul 02:00", price: 2870.67, day: "current" },
  { time: "02:15", fullTime: "01-Jul 02:15", price: 2870.87, day: "current" },
  { time: "02:30", fullTime: "01-Jul 02:30", price: 2870.87, day: "current" },
  { time: "02:45", fullTime: "01-Jul 02:45", price: 2870.88, day: "current" },
  { time: "03:00", fullTime: "01-Jul 03:00", price: 2870.68, day: "current" },
  { time: "03:15", fullTime: "01-Jul 03:15", price: 2870.31, day: "current" },
  { time: "03:30", fullTime: "01-Jul 03:30", price: 2784.2, day: "current" },
  { time: "03:45", fullTime: "01-Jul 03:45", price: 2829.09, day: "current" },
  { time: "04:00", fullTime: "01-Jul 04:00", price: 2590.88, day: "current" },
  { time: "04:15", fullTime: "01-Jul 04:15", price: 2739.17, day: "current" },
  { time: "04:30", fullTime: "01-Jul 04:30", price: 2739.13, day: "current" },
  { time: "04:45", fullTime: "01-Jul 04:45", price: 2640.55, day: "current" },
  { time: "05:00", fullTime: "01-Jul 05:00", price: 2829.4, day: "current" },
  { time: "05:15", fullTime: "01-Jul 05:15", price: 2870, day: "current" },
  { time: "05:30", fullTime: "01-Jul 05:30", price: 2870.47, day: "current" },
  { time: "05:45", fullTime: "01-Jul 05:45", price: 2900.46, day: "current" },
  { time: "06:00", fullTime: "01-Jul 06:00", price: 2960.72, day: "current" },
  { time: "06:15", fullTime: "01-Jul 06:15", price: 2960.82, day: "current" },
  { time: "06:30", fullTime: "01-Jul 06:30", price: 2960.64, day: "current" },
  { time: "06:45", fullTime: "01-Jul 06:45", price: 2889.84, day: "current" },
  { time: "07:00", fullTime: "01-Jul 07:00", price: 2701.93, day: "current" },
  { time: "07:15", fullTime: "01-Jul 07:15", price: 2532.36, day: "current" },
  { time: "07:30", fullTime: "01-Jul 07:30", price: 2400.83, day: "current" },
  { time: "07:45", fullTime: "01-Jul 07:45", price: 2172.36, day: "current" },
  { time: "08:00", fullTime: "01-Jul 08:00", price: 2059.94, day: "current" },
  { time: "08:15", fullTime: "01-Jul 08:15", price: 2139.23, day: "current" },
  { time: "08:30", fullTime: "01-Jul 08:30", price: 2142.64, day: "current" },
  { time: "08:45", fullTime: "01-Jul 08:45", price: 2124.02, day: "current" },
  { time: "09:00", fullTime: "01-Jul 09:00", price: 1667.75, day: "current" },
  { time: "09:15", fullTime: "01-Jul 09:15", price: 1667.42, day: "current" },
  { time: "09:30", fullTime: "01-Jul 09:30", price: 1667.46, day: "current" },
  { time: "09:45", fullTime: "01-Jul 09:45", price: 1500.87, day: "current" },
  { time: "10:00", fullTime: "01-Jul 10:00", price: 1667.02, day: "current" },
  { time: "10:15", fullTime: "01-Jul 10:15", price: 1667.32, day: "current" },
  { time: "10:30", fullTime: "01-Jul 10:30", price: 1667.93, day: "current" },
  { time: "10:45", fullTime: "01-Jul 10:45", price: 1699.62, day: "current" },
  { time: "11:00", fullTime: "01-Jul 11:00", price: 1667.69, day: "current" },
  { time: "11:15", fullTime: "01-Jul 11:15", price: 1667.63, day: "current" },
  { time: "11:30", fullTime: "01-Jul 11:30", price: 1667.22, day: "current" },
  { time: "11:45", fullTime: "01-Jul 11:45", price: 1667.27, day: "current" },
  { time: "12:00", fullTime: "01-Jul 12:00", price: 1667.1, day: "current" },
  { time: "12:15", fullTime: "01-Jul 12:15", price: 1667.21, day: "current" },
  { time: "12:30", fullTime: "01-Jul 12:30", price: 1667.27, day: "current" },
  { time: "12:45", fullTime: "01-Jul 12:45", price: 1667.27, day: "current" },
  { time: "13:00", fullTime: "01-Jul 13:00", price: 1500.82, day: "current" },
  { time: "13:15", fullTime: "01-Jul 13:15", price: 1449.26, day: "current" },
  { time: "13:30", fullTime: "01-Jul 13:30", price: 1486.2, day: "current" },
  { time: "13:45", fullTime: "01-Jul 13:45", price: 1500.33, day: "current" },
  { time: "14:00", fullTime: "01-Jul 14:00", price: 1726.2, day: "current" },
  { time: "14:15", fullTime: "01-Jul 14:15", price: 1758.56, day: "current" },
  { time: "14:30", fullTime: "01-Jul 14:30", price: 1861.59, day: "current" },
  { time: "14:45", fullTime: "01-Jul 14:45", price: 1895.2, day: "current" },
  { time: "15:00", fullTime: "01-Jul 15:00", price: 1989.78, day: "current" },
  { time: "15:15", fullTime: "01-Jul 15:15", price: 2100.08, day: "current" },
  { time: "15:30", fullTime: "01-Jul 15:30", price: 2499.88, day: "current" },
  { time: "15:45", fullTime: "01-Jul 15:45", price: 2499.19, day: "current" },
  { time: "16:00", fullTime: "01-Jul 16:00", price: 2100.71, day: "current" },
  { time: "16:15", fullTime: "01-Jul 16:15", price: 2185.93, day: "current" },
  { time: "16:30", fullTime: "01-Jul 16:30", price: 2100.87, day: "current" },
  { time: "16:45", fullTime: "01-Jul 16:45", price: 2100.84, day: "current" },
  { time: "17:00", fullTime: "01-Jul 17:00", price: 2505.98, day: "current" },
  { time: "17:15", fullTime: "01-Jul 17:15", price: 2532.87, day: "current" },
  { time: "17:30", fullTime: "01-Jul 17:30", price: 2648.93, day: "current" },
  { time: "17:45", fullTime: "01-Jul 17:45", price: 2701.97, day: "current" },
  { time: "18:00", fullTime: "01-Jul 18:00", price: 2801.3, day: "current" },
  { time: "18:15", fullTime: "01-Jul 18:15", price: 2870.07, day: "current" },
  { time: "18:30", fullTime: "01-Jul 18:30", price: 2900.17, day: "current" },
  { time: "18:45", fullTime: "01-Jul 18:45", price: 2999.93, day: "current" },
  { time: "19:00", fullTime: "01-Jul 19:00", price: 3396.8, day: "current" },
  { time: "19:15", fullTime: "01-Jul 19:15", price: 3503.86, day: "current" },
  { time: "19:30", fullTime: "01-Jul 19:30", price: 3913.08, day: "current" },
  { time: "19:45", fullTime: "01-Jul 19:45", price: 4689.13, day: "current" },
  { time: "20:00", fullTime: "01-Jul 20:00", price: 4689.03, day: "current" },
  { time: "20:15", fullTime: "01-Jul 20:15", price: 4639.12, day: "current" },
  { time: "20:30", fullTime: "01-Jul 20:30", price: 4219.14, day: "current" },
  { time: "20:45", fullTime: "01-Jul 20:45", price: 4069.95, day: "current" },
  { time: "21:00", fullTime: "01-Jul 21:00", price: 4119.02, day: "current" },
  { time: "21:15", fullTime: "01-Jul 21:15", price: 4140, day: "current" },
  { time: "21:30", fullTime: "01-Jul 21:30", price: 4119.44, day: "current" },
  { time: "21:45", fullTime: "01-Jul 21:45", price: 4219.15, day: "current" },
  { time: "22:00", fullTime: "01-Jul 22:00", price: 4589.21, day: "current" },
  { time: "22:15", fullTime: "01-Jul 22:15", price: 4600.74, day: "current" },
  { time: "22:30", fullTime: "01-Jul 22:30", price: 4510.6, day: "current" },
  { time: "22:45", fullTime: "01-Jul 22:45", price: 4589.94, day: "current" },
  { time: "23:00", fullTime: "01-Jul 23:00", price: 4419.6, day: "current" },
  { time: "23:15", fullTime: "01-Jul 23:15", price: 4219.04, day: "current" },
  { time: "23:30", fullTime: "01-Jul 23:30", price: 4069.66, day: "current" },
  { time: "23:45", fullTime: "01-Jul 23:45", price: 3943.03, day: "current" },
  
  // July 2, 2025 - First 6 hours
  { time: "00:00", fullTime: "02-Jul 00:00", price: 3060.32, day: "next" },
  { time: "00:15", fullTime: "02-Jul 00:15", price: 3060.66, day: "next" },
  { time: "00:30", fullTime: "02-Jul 00:30", price: 2999.69, day: "next" },
  { time: "00:45", fullTime: "02-Jul 00:45", price: 2950.01, day: "next" },
  { time: "01:00", fullTime: "02-Jul 01:00", price: 2950.15, day: "next" },
  { time: "01:15", fullTime: "02-Jul 01:15", price: 2919.76, day: "next" },
  { time: "01:30", fullTime: "02-Jul 01:30", price: 2940.01, day: "next" },
  { time: "01:45", fullTime: "02-Jul 01:45", price: 2830.91, day: "next" },
  { time: "02:00", fullTime: "02-Jul 02:00", price: 2940.45, day: "next" },
  { time: "02:15", fullTime: "02-Jul 02:15", price: 2920.88, day: "next" },
  { time: "02:30", fullTime: "02-Jul 02:30", price: 2830.15, day: "next" },
  { time: "02:45", fullTime: "02-Jul 02:45", price: 2920.26, day: "next" },
  { time: "03:00", fullTime: "02-Jul 03:00", price: 2829.89, day: "next" },
  { time: "03:15", fullTime: "02-Jul 03:15", price: 2829.95, day: "next" },
  { time: "03:30", fullTime: "02-Jul 03:30", price: 2830.02, day: "next" },
  { time: "03:45", fullTime: "02-Jul 03:45", price: 2729.82, day: "next" },
  { time: "04:00", fullTime: "02-Jul 04:00", price: 2729.63, day: "next" },
  { time: "04:15", fullTime: "02-Jul 04:15", price: 2729.53, day: "next" },
  { time: "04:30", fullTime: "02-Jul 04:30", price: 2729.63, day: "next" },
  { time: "04:45", fullTime: "02-Jul 04:45", price: 2729.98, day: "next" },
  { time: "05:00", fullTime: "02-Jul 05:00", price: 2729.9, day: "next" },
  { time: "05:15", fullTime: "02-Jul 05:15", price: 2849.86, day: "next" },
  { time: "05:30", fullTime: "02-Jul 05:30", price: 2960.22, day: "next" },
  { time: "05:45", fullTime: "02-Jul 05:45", price: 2950.88, day: "next" }
];

// 36-hour data for July 2, 2025 (6 hours from July 1 + 24 hours July 2 + 6 hours July 3)
const july2Data36Hours = [
  // July 1, 2025 - Last 6 hours
  { time: "18:00", fullTime: "01-Jul 18:00", price: 2801.3, day: "prev" },
  { time: "18:15", fullTime: "01-Jul 18:15", price: 2870.07, day: "prev" },
  { time: "18:30", fullTime: "01-Jul 18:30", price: 2900.17, day: "prev" },
  { time: "18:45", fullTime: "01-Jul 18:45", price: 2999.93, day: "prev" },
  { time: "19:00", fullTime: "01-Jul 19:00", price: 3396.8, day: "prev" },
  { time: "19:15", fullTime: "01-Jul 19:15", price: 3503.86, day: "prev" },
  { time: "19:30", fullTime: "01-Jul 19:30", price: 3913.08, day: "prev" },
  { time: "19:45", fullTime: "01-Jul 19:45", price: 4689.13, day: "prev" },
  { time: "20:00", fullTime: "01-Jul 20:00", price: 4689.03, day: "prev" },
  { time: "20:15", fullTime: "01-Jul 20:15", price: 4639.12, day: "prev" },
  { time: "20:30", fullTime: "01-Jul 20:30", price: 4219.14, day: "prev" },
  { time: "20:45", fullTime: "01-Jul 20:45", price: 4069.95, day: "prev" },
  { time: "21:00", fullTime: "01-Jul 21:00", price: 4119.02, day: "prev" },
  { time: "21:15", fullTime: "01-Jul 21:15", price: 4140, day: "prev" },
  { time: "21:30", fullTime: "01-Jul 21:30", price: 4119.44, day: "prev" },
  { time: "21:45", fullTime: "01-Jul 21:45", price: 4219.15, day: "prev" },
  { time: "22:00", fullTime: "01-Jul 22:00", price: 4589.21, day: "prev" },
  { time: "22:15", fullTime: "01-Jul 22:15", price: 4600.74, day: "prev" },
  { time: "22:30", fullTime: "01-Jul 22:30", price: 4510.6, day: "prev" },
  { time: "22:45", fullTime: "01-Jul 22:45", price: 4589.94, day: "prev" },
  { time: "23:00", fullTime: "01-Jul 23:00", price: 4419.6, day: "prev" },
  { time: "23:15", fullTime: "01-Jul 23:15", price: 4219.04, day: "prev" },
  { time: "23:30", fullTime: "01-Jul 23:30", price: 4069.66, day: "prev" },
  { time: "23:45", fullTime: "01-Jul 23:45", price: 3943.03, day: "prev" },
  
  // July 2, 2025 - Full 24 hours
  { time: "00:00", fullTime: "02-Jul 00:00", price: 3060.32, day: "current" },
  { time: "00:15", fullTime: "02-Jul 00:15", price: 3060.66, day: "current" },
  { time: "00:30", fullTime: "02-Jul 00:30", price: 2999.69, day: "current" },
  { time: "00:45", fullTime: "02-Jul 00:45", price: 2950.01, day: "current" },
  { time: "01:00", fullTime: "02-Jul 01:00", price: 2950.15, day: "current" },
  { time: "01:15", fullTime: "02-Jul 01:15", price: 2919.76, day: "current" },
  { time: "01:30", fullTime: "02-Jul 01:30", price: 2940.01, day: "current" },
  { time: "01:45", fullTime: "02-Jul 01:45", price: 2830.91, day: "current" },
  { time: "02:00", fullTime: "02-Jul 02:00", price: 2940.45, day: "current" },
  { time: "02:15", fullTime: "02-Jul 02:15", price: 2920.88, day: "current" },
  { time: "02:30", fullTime: "02-Jul 02:30", price: 2830.15, day: "current" },
  { time: "02:45", fullTime: "02-Jul 02:45", price: 2920.26, day: "current" },
  { time: "03:00", fullTime: "02-Jul 03:00", price: 2829.89, day: "current" },
  { time: "03:15", fullTime: "02-Jul 03:15", price: 2829.95, day: "current" },
  { time: "03:30", fullTime: "02-Jul 03:30", price: 2830.02, day: "current" },
  { time: "03:45", fullTime: "02-Jul 03:45", price: 2729.82, day: "current" },
  { time: "04:00", fullTime: "02-Jul 04:00", price: 2729.63, day: "current" },
  { time: "04:15", fullTime: "02-Jul 04:15", price: 2729.53, day: "current" },
  { time: "04:30", fullTime: "02-Jul 04:30", price: 2729.63, day: "current" },
  { time: "04:45", fullTime: "02-Jul 04:45", price: 2729.98, day: "current" },
  { time: "05:00", fullTime: "02-Jul 05:00", price: 2729.9, day: "current" },
  { time: "05:15", fullTime: "02-Jul 05:15", price: 2849.86, day: "current" },
  { time: "05:30", fullTime: "02-Jul 05:30", price: 2960.22, day: "current" },
  { time: "05:45", fullTime: "02-Jul 05:45", price: 2950.88, day: "current" },
  { time: "06:00", fullTime: "02-Jul 06:00", price: 3184.58, day: "current" },
  { time: "06:15", fullTime: "02-Jul 06:15", price: 3319.15, day: "current" },
  { time: "06:30", fullTime: "02-Jul 06:30", price: 3176.98, day: "current" },
  { time: "06:45", fullTime: "02-Jul 06:45", price: 2960.47, day: "current" },
  { time: "07:00", fullTime: "02-Jul 07:00", price: 2849.09, day: "current" },
  { time: "07:15", fullTime: "02-Jul 07:15", price: 2610.66, day: "current" },
  { time: "07:30", fullTime: "02-Jul 07:30", price: 2435.95, day: "current" },
  { time: "07:45", fullTime: "02-Jul 07:45", price: 2435.7, day: "current" },
  { time: "08:00", fullTime: "02-Jul 08:00", price: 2435.01, day: "current" },
  { time: "08:15", fullTime: "02-Jul 08:15", price: 2262.18, day: "current" },
  { time: "08:30", fullTime: "02-Jul 08:30", price: 2197.28, day: "current" },
  { time: "08:45", fullTime: "02-Jul 08:45", price: 2155.06, day: "current" },
  { time: "09:00", fullTime: "02-Jul 09:00", price: 2112.24, day: "current" },
  { time: "09:15", fullTime: "02-Jul 09:15", price: 1807.35, day: "current" },
  { time: "09:30", fullTime: "02-Jul 09:30", price: 1736.21, day: "current" },
  { time: "09:45", fullTime: "02-Jul 09:45", price: 1729.5, day: "current" },
  { time: "10:00", fullTime: "02-Jul 10:00", price: 1667.58, day: "current" },
  { time: "10:15", fullTime: "02-Jul 10:15", price: 1667.48, day: "current" },
  { time: "10:30", fullTime: "02-Jul 10:30", price: 1729.54, day: "current" },
  { time: "10:45", fullTime: "02-Jul 10:45", price: 1729.4, day: "current" },
  { time: "11:00", fullTime: "02-Jul 11:00", price: 1729.36, day: "current" },
  { time: "11:15", fullTime: "02-Jul 11:15", price: 1729.73, day: "current" },
  { time: "11:30", fullTime: "02-Jul 11:30", price: 1729.65, day: "current" },
  { time: "11:45", fullTime: "02-Jul 11:45", price: 1729.54, day: "current" },
  { time: "12:00", fullTime: "02-Jul 12:00", price: 1729.37, day: "current" },
  { time: "12:15", fullTime: "02-Jul 12:15", price: 1729.42, day: "current" },
  { time: "12:30", fullTime: "02-Jul 12:30", price: 1729.44, day: "current" },
  { time: "12:45", fullTime: "02-Jul 12:45", price: 1729.29, day: "current" },
  { time: "13:00", fullTime: "02-Jul 13:00", price: 1667.89, day: "current" },
  { time: "13:15", fullTime: "02-Jul 13:15", price: 1712.05, day: "current" },
  { time: "13:30", fullTime: "02-Jul 13:30", price: 1729.19, day: "current" },
  { time: "13:45", fullTime: "02-Jul 13:45", price: 1729.57, day: "current" },
  { time: "14:00", fullTime: "02-Jul 14:00", price: 1750.12, day: "current" },
  { time: "14:15", fullTime: "02-Jul 14:15", price: 1750.62, day: "current" },
  { time: "14:30", fullTime: "02-Jul 14:30", price: 1750.66, day: "current" },
  { time: "14:45", fullTime: "02-Jul 14:45", price: 1800.6, day: "current" },
  { time: "15:00", fullTime: "02-Jul 15:00", price: 2012.18, day: "current" },
  { time: "15:15", fullTime: "02-Jul 15:15", price: 2140.04, day: "current" },
  { time: "15:30", fullTime: "02-Jul 15:30", price: 2459.05, day: "current" },
  { time: "15:45", fullTime: "02-Jul 15:45", price: 2459.11, day: "current" },
  { time: "16:00", fullTime: "02-Jul 16:00", price: 2505.4, day: "current" },
  { time: "16:15", fullTime: "02-Jul 16:15", price: 2532.49, day: "current" },
  { time: "16:30", fullTime: "02-Jul 16:30", price: 2532.34, day: "current" },
  { time: "16:45", fullTime: "02-Jul 16:45", price: 2523.98, day: "current" },
  { time: "17:00", fullTime: "02-Jul 17:00", price: 2532.22, day: "current" },
  { time: "17:15", fullTime: "02-Jul 17:15", price: 2532.97, day: "current" },
  { time: "17:30", fullTime: "02-Jul 17:30", price: 2700.83, day: "current" },
  { time: "17:45", fullTime: "02-Jul 17:45", price: 2701.84, day: "current" },
  { time: "18:00", fullTime: "02-Jul 18:00", price: 2868.06, day: "current" },
  { time: "18:15", fullTime: "02-Jul 18:15", price: 2950.59, day: "current" },
  { time: "18:30", fullTime: "02-Jul 18:30", price: 2999.93, day: "current" },
  { time: "18:45", fullTime: "02-Jul 18:45", price: 3349.8, day: "current" },
  { time: "19:00", fullTime: "02-Jul 19:00", price: 3655.96, day: "current" },
  { time: "19:15", fullTime: "02-Jul 19:15", price: 4689.26, day: "current" },
  { time: "19:30", fullTime: "02-Jul 19:30", price: 5200.19, day: "current" },
  { time: "19:45", fullTime: "02-Jul 19:45", price: 5200.78, day: "current" },
  { time: "20:00", fullTime: "02-Jul 20:00", price: 5000.85, day: "current" },
  { time: "20:15", fullTime: "02-Jul 20:15", price: 5051.92, day: "current" },
  { time: "20:30", fullTime: "02-Jul 20:30", price: 5200.17, day: "current" },
  { time: "20:45", fullTime: "02-Jul 20:45", price: 4999.38, day: "current" },
  { time: "21:00", fullTime: "02-Jul 21:00", price: 4689.85, day: "current" },
  { time: "21:15", fullTime: "02-Jul 21:15", price: 4811.34, day: "current" },
  { time: "21:30", fullTime: "02-Jul 21:30", price: 4999.72, day: "current" },
  { time: "21:45", fullTime: "02-Jul 21:45", price: 4999.72, day: "current" },
  { time: "22:00", fullTime: "02-Jul 22:00", price: 4774.26, day: "current" },
  { time: "22:15", fullTime: "02-Jul 22:15", price: 4999.43, day: "current" },
  { time: "22:30", fullTime: "02-Jul 22:30", price: 4811.68, day: "current" },
  { time: "22:45", fullTime: "02-Jul 22:45", price: 5010.56, day: "current" },
  { time: "23:00", fullTime: "02-Jul 23:00", price: 4672.16, day: "current" },
  { time: "23:15", fullTime: "02-Jul 23:15", price: 4219.59, day: "current" },
  { time: "23:30", fullTime: "02-Jul 23:30", price: 4119.24, day: "current" },
  { time: "23:45", fullTime: "02-Jul 23:45", price: 4013.26, day: "current" },
  
  // July 3, 2025 - First 6 hours
  { time: "00:00", fullTime: "03-Jul 00:00", price: 4061.03, day: "next" },
  { time: "00:15", fullTime: "03-Jul 00:15", price: 4042.12, day: "next" },
  { time: "00:30", fullTime: "03-Jul 00:30", price: 3999.88, day: "next" },
  { time: "00:45", fullTime: "03-Jul 00:45", price: 3809.24, day: "next" },
  { time: "01:00", fullTime: "03-Jul 01:00", price: 3809.2, day: "next" },
  { time: "01:15", fullTime: "03-Jul 01:15", price: 3780.58, day: "next" },
  { time: "01:30", fullTime: "03-Jul 01:30", price: 3499.95, day: "next" },
  { time: "01:45", fullTime: "03-Jul 01:45", price: 3499.14, day: "next" },
  { time: "02:00", fullTime: "03-Jul 02:00", price: 3489.75, day: "next" },
  { time: "02:15", fullTime: "03-Jul 02:15", price: 3349.94, day: "next" },
  { time: "02:30", fullTime: "03-Jul 02:30", price: 3349.6, day: "next" },
  { time: "02:45", fullTime: "03-Jul 02:45", price: 3349.55, day: "next" },
  { time: "03:00", fullTime: "03-Jul 03:00", price: 3349.55, day: "next" },
  { time: "03:15", fullTime: "03-Jul 03:15", price: 3280.76, day: "next" },
  { time: "03:30", fullTime: "03-Jul 03:30", price: 3250.82, day: "next" },
  { time: "03:45", fullTime: "03-Jul 03:45", price: 3250.67, day: "next" },
  { time: "04:00", fullTime: "03-Jul 04:00", price: 3290.82, day: "next" },
  { time: "04:15", fullTime: "03-Jul 04:15", price: 3349.57, day: "next" },
  { time: "04:30", fullTime: "03-Jul 04:30", price: 3396.19, day: "next" },
  { time: "04:45", fullTime: "03-Jul 04:45", price: 3396.38, day: "next" },
  { time: "05:00", fullTime: "03-Jul 05:00", price: 3378.07, day: "next" },
  { time: "05:15", fullTime: "03-Jul 05:15", price: 3404.43, day: "next" },
  { time: "05:30", fullTime: "03-Jul 05:30", price: 3569.32, day: "next" },
  { time: "05:45", fullTime: "03-Jul 05:45", price: 3569.16, day: "next" }
];

// July 3, 4, 5 datasets following the same pattern...
const july3Data36Hours = [
  // July 2, 2025 - Last 6 hours (18:00-24:00)
  { time: "18:00", fullTime: "02-Jul 18:00", price: 2868.06, day: "prev" },
  { time: "18:15", fullTime: "02-Jul 18:15", price: 2950.59, day: "prev" },
  { time: "18:30", fullTime: "02-Jul 18:30", price: 2999.93, day: "prev" },
  { time: "18:45", fullTime: "02-Jul 18:45", price: 3349.8, day: "prev" },
  { time: "19:00", fullTime: "02-Jul 19:00", price: 3655.96, day: "prev" },
  { time: "19:15", fullTime: "02-Jul 19:15", price: 4689.26, day: "prev" },
  { time: "19:30", fullTime: "02-Jul 19:30", price: 5200.19, day: "prev" },
  { time: "19:45", fullTime: "02-Jul 19:45", price: 5200.78, day: "prev" },
  { time: "20:00", fullTime: "02-Jul 20:00", price: 5000.85, day: "prev" },
  { time: "20:15", fullTime: "02-Jul 20:15", price: 5051.92, day: "prev" },
  { time: "20:30", fullTime: "02-Jul 20:30", price: 5200.17, day: "prev" },
  { time: "20:45", fullTime: "02-Jul 20:45", price: 4999.38, day: "prev" },
  { time: "21:00", fullTime: "02-Jul 21:00", price: 4689.85, day: "prev" },
  { time: "21:15", fullTime: "02-Jul 21:15", price: 4811.34, day: "prev" },
  { time: "21:30", fullTime: "02-Jul 21:30", price: 4999.72, day: "prev" },
  { time: "21:45", fullTime: "02-Jul 21:45", price: 4999.72, day: "prev" },
  { time: "22:00", fullTime: "02-Jul 22:00", price: 4774.26, day: "prev" },
  { time: "22:15", fullTime: "02-Jul 22:15", price: 4999.43, day: "prev" },
  { time: "22:30", fullTime: "02-Jul 22:30", price: 4811.68, day: "prev" },
  { time: "22:45", fullTime: "02-Jul 22:45", price: 5010.56, day: "prev" },
  { time: "23:00", fullTime: "02-Jul 23:00", price: 4672.16, day: "prev" },
  { time: "23:15", fullTime: "02-Jul 23:15", price: 4219.59, day: "prev" },
  { time: "23:30", fullTime: "02-Jul 23:30", price: 4119.24, day: "prev" },
  { time: "23:45", fullTime: "02-Jul 23:45", price: 4013.26, day: "prev" },
  
  // July 3, 2025 - Full 24 hours
  { time: "00:00", fullTime: "03-Jul 00:00", price: 4061.03, day: "current" },
  { time: "00:15", fullTime: "03-Jul 00:15", price: 4042.12, day: "current" },
  { time: "00:30", fullTime: "03-Jul 00:30", price: 3999.88, day: "current" },
  { time: "00:45", fullTime: "03-Jul 00:45", price: 3809.24, day: "current" },
  { time: "01:00", fullTime: "03-Jul 01:00", price: 3809.2, day: "current" },
  { time: "01:15", fullTime: "03-Jul 01:15", price: 3780.58, day: "current" },
  { time: "01:30", fullTime: "03-Jul 01:30", price: 3499.95, day: "current" },
  { time: "01:45", fullTime: "03-Jul 01:45", price: 3499.14, day: "current" },
  { time: "02:00", fullTime: "03-Jul 02:00", price: 3489.75, day: "current" },
  { time: "02:15", fullTime: "03-Jul 02:15", price: 3349.94, day: "current" },
  { time: "02:30", fullTime: "03-Jul 02:30", price: 3349.6, day: "current" },
  { time: "02:45", fullTime: "03-Jul 02:45", price: 3349.55, day: "current" },
  { time: "03:00", fullTime: "03-Jul 03:00", price: 3349.55, day: "current" },
  { time: "03:15", fullTime: "03-Jul 03:15", price: 3280.76, day: "current" },
  { time: "03:30", fullTime: "03-Jul 03:30", price: 3250.82, day: "current" },
  { time: "03:45", fullTime: "03-Jul 03:45", price: 3250.67, day: "current" },
  { time: "04:00", fullTime: "03-Jul 04:00", price: 3290.82, day: "current" },
  { time: "04:15", fullTime: "03-Jul 04:15", price: 3349.57, day: "current" },
  { time: "04:30", fullTime: "03-Jul 04:30", price: 3396.19, day: "current" },
  { time: "04:45", fullTime: "03-Jul 04:45", price: 3396.38, day: "current" },
  { time: "05:00", fullTime: "03-Jul 05:00", price: 3378.07, day: "current" },
  { time: "05:15", fullTime: "03-Jul 05:15", price: 3404.43, day: "current" },
  { time: "05:30", fullTime: "03-Jul 05:30", price: 3569.32, day: "current" },
  { time: "05:45", fullTime: "03-Jul 05:45", price: 3569.16, day: "current" },
  { time: "06:00", fullTime: "03-Jul 06:00", price: 3700.32, day: "current" },
  { time: "06:15", fullTime: "03-Jul 06:15", price: 3700.86, day: "current" },
  { time: "06:30", fullTime: "03-Jul 06:30", price: 3700.08, day: "current" },
  { time: "06:45", fullTime: "03-Jul 06:45", price: 3488.21, day: "current" },
  { time: "07:00", fullTime: "03-Jul 07:00", price: 3300.54, day: "current" },
  { time: "07:15", fullTime: "03-Jul 07:15", price: 3000.63, day: "current" },
  { time: "07:30", fullTime: "03-Jul 07:30", price: 2950.83, day: "current" },
  { time: "07:45", fullTime: "03-Jul 07:45", price: 2830.54, day: "current" },
  { time: "08:00", fullTime: "03-Jul 08:00", price: 2499.3, day: "current" },
  { time: "08:15", fullTime: "03-Jul 08:15", price: 2499.63, day: "current" },
  { time: "08:30", fullTime: "03-Jul 08:30", price: 2610.68, day: "current" },
  { time: "08:45", fullTime: "03-Jul 08:45", price: 2601.45, day: "current" },
  { time: "09:00", fullTime: "03-Jul 09:00", price: 2435.06, day: "current" },
  { time: "09:15", fullTime: "03-Jul 09:15", price: 2304.39, day: "current" },
  { time: "09:30", fullTime: "03-Jul 09:30", price: 2100.55, day: "current" },
  { time: "09:45", fullTime: "03-Jul 09:45", price: 1864.52, day: "current" },
  { time: "10:00", fullTime: "03-Jul 10:00", price: 1750.76, day: "current" },
  { time: "10:15", fullTime: "03-Jul 10:15", price: 1750.72, day: "current" },
  { time: "10:30", fullTime: "03-Jul 10:30", price: 1807.18, day: "current" },
  { time: "10:45", fullTime: "03-Jul 10:45", price: 1837.5, day: "current" },
  { time: "11:00", fullTime: "03-Jul 11:00", price: 2080, day: "current" },
  { time: "11:15", fullTime: "03-Jul 11:15", price: 2012.57, day: "current" },
  { time: "11:30", fullTime: "03-Jul 11:30", price: 2080.19, day: "current" },
  { time: "11:45", fullTime: "03-Jul 11:45", price: 2080.4, day: "current" },
  { time: "12:00", fullTime: "03-Jul 12:00", price: 1807.94, day: "current" },
  { time: "12:15", fullTime: "03-Jul 12:15", price: 1865.16, day: "current" },
  { time: "12:30", fullTime: "03-Jul 12:30", price: 1853.97, day: "current" },
  { time: "12:45", fullTime: "03-Jul 12:45", price: 1807.89, day: "current" },
  { time: "13:00", fullTime: "03-Jul 13:00", price: 1736.46, day: "current" },
  { time: "13:15", fullTime: "03-Jul 13:15", price: 1736.64, day: "current" },
  { time: "13:30", fullTime: "03-Jul 13:30", price: 1736.04, day: "current" },
  { time: "13:45", fullTime: "03-Jul 13:45", price: 1750.03, day: "current" },
  { time: "14:00", fullTime: "03-Jul 14:00", price: 1750.51, day: "current" },
  { time: "14:15", fullTime: "03-Jul 14:15", price: 1750.73, day: "current" },
  { time: "14:30", fullTime: "03-Jul 14:30", price: 2000.01, day: "current" },
  { time: "14:45", fullTime: "03-Jul 14:45", price: 2000.82, day: "current" },
  { time: "15:00", fullTime: "03-Jul 15:00", price: 2304.27, day: "current" },
  { time: "15:15", fullTime: "03-Jul 15:15", price: 2273.37, day: "current" },
  { time: "15:30", fullTime: "03-Jul 15:30", price: 2499.13, day: "current" },
  { time: "15:45", fullTime: "03-Jul 15:45", price: 2316.52, day: "current" },
  { time: "16:00", fullTime: "03-Jul 16:00", price: 2099.84, day: "current" },
  { time: "16:15", fullTime: "03-Jul 16:15", price: 2099.92, day: "current" },
  { time: "16:30", fullTime: "03-Jul 16:30", price: 2499.53, day: "current" },
  { time: "16:45", fullTime: "03-Jul 16:45", price: 2610.16, day: "current" },
  { time: "17:00", fullTime: "03-Jul 17:00", price: 2900.45, day: "current" },
  { time: "17:15", fullTime: "03-Jul 17:15", price: 2950.35, day: "current" },
  { time: "17:30", fullTime: "03-Jul 17:30", price: 2950.29, day: "current" },
  { time: "17:45", fullTime: "03-Jul 17:45", price: 2960.59, day: "current" },
  { time: "18:00", fullTime: "03-Jul 18:00", price: 3268.51, day: "current" },
  { time: "18:15", fullTime: "03-Jul 18:15", price: 3396.91, day: "current" },
  { time: "18:30", fullTime: "03-Jul 18:30", price: 3700.49, day: "current" },
  { time: "18:45", fullTime: "03-Jul 18:45", price: 4069.17, day: "current" },
  { time: "19:00", fullTime: "03-Jul 19:00", price: 5000.44, day: "current" },
  { time: "19:15", fullTime: "03-Jul 19:15", price: 5700.57, day: "current" },
  { time: "19:30", fullTime: "03-Jul 19:30", price: 6705.92, day: "current" },
  { time: "19:45", fullTime: "03-Jul 19:45", price: 6308.72, day: "current" },
  { time: "20:00", fullTime: "03-Jul 20:00", price: 6400.41, day: "current" },
  { time: "20:15", fullTime: "03-Jul 20:15", price: 6799.24, day: "current" },
  { time: "20:30", fullTime: "03-Jul 20:30", price: 6799.81, day: "current" },
  { time: "20:45", fullTime: "03-Jul 20:45", price: 7929.83, day: "current" },
  { time: "21:00", fullTime: "03-Jul 21:00", price: 6799.84, day: "current" },
  { time: "21:15", fullTime: "03-Jul 21:15", price: 6999.44, day: "current" },
  { time: "21:30", fullTime: "03-Jul 21:30", price: 7999.33, day: "current" },
  { time: "21:45", fullTime: "03-Jul 21:45", price: 7999.15, day: "current" },
  { time: "22:00", fullTime: "03-Jul 22:00", price: 7999.58, day: "current" },
  { time: "22:15", fullTime: "03-Jul 22:15", price: 9721.24, day: "current" },
  { time: "22:30", fullTime: "03-Jul 22:30", price: 9499.91, day: "current" },
  { time: "22:45", fullTime: "03-Jul 22:45", price: 9799.34, day: "current" },
  { time: "23:00", fullTime: "03-Jul 23:00", price: 7499.57, day: "current" },
  { time: "23:15", fullTime: "03-Jul 23:15", price: 6000.92, day: "current" },
  { time: "23:30", fullTime: "03-Jul 23:30", price: 5899.74, day: "current" },
  { time: "23:45", fullTime: "03-Jul 23:45", price: 5647.26, day: "current" },
  
  // July 4, 2025 - First 6 hours
  { time: "00:00", fullTime: "04-Jul 00:00", price: 5000.84, day: "next" },
  { time: "00:15", fullTime: "04-Jul 00:15", price: 4924.65, day: "next" },
  { time: "00:30", fullTime: "04-Jul 00:30", price: 4672.08, day: "next" },
  { time: "00:45", fullTime: "04-Jul 00:45", price: 4451.62, day: "next" },
  { time: "01:00", fullTime: "04-Jul 01:00", price: 4119.99, day: "next" },
  { time: "01:15", fullTime: "04-Jul 01:15", price: 4119.46, day: "next" },
  { time: "01:30", fullTime: "04-Jul 01:30", price: 4672.28, day: "next" },
  { time: "01:45", fullTime: "04-Jul 01:45", price: 4589.45, day: "next" },
  { time: "02:00", fullTime: "04-Jul 02:00", price: 4499.56, day: "next" },
  { time: "02:15", fullTime: "04-Jul 02:15", price: 4395.46, day: "next" },
  { time: "02:30", fullTime: "04-Jul 02:30", price: 4395.41, day: "next" },
  { time: "02:45", fullTime: "04-Jul 02:45", price: 4395.82, day: "next" },
  { time: "03:00", fullTime: "04-Jul 03:00", price: 4000.52, day: "next" },
  { time: "03:15", fullTime: "04-Jul 03:15", price: 3932.32, day: "next" },
  { time: "03:30", fullTime: "04-Jul 03:30", price: 3893.87, day: "next" },
  { time: "03:45", fullTime: "04-Jul 03:45", price: 3893.13, day: "next" },
  { time: "04:00", fullTime: "04-Jul 04:00", price: 4000.08, day: "next" },
  { time: "04:15", fullTime: "04-Jul 04:15", price: 3889.48, day: "next" },
  { time: "04:30", fullTime: "04-Jul 04:30", price: 3932.98, day: "next" },
  { time: "04:45", fullTime: "04-Jul 04:45", price: 3893.64, day: "next" },
  { time: "05:00", fullTime: "04-Jul 05:00", price: 3905.87, day: "next" },
  { time: "05:15", fullTime: "04-Jul 05:15", price: 3999.73, day: "next" },
  { time: "05:30", fullTime: "04-Jul 05:30", price: 4219.73, day: "next" },
  { time: "05:45", fullTime: "04-Jul 05:45", price: 4480.96, day: "next" }
];

// 96-point prediction data for July 15, 2025 (Full 24 hours in 15-minute intervals)
const july15PredictionData = [
  { time: "00:00", fullTime: "15-Jul 00:00", price: 9480.03, lowerBound: 5393.02, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "00:15", fullTime: "15-Jul 00:15", price: 7862.58, lowerBound: 4309.37, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "00:30", fullTime: "15-Jul 00:30", price: 5967.29, lowerBound: 3888.26, upperBound: 7729.38, day: "current", type: "prediction" },
  { time: "00:45", fullTime: "15-Jul 00:45", price: 5617.15, lowerBound: 3807.82, upperBound: 7306.01, day: "current", type: "prediction" },
  { time: "01:00", fullTime: "15-Jul 01:00", price: 5453.08, lowerBound: 3711.74, upperBound: 7608.52, day: "current", type: "prediction" },
  { time: "01:15", fullTime: "15-Jul 01:15", price: 5103.67, lowerBound: 3686.29, upperBound: 5974.78, day: "current", type: "prediction" },
  { time: "01:30", fullTime: "15-Jul 01:30", price: 4631.96, lowerBound: 3588.55, upperBound: 5746.79, day: "current", type: "prediction" },
  { time: "01:45", fullTime: "15-Jul 01:45", price: 4607.95, lowerBound: 3586.60, upperBound: 5548.54, day: "current", type: "prediction" },
  { time: "02:00", fullTime: "15-Jul 02:00", price: 4181.35, lowerBound: 3356.89, upperBound: 5217.73, day: "current", type: "prediction" },
  { time: "02:15", fullTime: "15-Jul 02:15", price: 4129.19, lowerBound: 3346.56, upperBound: 5169.87, day: "current", type: "prediction" },
  { time: "02:30", fullTime: "15-Jul 02:30", price: 4301.30, lowerBound: 3396.51, upperBound: 5112.40, day: "current", type: "prediction" },
  { time: "02:45", fullTime: "15-Jul 02:45", price: 4274.28, lowerBound: 3356.89, upperBound: 5061.89, day: "current", type: "prediction" },
  { time: "03:00", fullTime: "15-Jul 03:00", price: 4235.71, lowerBound: 3298.49, upperBound: 5057.72, day: "current", type: "prediction" },
  { time: "03:15", fullTime: "15-Jul 03:15", price: 4189.78, lowerBound: 3298.49, upperBound: 5057.72, day: "current", type: "prediction" },
  { time: "03:30", fullTime: "15-Jul 03:30", price: 4058.32, lowerBound: 3214.91, upperBound: 4673.31, day: "current", type: "prediction" },
  { time: "03:45", fullTime: "15-Jul 03:45", price: 3883.80, lowerBound: 3198.31, upperBound: 4675.42, day: "current", type: "prediction" },
  { time: "04:00", fullTime: "15-Jul 04:00", price: 3977.11, lowerBound: 3328.83, upperBound: 5123.89, day: "current", type: "prediction" },
  { time: "04:15", fullTime: "15-Jul 04:15", price: 4028.46, lowerBound: 3312.41, upperBound: 5147.19, day: "current", type: "prediction" },
  { time: "04:30", fullTime: "15-Jul 04:30", price: 4028.46, lowerBound: 3315.73, upperBound: 5147.19, day: "current", type: "prediction" },
  { time: "04:45", fullTime: "15-Jul 04:45", price: 4326.99, lowerBound: 3555.96, upperBound: 5250.85, day: "current", type: "prediction" },
  { time: "05:00", fullTime: "15-Jul 05:00", price: 4391.27, lowerBound: 3577.09, upperBound: 5401.67, day: "current", type: "prediction" },
  { time: "05:15", fullTime: "15-Jul 05:15", price: 4590.06, lowerBound: 3658.44, upperBound: 5533.94, day: "current", type: "prediction" },
  { time: "05:30", fullTime: "15-Jul 05:30", price: 4712.54, lowerBound: 3779.66, upperBound: 6490.57, day: "current", type: "prediction" },
  { time: "05:45", fullTime: "15-Jul 05:45", price: 4579.80, lowerBound: 3686.92, upperBound: 6144.13, day: "current", type: "prediction" },
  { time: "06:00", fullTime: "15-Jul 06:00", price: 4879.33, lowerBound: 3691.65, upperBound: 6453.46, day: "current", type: "prediction" },
  { time: "06:15", fullTime: "15-Jul 06:15", price: 5062.68, lowerBound: 3787.43, upperBound: 6464.17, day: "current", type: "prediction" },
  { time: "06:30", fullTime: "15-Jul 06:30", price: 4965.86, lowerBound: 3787.13, upperBound: 6388.72, day: "current", type: "prediction" },
  { time: "06:45", fullTime: "15-Jul 06:45", price: 4585.77, lowerBound: 3673.17, upperBound: 6017.90, day: "current", type: "prediction" },
  { time: "07:00", fullTime: "15-Jul 07:00", price: 3817.45, lowerBound: 3270.21, upperBound: 4550.04, day: "current", type: "prediction" },
  { time: "07:15", fullTime: "15-Jul 07:15", price: 3677.17, lowerBound: 3145.70, upperBound: 4027.18, day: "current", type: "prediction" },
  { time: "07:30", fullTime: "15-Jul 07:30", price: 3340.65, lowerBound: 2955.09, upperBound: 3801.68, day: "current", type: "prediction" },
  { time: "07:45", fullTime: "15-Jul 07:45", price: 3191.46, lowerBound: 2791.71, upperBound: 3795.40, day: "current", type: "prediction" },
  { time: "08:00", fullTime: "15-Jul 08:00", price: 3020.80, lowerBound: 2687.20, upperBound: 3471.01, day: "current", type: "prediction" },
  { time: "08:15", fullTime: "15-Jul 08:15", price: 2959.60, lowerBound: 2640.52, upperBound: 3359.13, day: "current", type: "prediction" },
  { time: "08:30", fullTime: "15-Jul 08:30", price: 2810.47, lowerBound: 2373.55, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "08:45", fullTime: "15-Jul 08:45", price: 2775.07, lowerBound: 2374.87, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "09:00", fullTime: "15-Jul 09:00", price: 2829.90, lowerBound: 2378.11, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "09:15", fullTime: "15-Jul 09:15", price: 2887.82, lowerBound: 2427.26, upperBound: 3469.36, day: "current", type: "prediction" },
  { time: "09:30", fullTime: "15-Jul 09:30", price: 2917.70, lowerBound: 2415.19, upperBound: 3469.36, day: "current", type: "prediction" },
  { time: "09:45", fullTime: "15-Jul 09:45", price: 2902.05, lowerBound: 2415.07, upperBound: 3469.36, day: "current", type: "prediction" },
  { time: "10:00", fullTime: "15-Jul 10:00", price: 2709.25, lowerBound: 2313.79, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "10:15", fullTime: "15-Jul 10:15", price: 2685.94, lowerBound: 2205.12, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "10:30", fullTime: "15-Jul 10:30", price: 2674.35, lowerBound: 2214.60, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "10:45", fullTime: "15-Jul 10:45", price: 2574.12, lowerBound: 2214.60, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "11:00", fullTime: "15-Jul 11:00", price: 2574.12, lowerBound: 2214.60, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "11:15", fullTime: "15-Jul 11:15", price: 2562.49, lowerBound: 2197.53, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "11:30", fullTime: "15-Jul 11:30", price: 2569.86, lowerBound: 2197.96, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "11:45", fullTime: "15-Jul 11:45", price: 2551.48, lowerBound: 2202.28, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "12:00", fullTime: "15-Jul 12:00", price: 2602.16, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "12:15", fullTime: "15-Jul 12:15", price: 2602.16, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "12:30", fullTime: "15-Jul 12:30", price: 2602.16, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "12:45", fullTime: "15-Jul 12:45", price: 2567.59, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "13:00", fullTime: "15-Jul 13:00", price: 2567.59, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "13:15", fullTime: "15-Jul 13:15", price: 2516.28, lowerBound: 2159.96, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "13:30", fullTime: "15-Jul 13:30", price: 2516.28, lowerBound: 2159.96, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "13:45", fullTime: "15-Jul 13:45", price: 2567.59, lowerBound: 2205.83, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "14:00", fullTime: "15-Jul 14:00", price: 2639.62, lowerBound: 2201.50, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "14:15", fullTime: "15-Jul 14:15", price: 2643.88, lowerBound: 2218.14, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "14:30", fullTime: "15-Jul 14:30", price: 2662.53, lowerBound: 2222.28, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "14:45", fullTime: "15-Jul 14:45", price: 2793.05, lowerBound: 2229.14, upperBound: 3348.06, day: "current", type: "prediction" },
  { time: "15:00", fullTime: "15-Jul 15:00", price: 2862.70, lowerBound: 2454.28, upperBound: 3469.36, day: "current", type: "prediction" },
  { time: "15:15", fullTime: "15-Jul 15:15", price: 2920.76, lowerBound: 2427.02, upperBound: 3469.36, day: "current", type: "prediction" },
  { time: "15:30", fullTime: "15-Jul 15:30", price: 3068.98, lowerBound: 2588.47, upperBound: 3760.67, day: "current", type: "prediction" },
  { time: "15:45", fullTime: "15-Jul 15:45", price: 3127.26, lowerBound: 2664.36, upperBound: 3760.67, day: "current", type: "prediction" },
  { time: "16:00", fullTime: "15-Jul 16:00", price: 3143.02, lowerBound: 2727.78, upperBound: 3760.67, day: "current", type: "prediction" },
  { time: "16:15", fullTime: "15-Jul 16:15", price: 3165.55, lowerBound: 2731.24, upperBound: 3795.40, day: "current", type: "prediction" },
  { time: "16:30", fullTime: "15-Jul 16:30", price: 3168.07, lowerBound: 2742.03, upperBound: 3795.40, day: "current", type: "prediction" },
  { time: "16:45", fullTime: "15-Jul 16:45", price: 3275.46, lowerBound: 2792.05, upperBound: 3795.40, day: "current", type: "prediction" },
  { time: "17:00", fullTime: "15-Jul 17:00", price: 3373.33, lowerBound: 2929.84, upperBound: 3801.68, day: "current", type: "prediction" },
  { time: "17:15", fullTime: "15-Jul 17:15", price: 3364.27, lowerBound: 2945.96, upperBound: 3810.34, day: "current", type: "prediction" },
  { time: "17:30", fullTime: "15-Jul 17:30", price: 3415.50, lowerBound: 2945.96, upperBound: 3908.89, day: "current", type: "prediction" },
  { time: "17:45", fullTime: "15-Jul 17:45", price: 3599.87, lowerBound: 3077.16, upperBound: 4005.63, day: "current", type: "prediction" },
  { time: "18:00", fullTime: "15-Jul 18:00", price: 3816.47, lowerBound: 3265.49, upperBound: 4576.21, day: "current", type: "prediction" },
  { time: "18:15", fullTime: "15-Jul 18:15", price: 4255.02, lowerBound: 3676.35, upperBound: 4988.49, day: "current", type: "prediction" },
  { time: "18:30", fullTime: "15-Jul 18:30", price: 6005.02, lowerBound: 4491.93, upperBound: 9488.23, day: "current", type: "prediction" },
  { time: "18:45", fullTime: "15-Jul 18:45", price: 9172.30, lowerBound: 5910.09, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "19:00", fullTime: "15-Jul 19:00", price: 9192.26, lowerBound: 6404.34, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "19:15", fullTime: "15-Jul 19:15", price: 9419.62, lowerBound: 6541.98, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "19:30", fullTime: "15-Jul 19:30", price: 9575.50, lowerBound: 7012.93, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "19:45", fullTime: "15-Jul 19:45", price: 9652.87, lowerBound: 7098.95, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "20:00", fullTime: "15-Jul 20:00", price: 9651.19, lowerBound: 7204.55, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "20:15", fullTime: "15-Jul 20:15", price: 9857.01, lowerBound: 9460.89, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "20:30", fullTime: "15-Jul 20:30", price: 9849.60, lowerBound: 9502.87, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "20:45", fullTime: "15-Jul 20:45", price: 9849.60, lowerBound: 9698.62, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "21:00", fullTime: "15-Jul 21:00", price: 9860.11, lowerBound: 9693.13, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "21:15", fullTime: "15-Jul 21:15", price: 9884.00, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "21:30", fullTime: "15-Jul 21:30", price: 9884.00, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "21:45", fullTime: "15-Jul 21:45", price: 9884.00, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "22:00", fullTime: "15-Jul 22:00", price: 9884.00, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "22:15", fullTime: "15-Jul 22:15", price: 9887.16, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "22:30", fullTime: "15-Jul 22:30", price: 9887.16, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "22:45", fullTime: "15-Jul 22:45", price: 9887.16, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "23:00", fullTime: "15-Jul 23:00", price: 9894.57, lowerBound: 9754.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "23:15", fullTime: "15-Jul 23:15", price: 9896.92, lowerBound: 9716.45, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "23:30", fullTime: "15-Jul 23:30", price: 9637.67, lowerBound: 7223.39, upperBound: 10000.00, day: "current", type: "prediction" },
  { time: "23:45", fullTime: "15-Jul 23:45", price: 9431.04, lowerBound: 6493.21, upperBound: 10000.00, day: "current", type: "prediction" }
];

// Data lookup for each date
const dataLookup: { [key: string]: any[] } = {
  "2025-07-01": july1Data36Hours,
  "2025-07-02": july2Data36Hours,
  "2025-07-03": july3Data36Hours,
  "2025-07-15": july15PredictionData,
  // Add more dates as needed
};

// Calculate statistics only from July 1st data (24 hours)
const july1OnlyData = july1Data36Hours.filter(item => item.day === "current");

// Calculate statistics only from July 2nd data (24 hours)
const july2OnlyData = july2Data36Hours.filter(item => item.day === "current");

// Calculate statistics only from July 3rd data (24 hours)
const july3OnlyData = july3Data36Hours.filter(item => item.day === "current");

const DAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 1)); // July 1, 2025
  
  // Get the selected date in the correct format
  const dateKey = selectedDate.toISOString().split('T')[0];
  
  // Get current data and title based on selected date
  const currentData = dataLookup[dateKey] || july1Data36Hours;
  const currentOnlyData = currentData.filter(item => item.day === "current");
  
  // Create dynamic title
  const formatDateForTitle = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  
  const currentTitle = `${formatDateForTitle(selectedDate)} (36-hour view)`;
  
  // Calculate min/max/avg from current day data only (excluding prev/next day data)
  const currentPrices = currentOnlyData.map(d => d.price);
  const maxPrice = Math.max(...currentPrices);
  const minPrice = Math.min(...currentPrices);
  const avgPrice = currentPrices.reduce((sum, price) => sum + price, 0) / currentPrices.length;
  
  const maxPricePoint = currentOnlyData.find(d => d.price === maxPrice);
  const minPricePoint = currentOnlyData.find(d => d.price === minPrice);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.fullTime}</p>
          <p className="text-sm text-primary">
            {data.type === 'prediction' ? 'Predicted ' : ''}MCP: ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/MWh
          </p>
          {data.type === 'prediction' && (
            <>
              <p className="text-xs text-muted-foreground">
                Range: ₹{data.lowerBound.toFixed(0)} - ₹{data.upperBound.toFixed(0)}
              </p>
              <p className="text-xs text-accent">Prediction</p>
            </>
          )}
          {data.day === 'prev' && <p className="text-xs text-muted-foreground">Previous Day</p>}
          {data.day === 'next' && <p className="text-xs text-muted-foreground">Next Day</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  IEX Market Monitor
                </h1>
                <p className="text-xs text-muted-foreground">DAM Forecast</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <PageNavigation />
            <Link to="/gdam-forecast">
              <Button variant="outline" className="bg-accent/10 border-accent/20 hover:bg-accent/20">
                GDAM Dashboard
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title and Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Day-Ahead Market (DAM) Forecast
            </h1>
            <p className="text-muted-foreground mt-1">
              36-hour continuous price data with day boundaries
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Forecast Date:
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                    disabled={(date) => {
                    const day = date.getDate();
                    const month = date.getMonth();
                    const year = date.getFullYear();
                    // Allow July 1-3, 15, 2025
                    return !(year === 2025 && month === 6 && ((day >= 1 && day <= 3) || day === 15));
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Chart */}
          <div className="xl:col-span-3">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card/50 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  MCP Price Chart - {currentTitle}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted-foreground/50"></div>
                    <span>Previous Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span>{formatDateForTitle(selectedDate).split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted-foreground/30"></div>
                    <span>Next Day</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="fullTime" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={3}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[1000, 10000]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Day boundary markers - dynamic based on selected date */}
                      {dateKey === "2025-07-01" && (
                        <>
                          <ReferenceLine x="01-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                          <ReferenceLine x="02-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                        </>
                      )}
                      {dateKey === "2025-07-02" && (
                        <>
                          <ReferenceLine x="02-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                          <ReferenceLine x="03-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                        </>
                      )}
                      {dateKey === "2025-07-03" && (
                        <>
                          <ReferenceLine x="03-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                          <ReferenceLine x="04-Jul 00:00" stroke="hsl(var(--primary))" strokeDasharray="2 2" />
                        </>
                      )}
                      {dateKey === "2025-07-15" && (
                        <>
                          <ReferenceLine x="15-Jul 00:00" stroke="hsl(var(--accent))" strokeDasharray="2 2" />
                          <ReferenceLine x="15-Jul 12:00" stroke="hsl(var(--muted-foreground))" strokeDasharray="1 1" />
                        </>
                      )}
                      
                      {/* Average reference line for current day only */}
                      <ReferenceLine y={avgPrice} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                      
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={dateKey === "2025-07-15" ? "hsl(var(--accent))" : "hsl(var(--primary))"} 
                        strokeWidth={2}
                        strokeDasharray={dateKey === "2025-07-15" ? "5 5" : "0"}
                        dot={(props) => {
                          const { payload } = props;
                          let fill = dateKey === "2025-07-15" ? "hsl(var(--accent))" : "hsl(var(--primary))";
                          if (payload.day === "prev") fill = "hsl(var(--muted-foreground))";
                          if (payload.day === "next") fill = "hsl(var(--muted-foreground))";
                          return <circle {...props} fill={fill} r={2} />;
                        }}
                        activeDot={{ r: 4, stroke: dateKey === "2025-07-15" ? "hsl(var(--accent))" : "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics - Dynamic based on selected date */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              {formatDateForTitle(selectedDate).split(',')[0]} 
              {dateKey === "2025-07-15" && <span className="text-accent"> (Prediction)</span>}
            </h3>
            
            <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Max</p>
                    <p className="text-2xl font-bold text-destructive">₹{maxPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">at {maxPricePoint?.time}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Min</p>
                    <p className="text-2xl font-bold text-success">₹{minPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">at {minPricePoint?.time}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg</p>
                    <p className="text-2xl font-bold text-primary">₹{avgPrice.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h4 className="font-medium">36-Hour Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Data Points:</span>
                      <span className="font-medium">144 (15-min intervals)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peak Hours:</span>
                      <span className="font-medium">19:30 - 20:15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Off-Peak Hours:</span>
                      <span className="font-medium">09:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price Volatility:</span>
                      <span className="font-medium">High Evening</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DAMForecastPage;
