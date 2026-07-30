import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 24000, projects: 4 },
  { month: 'Feb', revenue: 31000, projects: 6 },
  { month: 'Mar', revenue: 28000, projects: 5 },
  { month: 'Apr', revenue: 42000, projects: 8 },
  { month: 'May', revenue: 39000, projects: 7 },
  { month: 'Jun', revenue: 58000, projects: 11 },
  { month: 'Jul', revenue: 65700, projects: 14 },
];

const CATEGORY_DATA = [
  { category: 'Web Dev', revenue: 35000 },
  { category: 'UI/UX Design', revenue: 22000 },
  { category: 'AI Suite', revenue: 18500 },
  { category: 'Brand Identity', revenue: 12000 },
  { category: 'Mobile Apps', revenue: 16000 },
];

const STATUS_PIE_DATA = [
  { name: 'Paid Revenue', value: 65, color: '#10b981' },
  { name: 'Pending Balance', value: 25, color: '#3b82f6' },
  { name: 'Overdue Balance', value: 10, color: '#ef4444' },
];

export function AdminAnalytics() {
  return (
    <>
      <SEO
        title="Executive Analytics & Telemetry - GM Admin"
        description="Track agency financial performance, monthly revenue trends, project category breakdown, and client growth graphs."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Platform Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Financial telemetry, service category distribution, and growth charts.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>2026 Year-To-Date Report</span>
          </div>
        </div>

        {/* Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                YTD Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              $267,700
            </p>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +24.8% vs last quarter
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active Client Roster
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              18 Accounts
            </p>
            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-1">
              98.2% Client Retention Rate
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Delivered Builds
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              55 Products
            </p>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              100% On-Time Delivery Ratio
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Average Deal Size
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              $14,870
            </p>
            <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-1">
              Enterprise Package Average
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Monthly Revenue Area Chart */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Monthly Revenue Growth ($ USD)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Historical monthly billing progression across all studio client packages.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      color: '#ffffff',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Invoice Status Distribution Pie Chart */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Invoice Settlement Telemetry
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Breakdown of Paid vs Pending vs Overdue account balances.
              </p>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {STATUS_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      color: '#ffffff',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              {STATUS_PIE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Category Revenue Bar Chart */}
          <div className="lg:col-span-12 p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Revenue Distribution by Service Category ($ USD)
                </h3>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      color: '#ffffff',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#ea580c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default AdminAnalytics;
