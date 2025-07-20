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

// 24-hour data for July 1, 2025
const july1Data = [
  { time: "00:00", price: 2999.75 },
  { time: "00:15", price: 2999.46 },
  { time: "00:30", price: 2999.26 },
  { time: "00:45", price: 2999.08 },
  { time: "01:00", price: 2920.38 },
  { time: "01:15", price: 2870.75 },
  { time: "01:30", price: 2870.88 },
  { time: "01:45", price: 2919.22 },
  { time: "02:00", price: 2870.67 },
  { time: "02:15", price: 2870.87 },
  { time: "02:30", price: 2870.87 },
  { time: "02:45", price: 2870.88 },
  { time: "03:00", price: 2870.68 },
  { time: "03:15", price: 2870.31 },
  { time: "03:30", price: 2784.2 },
  { time: "03:45", price: 2829.09 },
  { time: "04:00", price: 2590.88 },
  { time: "04:15", price: 2739.17 },
  { time: "04:30", price: 2739.13 },
  { time: "04:45", price: 2640.55 },
  { time: "05:00", price: 2829.4 },
  { time: "05:15", price: 2870 },
  { time: "05:30", price: 2870.47 },
  { time: "05:45", price: 2900.46 },
  { time: "06:00", price: 2960.72 },
  { time: "06:15", price: 2960.82 },
  { time: "06:30", price: 2960.64 },
  { time: "06:45", price: 2889.84 },
  { time: "07:00", price: 2701.93 },
  { time: "07:15", price: 2532.36 },
  { time: "07:30", price: 2400.83 },
  { time: "07:45", price: 2172.36 },
  { time: "08:00", price: 2059.94 },
  { time: "08:15", price: 2139.23 },
  { time: "08:30", price: 2142.64 },
  { time: "08:45", price: 2124.02 },
  { time: "09:00", price: 1667.75 },
  { time: "09:15", price: 1667.42 },
  { time: "09:30", price: 1667.46 },
  { time: "09:45", price: 1500.87 },
  { time: "10:00", price: 1667.02 },
  { time: "10:15", price: 1667.32 },
  { time: "10:30", price: 1667.93 },
  { time: "10:45", price: 1699.62 },
  { time: "11:00", price: 1667.69 },
  { time: "11:15", price: 1667.63 },
  { time: "11:30", price: 1667.22 },
  { time: "11:45", price: 1667.27 },
  { time: "12:00", price: 1667.1 },
  { time: "12:15", price: 1667.21 },
  { time: "12:30", price: 1667.27 },
  { time: "12:45", price: 1667.27 },
  { time: "13:00", price: 1500.82 },
  { time: "13:15", price: 1449.26 },
  { time: "13:30", price: 1486.2 },
  { time: "13:45", price: 1500.33 },
  { time: "14:00", price: 1726.2 },
  { time: "14:15", price: 1758.56 },
  { time: "14:30", price: 1861.59 },
  { time: "14:45", price: 1895.2 },
  { time: "15:00", price: 1989.78 },
  { time: "15:15", price: 2100.08 },
  { time: "15:30", price: 2499.88 },
  { time: "15:45", price: 2499.19 },
  { time: "16:00", price: 2100.71 },
  { time: "16:15", price: 2185.93 },
  { time: "16:30", price: 2100.87 },
  { time: "16:45", price: 2100.84 },
  { time: "17:00", price: 2505.98 },
  { time: "17:15", price: 2532.87 },
  { time: "17:30", price: 2648.93 },
  { time: "17:45", price: 2701.97 },
  { time: "18:00", price: 2801.3 },
  { time: "18:15", price: 2870.07 },
  { time: "18:30", price: 2900.17 },
  { time: "18:45", price: 2999.93 },
  { time: "19:00", price: 3396.8 },
  { time: "19:15", price: 3503.86 },
  { time: "19:30", price: 3913.08 },
  { time: "19:45", price: 4689.13 },
  { time: "20:00", price: 4689.03 },
  { time: "20:15", price: 4639.12 },
  { time: "20:30", price: 4219.14 },
  { time: "20:45", price: 4069.95 },
  { time: "21:00", price: 4119.02 },
  { time: "21:15", price: 4140 },
  { time: "21:30", price: 4119.44 },
  { time: "21:45", price: 4219.15 },
  { time: "22:00", price: 4589.21 },
  { time: "22:15", price: 4600.74 },
  { time: "22:30", price: 4510.6 },
  { time: "22:45", price: 4589.94 },
  { time: "23:00", price: 4419.6 },
  { time: "23:15", price: 4219.04 },
  { time: "23:30", price: 4069.66 },
  { time: "23:45", price: 3943.03 }
];

