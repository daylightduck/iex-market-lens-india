import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, Zap, Activity, Users, Building } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import PageNavigation from "@/components/PageNavigation";
import DashboardNavigation from "@/components/DashboardNavigation";

// Sample IEX market data
const tradingVolumeData = [
  { month: 'Jan', volume: 15200, value: 85000 },
  { month: 'Feb', volume: 16800, value: 92000 },
  { month: 'Mar', volume: 18500, value: 98000 },
  { month: 'Apr', volume: 19200, value: 105000 },
  { month: 'May', volume: 21000, value: 115000 },
  { month: 'Jun', volume: 22500, value: 125000 },
];

const marketSegmentData = [
  { name: 'Day-Ahead Market', value: 45, color: '#8884d8' },
  { name: 'Real Time Market', value: 25, color: '#82ca9d' },
  { name: 'Term-Ahead Market', value: 20, color: '#ffc658' },
  { name: 'Renewable Energy Certificate', value: 10, color: '#ff7300' },
];

const dailyPricesData = [
  { time: '00:00', dam: 3200, rtm: 3180, tam: 3250 },
  { time: '06:00', dam: 4200, rtm: 4150, tam: 4300 },
  { time: '12:00', dam: 3800, rtm: 3750, tam: 3900 },
  { time: '18:00', dam: 8500, rtm: 8400, tam: 8600 },
];

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

const IEXDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              IEX Dashboard
            </h1>
            <p className="text-muted-foreground">
              Indian Energy Exchange - Real-time market overview and analytics
            </p>
          </div>
          <ThemeToggle />
        </div>

        <DashboardNavigation />
        <PageNavigation />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">22,500 MU</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">₹1,25,000 Cr</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">6,500+</div>
              <p className="text-xs text-muted-foreground">
                Registered members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current DAM Price</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">₹4,250/MWh</div>
              <p className="text-xs text-muted-foreground">
                Real-time average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trading Volume Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trading Volume & Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tradingVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'volume' ? `${value} MU` : formatCurrency(Number(value)) + ' Cr',
                        name === 'volume' ? 'Volume' : 'Value'
                      ]}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" name="volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Segment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Segment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketSegmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Price Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Price Comparison (DAM vs RTM vs TAM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPricesData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)) + '/MWh']}
                  />
                  <Line type="monotone" dataKey="dam" stroke="#8884d8" strokeWidth={2} name="DAM" />
                  <Line type="monotone" dataKey="rtm" stroke="#82ca9d" strokeWidth={2} name="RTM" />
                  <Line type="monotone" dataKey="tam" stroke="#ffc658" strokeWidth={2} name="TAM" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Market Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Day-Ahead Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Electricity trading for next day delivery with price discovery through double-sided closed auction.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Today's Volume:</span>
                  <span className="text-sm font-medium">15,200 MU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Price:</span>
                  <span className="text-sm font-medium">₹4,250/MWh</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Electricity trading for real-time delivery to manage grid imbalances and ensure grid stability.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Volume:</span>
                  <span className="text-sm font-medium">3,800 MU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Live Price:</span>
                  <span className="text-sm font-medium">₹4,180/MWh</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Term-Ahead Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Medium to long-term electricity trading for weekly, monthly, and yearly contracts.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Contracts:</span>
                  <span className="text-sm font-medium">2,100 MU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Price:</span>
                  <span className="text-sm font-medium">₹4,350/MWh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IEXDashboard;