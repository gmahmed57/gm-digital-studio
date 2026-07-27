import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Clock, 
  Users, 
  Plus, 
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function AdminOverview() {
  const [timeFilter, setTimeFilter] = useState('Last 30 days');

  // Inspired by user reference sample 1 metrics
  const metrics = [
    {
      title: 'Total revenue',
      value: '$53,900',
      change: '+12%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'Active Projects',
      value: '95 / 100',
      change: '-10%',
      isPositive: false,
      icon: Briefcase,
    },
    {
      title: 'Total Time Logged',
      value: '1022 /1300 Hrs',
      change: '+8%',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Client Retention',
      value: '101 / 120',
      change: '+2%',
      isPositive: true,
      icon: Users,
    },
  ];

  // Project Summary Table data matching User Sample 1 layout
  const projectSummary = [
    { name: 'Nelsa Web Development', dueDate: '25.01.26', status: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { name: 'Datascale AI App', dueDate: '25.01.26', status: 'Delayed', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-dark-surface dark:text-gray-400' },
    { name: 'Media Channel Branding', dueDate: '25.01.26', status: 'At risk', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
    { name: 'Corlax iOS App Development', dueDate: '25.01.26', status: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { name: 'Website Builder Development', dueDate: '25.01.26', status: 'On going', badgeClass: 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400' },
  ];

  // Progress Bar Distribution Data matching User Sample 1 right chart
  const progressStats = [
    { label: 'Completed', percent: 65, color: 'bg-brand-500' },
    { label: 'On going', percent: 87, color: 'bg-amber-500' },
    { label: 'At risk', percent: 20, color: 'bg-red-500' },
    { label: 'Delayed', percent: 25, color: 'bg-gray-400 dark:bg-gray-600' },
  ];

  return (
    <>
      <SEO
        title="Admin Overview - GM Digital Studio"
        description="Executive agency metrics, client summary, project progress, and financial analytics dashboard."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Studio Executive Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Real-time platform metrics, active client deliverables & financial progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 py-2 pl-4 pr-10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
              >
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <button className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* 4 Metric Overview Cards (Directly matching User Sample 1 Top Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.isPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.change}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
                  <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-1">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: Project Summary Table (Left) + Overall Progress Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Project Summary Card (Matching Sample 1 Left Column) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                Project Summary
              </h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 text-xs font-medium">
                  Filter Project
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 text-xs font-medium">
                  Status
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Project Name</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {projectSummary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                      <td className="py-3.5 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {row.name}
                      </td>
                      <td className="py-3.5 text-gray-500 dark:text-gray-400">{row.dueDate}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold text-[11px] ${row.badgeClass}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Progress Column Bar Visualizer (Matching Sample 1 Right Column) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                Overall Progress
              </h2>
              <span className="text-xs text-gray-500 font-semibold">All Deliverables</span>
            </div>

            {/* Column Bar Visualizer */}
            <div className="h-48 flex items-end gap-4 pt-6 pb-2 px-2 border-b border-gray-100 dark:border-dark-border">
              {progressStats.map((stat, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {stat.percent}%
                  </span>
                  <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 ${stat.color}`}
                      style={{ height: `${stat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Labels below chart */}
            <div className="grid grid-cols-4 gap-2 text-center pt-4">
              {progressStats.map((stat, idx) => (
                <div key={idx}>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{stat.percent}%</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Action Footer Card */}
        <div className="p-6 rounded-2xl bg-brand-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-heading font-bold">Ready to onboard a new client project?</h3>
            <p className="text-xs text-white/80 mt-0.5">Generate client credentials, assign milestones, and issue invoice PDF directly.</p>
          </div>
          <button className="py-2.5 px-5 rounded-xl bg-white text-gray-950 font-bold text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-md">
            Provision Client Workspace <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </>
  );
}

export default AdminOverview;