// 24-hour data for July 2, 2025
const july2Data = [
  { time: "00:00", price: 3060.32 },
  { time: "00:15", price: 3060.66 },
  { time: "00:30", price: 2999.69 },
  { time: "00:45", price: 2950.01 },
  { time: "01:00", price: 2950.15 },
  { time: "01:15", price: 2919.76 },
  { time: "01:30", price: 2940.01 },
  { time: "01:45", price: 2830.91 },
  { time: "02:00", price: 2940.45 },
  { time: "02:15", price: 2920.88 },
  { time: "02:30", price: 2830.15 },
  { time: "02:45", price: 2920.26 },
  { time: "03:00", price: 2829.89 },
  { time: "03:15", price: 2829.95 },
  { time: "03:30", price: 2830.02 },
  { time: "03:45", price: 2729.82 },
  { time: "04:00", price: 2729.63 },
  { time: "04:15", price: 2729.53 },
  { time: "04:30", price: 2729.63 },
  { time: "04:45", price: 2729.98 },
  { time: "05:00", price: 2729.9 },
  { time: "05:15", price: 2849.86 },
  { time: "05:30", price: 2960.22 },
  { time: "05:45", price: 2950.88 },
  { time: "06:00", price: 3184.58 },
  { time: "06:15", price: 3319.15 },
  { time: "06:30", price: 3176.98 },
  { time: "06:45", price: 2960.47 },
  { time: "07:00", price: 2849.09 },
  { time: "07:15", price: 2610.66 },
  { time: "07:30", price: 2435.95 },
  { time: "07:45", price: 2435.7 },
  { time: "08:00", price: 2435.01 },
  { time: "08:15", price: 2262.18 },
  { time: "08:30", price: 2197.28 },
  { time: "08:45", price: 2155.06 },
  { time: "09:00", price: 2112.24 },
  { time: "09:15", price: 1807.35 },
  { time: "09:30", price: 1736.21 },
  { time: "09:45", price: 1729.5 },
  { time: "10:00", price: 1667.58 },
  { time: "10:15", price: 1667.48 },
  { time: "10:30", price: 1729.54 },
  { time: "10:45", price: 1729.4 },
  { time: "11:00", price: 1729.36 },
  { time: "11:15", price: 1729.73 },
  { time: "11:30", price: 1729.65 },
  { time: "11:45", price: 1729.54 },
  { time: "12:00", price: 1729.37 },
  { time: "12:15", price: 1729.42 },
  { time: "12:30", price: 1729.44 },
  { time: "12:45", price: 1729.29 },
  { time: "13:00", price: 1667.89 },
  { time: "13:15", price: 1712.05 },
  { time: "13:30", price: 1729.19 },
  { time: "13:45", price: 1729.57 },
  { time: "14:00", price: 1750.12 },
  { time: "14:15", price: 1754.86 },
  { time: "14:30", price: 1788.32 },
  { time: "14:45", price: 1847.06 },
  { time: "15:00", price: 1900.58 },
  { time: "15:15", price: 2080.44 },
  { time: "15:30", price: 2200.88 },
  { time: "15:45", price: 2300.12 },
  { time: "16:00", price: 2350.75 },
  { time: "16:15", price: 2380.93 },
  { time: "16:30", price: 2400.87 },
  { time: "16:45", price: 2420.84 },
  { time: "17:00", price: 2505.98 },
  { time: "17:15", price: 2532.87 },
  { time: "17:30", price: 2648.93 },
  { time: "17:45", price: 2701.97 },
  { time: "18:00", price: 2801.3 },
  { time: "18:15", price: 2870.07 },
  { time: "18:30", price: 2900.17 },
  { time: "18:45", price: 2999.93 },
  { time: "19:00", price: 3356.8 },
  { time: "19:15", price: 3463.86 },
  { time: "19:30", price: 3873.08 },
  { time: "19:45", price: 4649.13 },
  { time: "20:00", price: 4649.03 },
  { time: "20:15", price: 4599.12 },
  { time: "20:30", price: 4179.14 },
  { time: "20:45", price: 4029.95 },
  { time: "21:00", price: 4079.02 },
  { time: "21:15", price: 4100 },
  { time: "21:30", price: 4079.44 },
  { time: "21:45", price: 4179.15 },
  { time: "22:00", price: 4549.21 },
  { time: "22:15", price: 4560.74 },
  { time: "22:30", price: 4470.6 },
  { time: "22:45", price: 4549.94 },
  { time: "23:00", price: 4379.6 },
  { time: "23:15", price: 4179.04 },
  { time: "23:30", price: 4029.66 },
  { time: "23:45", price: 3903.03 }
];

// 24-hour data for July 3, 2025
const july3Data = [
  { time: "00:00", price: 3020.32 },
  { time: "00:15", price: 3020.66 },
  { time: "00:30", price: 2959.69 },
  { time: "00:45", price: 2910.01 },
  { time: "01:00", price: 2910.15 },
  { time: "01:15", price: 2879.76 },
  { time: "01:30", price: 2900.01 },
  { time: "01:45", price: 2790.91 },
  { time: "02:00", price: 2900.45 },
  { time: "02:15", price: 2880.88 },
  { time: "02:30", price: 2790.15 },
  { time: "02:45", price: 2880.26 },
  { time: "03:00", price: 2789.89 },
  { time: "03:15", price: 2789.95 },
  { time: "03:30", price: 2790.02 },
  { time: "03:45", price: 2689.82 },
  { time: "04:00", price: 2689.63 },
  { time: "04:15", price: 2689.53 },
  { time: "04:30", price: 2689.63 },
  { time: "04:45", price: 2689.98 },
  { time: "05:00", price: 2689.9 },
  { time: "05:15", price: 2809.86 },
  { time: "05:30", price: 2920.22 },
  { time: "05:45", price: 2910.88 },
  { time: "06:00", price: 3144.58 },
  { time: "06:15", price: 3279.15 },
  { time: "06:30", price: 3136.98 },
  { time: "06:45", price: 2920.47 },
  { time: "07:00", price: 2809.09 },
  { time: "07:15", price: 2570.66 },
  { time: "07:30", price: 2395.95 },
  { time: "07:45", price: 2395.7 },
  { time: "08:00", price: 2395.01 },
  { time: "08:15", price: 2222.18 },
  { time: "08:30", price: 2157.28 },
  { time: "08:45", price: 2115.06 },
  { time: "09:00", price: 2072.24 },
  { time: "09:15", price: 1767.35 },
  { time: "09:30", price: 1696.21 },
  { time: "09:45", price: 1689.5 },
  { time: "10:00", price: 1627.58 },
  { time: "10:15", price: 1627.48 },
  { time: "10:30", price: 1689.54 },
  { time: "10:45", price: 1689.4 },
  { time: "11:00", price: 1689.36 },
  { time: "11:15", price: 1689.73 },
  { time: "11:30", price: 1689.65 },
  { time: "11:45", price: 1689.54 },
  { time: "12:00", price: 1689.37 },
  { time: "12:15", price: 1689.42 },
  { time: "12:30", price: 1689.44 },
  { time: "12:45", price: 1689.29 },
  { time: "13:00", price: 1627.89 },
  { time: "13:15", price: 1672.05 },
  { time: "13:30", price: 1689.19 },
  { time: "13:45", price: 1689.57 },
  { time: "14:00", price: 1710.12 },
  { time: "14:15", price: 1714.86 },
  { time: "14:30", price: 1748.32 },
  { time: "14:45", price: 1807.06 },
  { time: "15:00", price: 1860.58 },
  { time: "15:15", price: 2040.44 },
  { time: "15:30", price: 2160.88 },
  { time: "15:45", price: 2260.12 },
  { time: "16:00", price: 2310.75 },
  { time: "16:15", price: 2340.93 },
  { time: "16:30", price: 2360.87 },
  { time: "16:45", price: 2380.84 },
  { time: "17:00", price: 2465.98 },
  { time: "17:15", price: 2492.87 },
  { time: "17:30", price: 2608.93 },
  { time: "17:45", price: 2661.97 },
  { time: "18:00", price: 2761.3 },
  { time: "18:15", price: 2830.07 },
  { time: "18:30", price: 2860.17 },
  { time: "18:45", price: 2959.93 },
  { time: "19:00", price: 3316.8 },
  { time: "19:15", price: 3423.86 },
  { time: "19:30", price: 3833.08 },
  { time: "19:45", price: 4609.13 },
  { time: "20:00", price: 4609.03 },
  { time: "20:15", price: 4559.12 },
  { time: "20:30", price: 4139.14 },
  { time: "20:45", price: 3989.95 },
  { time: "21:00", price: 4039.02 },
  { time: "21:15", price: 4060 },
  { time: "21:30", price: 4039.44 },
  { time: "21:45", price: 4139.15 },
  { time: "22:00", price: 4509.21 },
  { time: "22:15", price: 4520.74 },
  { time: "22:30", price: 4430.6 },
  { time: "22:45", price: 4509.94 },
  { time: "23:00", price: 4339.6 },
  { time: "23:15", price: 4139.04 },
  { time: "23:30", price: 3989.66 },
  { time: "23:45", price: 3863.03 }
];

// July 15, 2025 prediction data (24-hour view with bounds)
const july15PredictionData = [
  { time: "00:00", price: 9480.03, upperBound: 10000.00, lowerBound: 5393.02 },
  { time: "00:15", price: 7862.58, upperBound: 10000.00, lowerBound: 4309.37 },
  { time: "00:30", price: 5967.29, upperBound: 7729.38, lowerBound: 3888.26 },
  { time: "00:45", price: 5617.15, upperBound: 7306.01, lowerBound: 3807.82 },
  { time: "01:00", price: 5453.08, upperBound: 7608.52, lowerBound: 3711.74 },
  { time: "01:15", price: 5103.67, upperBound: 5974.78, lowerBound: 3686.29 },
  { time: "01:30", price: 4631.96, upperBound: 5746.79, lowerBound: 3588.55 },
  { time: "01:45", price: 4607.95, upperBound: 5548.54, lowerBound: 3586.60 },
  { time: "02:00", price: 4181.35, upperBound: 5217.73, lowerBound: 3356.89 },
  { time: "02:15", price: 4129.19, upperBound: 5169.87, lowerBound: 3346.56 },
  { time: "02:30", price: 4301.30, upperBound: 5112.40, lowerBound: 3396.51 },
  { time: "02:45", price: 4274.28, upperBound: 5061.89, lowerBound: 3356.89 },
  { time: "03:00", price: 4235.71, upperBound: 5057.72, lowerBound: 3298.49 },
  { time: "03:15", price: 4189.78, upperBound: 5057.72, lowerBound: 3298.49 },
  { time: "03:30", price: 4058.32, upperBound: 4673.31, lowerBound: 3214.91 },
  { time: "03:45", price: 3883.80, upperBound: 4675.42, lowerBound: 3198.31 },
  { time: "04:00", price: 3977.11, upperBound: 5123.89, lowerBound: 3328.83 },
  { time: "04:15", price: 4028.46, upperBound: 5147.19, lowerBound: 3312.41 },
  { time: "04:30", price: 4028.46, upperBound: 5147.19, lowerBound: 3315.73 },
  { time: "04:45", price: 4326.99, upperBound: 5250.85, lowerBound: 3555.96 },
  { time: "05:00", price: 4391.27, upperBound: 5401.67, lowerBound: 3577.09 },
  { time: "05:15", price: 4590.06, upperBound: 5533.94, lowerBound: 3658.44 },
  { time: "05:30", price: 4712.54, upperBound: 6490.57, lowerBound: 3779.66 },
  { time: "05:45", price: 4579.80, upperBound: 6144.13, lowerBound: 3686.92 },
  { time: "06:00", price: 4879.33, upperBound: 6453.46, lowerBound: 3691.65 },
  { time: "06:15", price: 5062.68, upperBound: 6464.17, lowerBound: 3787.43 },
  { time: "06:30", price: 4965.86, upperBound: 6388.72, lowerBound: 3787.13 },
  { time: "06:45", price: 4585.77, upperBound: 6017.90, lowerBound: 3673.17 },
  { time: "07:00", price: 3817.45, upperBound: 4550.04, lowerBound: 3270.21 },
  { time: "07:15", price: 3677.17, upperBound: 4027.18, lowerBound: 3145.70 },
  { time: "07:30", price: 3340.65, upperBound: 3801.68, lowerBound: 2955.09 },
  { time: "07:45", price: 3191.46, upperBound: 3795.40, lowerBound: 2791.71 },
  { time: "08:00", price: 3020.80, upperBound: 3471.01, lowerBound: 2687.20 },
  { time: "08:15", price: 2959.60, upperBound: 3359.13, lowerBound: 2640.52 },
  { time: "08:30", price: 2810.47, upperBound: 3348.06, lowerBound: 2373.55 },
  { time: "08:45", price: 2775.07, upperBound: 3348.06, lowerBound: 2374.87 },
  { time: "09:00", price: 2829.90, upperBound: 3348.06, lowerBound: 2378.11 },
  { time: "09:15", price: 2887.82, upperBound: 3469.36, lowerBound: 2427.26 },
  { time: "09:30", price: 2917.70, upperBound: 3469.36, lowerBound: 2415.19 },
  { time: "09:45", price: 2902.05, upperBound: 3469.36, lowerBound: 2415.07 },
  { time: "10:00", price: 2709.25, upperBound: 3348.06, lowerBound: 2313.79 },
  { time: "10:15", price: 2685.94, upperBound: 3348.06, lowerBound: 2205.12 },
  { time: "10:30", price: 2674.35, upperBound: 3348.06, lowerBound: 2214.60 },
  { time: "10:45", price: 2574.12, upperBound: 3348.06, lowerBound: 2214.60 },
  { time: "11:00", price: 2574.12, upperBound: 3348.06, lowerBound: 2214.60 },
  { time: "11:15", price: 2562.49, upperBound: 3348.06, lowerBound: 2197.53 },
  { time: "11:30", price: 2569.86, upperBound: 3348.06, lowerBound: 2197.96 },
  { time: "11:45", price: 2551.48, upperBound: 3348.06, lowerBound: 2202.28 },
  { time: "12:00", price: 2602.16, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "12:15", price: 2602.16, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "12:30", price: 2602.16, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "12:45", price: 2567.59, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "13:00", price: 2567.59, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "13:15", price: 2516.28, upperBound: 3348.06, lowerBound: 2159.96 },
  { time: "13:30", price: 2516.28, upperBound: 3348.06, lowerBound: 2159.96 },
  { time: "13:45", price: 2567.59, upperBound: 3348.06, lowerBound: 2205.83 },
  { time: "14:00", price: 2639.62, upperBound: 3348.06, lowerBound: 2201.50 },
  { time: "14:15", price: 2643.88, upperBound: 3348.06, lowerBound: 2218.14 },
  { time: "14:30", price: 2662.53, upperBound: 3348.06, lowerBound: 2222.28 },
  { time: "14:45", price: 2793.05, upperBound: 3348.06, lowerBound: 2229.14 },
  { time: "15:00", price: 2862.70, upperBound: 3469.36, lowerBound: 2454.28 },
  { time: "15:15", price: 2920.76, upperBound: 3469.36, lowerBound: 2427.02 },
  { time: "15:30", price: 3068.98, upperBound: 3760.67, lowerBound: 2588.47 },
  { time: "15:45", price: 3127.26, upperBound: 3760.67, lowerBound: 2664.36 },
  { time: "16:00", price: 3143.02, upperBound: 3760.67, lowerBound: 2727.78 },
  { time: "16:15", price: 3165.55, upperBound: 3795.40, lowerBound: 2731.24 },
  { time: "16:30", price: 3168.07, upperBound: 3795.40, lowerBound: 2742.03 },
  { time: "16:45", price: 3275.46, upperBound: 3795.40, lowerBound: 2792.05 },
  { time: "17:00", price: 3373.33, upperBound: 3801.68, lowerBound: 2929.84 },
  { time: "17:15", price: 3364.27, upperBound: 3810.34, lowerBound: 2945.96 },
  { time: "17:30", price: 3415.50, upperBound: 3908.89, lowerBound: 2945.96 },
  { time: "17:45", price: 3599.87, upperBound: 4005.63, lowerBound: 3077.16 },
  { time: "18:00", price: 3816.47, upperBound: 4576.21, lowerBound: 3265.49 },
  { time: "18:15", price: 4255.02, upperBound: 4988.49, lowerBound: 3676.35 },
  { time: "18:30", price: 6005.02, upperBound: 9488.23, lowerBound: 4491.93 },
  { time: "18:45", price: 9172.30, upperBound: 10000.00, lowerBound: 5910.09 },
  { time: "19:00", price: 9192.26, upperBound: 10000.00, lowerBound: 6404.34 },
  { time: "19:15", price: 9419.62, upperBound: 10000.00, lowerBound: 6541.98 },
  { time: "19:30", price: 9575.50, upperBound: 10000.00, lowerBound: 7012.93 },
  { time: "19:45", price: 9652.87, upperBound: 10000.00, lowerBound: 7098.95 },
  { time: "20:00", price: 9651.19, upperBound: 10000.00, lowerBound: 7204.55 },
  { time: "20:15", price: 9857.01, upperBound: 10000.00, lowerBound: 9460.89 },
  { time: "20:30", price: 9849.60, upperBound: 10000.00, lowerBound: 9502.87 },
  { time: "20:45", price: 9849.60, upperBound: 10000.00, lowerBound: 9698.62 },
  { time: "21:00", price: 9860.11, upperBound: 10000.00, lowerBound: 9693.13 },
  { time: "21:15", price: 9884.00, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "21:30", price: 9884.00, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "21:45", price: 9884.00, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "22:00", price: 9884.00, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "22:15", price: 9887.16, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "22:30", price: 9887.16, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "22:45", price: 9887.16, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "23:00", price: 9894.57, upperBound: 10000.00, lowerBound: 9754.39 },
  { time: "23:15", price: 9896.92, upperBound: 10000.00, lowerBound: 9716.45 },
  { time: "23:30", price: 9637.67, upperBound: 10000.00, lowerBound: 7223.39 },
  { time: "23:45", price: 9431.04, upperBound: 10000.00, lowerBound: 6493.21 },
];

const DAMForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 1)); // July 1, 2025

  const dataMap = {
    "2025-07-01": july1Data,
    "2025-07-02": july2Data, 
    "2025-07-03": july3Data,
    "2025-07-15": july15PredictionData
  };

  const dateKey = selectedDate.toISOString().split('T')[0];
  console.log('Selected Date:', selectedDate, 'Date Key:', dateKey);
  const currentData = dataMap[dateKey] || july1Data;
  console.log('Current Data Length:', currentData.length, 'First Data Point:', currentData[0]);
  const isPrediction = dateKey === "2025-07-15";

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, upperBoundMax: 0, lowerBoundMin: 0 };
    
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // For prediction data with bounds
    if (data[0].upperBound !== undefined) {
      const upperBounds = data.map(d => d.upperBound);
      const lowerBounds = data.map(d => d.lowerBound);
      const upperBoundMax = Math.max(...upperBounds);
      const lowerBoundMin = Math.min(...lowerBounds);
      
      return { 
        min: min.toFixed(2), 
        max: max.toFixed(2), 
        avg: avg.toFixed(2),
        upperBoundMax: upperBoundMax.toFixed(2),
        lowerBoundMin: lowerBoundMin.toFixed(2)
      };
    }
    
    return { min: min.toFixed(2), max: max.toFixed(2), avg: avg.toFixed(2) };
  };

  const getChartData = (data: any[]) => {
    return data;
  };

  const stats = calculateStats(currentData);
  const chartData = getChartData(currentData);

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
              24-hour price data with prediction intervals
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
              <CardTitle className="text-center">
                {isPrediction ? "DAM Prediction" : "DAM Forecast"} for {format(selectedDate, "dd MMMM yyyy")} (24-Hour View)
              </CardTitle>
            </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart width={800} height={400} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 100', 'dataMax + 100']}
                      tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value, name) => {
                        if (name === 'upperBound') return [`₹${value}`, 'Upper Bound'];
                        if (name === 'lowerBound') return [`₹${value}`, 'Lower Bound'];
                        return [`₹${value}`, isPrediction ? 'Predicted MCP' : 'MCP'];
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    
                    
                    {/* Upper and Lower bound lines for predictions */}
                    {isPrediction && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="upperBound" 
                          stroke="hsl(var(--destructive))"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          dot={false}
                          activeDot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lowerBound" 
                          stroke="hsl(var(--constructive))"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          dot={false}
                          activeDot={false}
                        />
                      </>
                    )}
                    
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray={isPrediction ? "5 5" : "0"}
                      dot={false}
                      activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  Market Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Minimum Price</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">₹{stats.min}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Maximum Price</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">₹{stats.max}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Average Price</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">₹{stats.avg}</span>
                  </div>
                  
                  {stats.upperBoundMax && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Upper Bound Max</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">₹{stats.upperBoundMax}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Lower Bound Min</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">₹{stats.lowerBoundMin}</span>
                      </div>
                    </>
                  )}
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