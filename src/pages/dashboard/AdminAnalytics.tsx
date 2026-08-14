import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  Layers,
  Download,
  Loader2,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { invoiceService } from '../../services/invoiceService';
import { clientService } from '../../services/clientService';
import { projectService } from '../../services/projectService';

export function AdminAnalytics() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusPieData, setStatusPieData] = useState<any[]>([]);
  
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeClients: 0,
    activeProjects: 0,
    completedProjects: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const analyticsRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!analyticsRef.current) return;
    setIsExportingPDF(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const element = analyticsRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#090d16' : '#ffffff',
        logging: false,
        windowWidth: 1200,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const marginX = 10;
      const marginY = 10;
      const printWidth = pdfWidth - marginX * 2; // 190mm

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pageCanvasHeight = Math.floor((canvasWidth * (pdfHeight - marginY * 2)) / printWidth);

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvasHeight) {
        const sliceHeight = Math.min(pageCanvasHeight, canvasHeight - renderedHeight);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#090d16' : '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvasWidth,
            sliceHeight,
            0,
            0,
            canvasWidth,
            sliceHeight
          );

          const imgData = pageCanvas.toDataURL('image/png');
          const printHeight = (sliceHeight * printWidth) / canvasWidth;

          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', marginX, marginY, printWidth, printHeight);

          pageIndex++;
        }

        renderedHeight += sliceHeight;
      }

      pdf.save(`GM_Studio_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export Analytics PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoices, clients, projects] = await Promise.all([
          invoiceService.getInvoices(),
          clientService.getClients(),
          projectService.getProjects(),
        ]);

        // --- Metrics Calculation ---
        let totalRev = 0;
        let paidRev = 0;
        let pendingRev = 0;
        let overdueRev = 0;

        invoices.forEach((inv) => {
          const amt = parseFloat(inv.amount.replace(/[^0-9.-]+/g, '')) || 0;
          if (inv.status === 'Paid') {
            totalRev += amt;
            paidRev += amt;
          } else if (inv.status === 'Overdue') {
            overdueRev += amt;
          } else {
            pendingRev += amt;
          }
        });

        const activeClients = clients.filter(c => c.status === 'active').length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;

        setMetrics({
          totalRevenue: totalRev,
          activeClients,
          activeProjects,
          completedProjects,
        });

        // --- Status Pie Data ---
        setStatusPieData([
          { name: 'Paid Revenue', value: paidRev, color: '#10b981' },
          { name: 'Pending Balance', value: pendingRev, color: '#3b82f6' },
          { name: 'Overdue Balance', value: overdueRev, color: '#ef4444' },
        ].filter(d => d.value > 0));

        // --- Category Data ---
        const catMap: Record<string, number> = {};
        projects.forEach(p => {
          catMap[p.category] = (catMap[p.category] || 0) + 1;
        });
        const cData = Object.keys(catMap).map(k => ({
          category: k,
          projects: catMap[k],
        }));
        setCategoryData(cData);

        // --- Revenue Data (Monthly) ---
        // Basic naive implementation: bucket invoices by month
        const monthlyRev: Record<string, number> = {};
        invoices.forEach(inv => {
          if (inv.status === 'Paid') {
            const date = new Date(inv.date);
            const month = date.toLocaleString('default', { month: 'short' });
            const amt = parseFloat(inv.amount.replace(/[^0-9.-]+/g, '')) || 0;
            monthlyRev[month] = (monthlyRev[month] || 0) + amt;
          }
        });

        // Ensure chronological order for a basic year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const rData = months
          .filter(m => monthlyRev[m] !== undefined)
          .map(m => ({
            month: m,
            revenue: monthlyRev[m]
          }));
          
        setRevenueData(rData.length > 0 ? rData : [{ month: 'Current', revenue: totalRev }]);

      } catch (error) {
        console.error("Error fetching analytics data", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Executive Analytics & Telemetry - GM Admin"
        description="Track agency financial performance, monthly revenue trends, project category breakdown, and client growth graphs."
      />

      <div ref={analyticsRef} className="space-y-6 font-sans p-1">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Platform Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Financial telemetry, service category distribution, and growth charts based on real database records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isExportingPDF && (
              <div className="text-right shrink-0 whitespace-nowrap">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 whitespace-nowrap">
                  Live Telemetry Report
                </span>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                  Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              data-html2canvas-ignore="true"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="whitespace-nowrap">Exporting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Export Analytics PDF</span>
                </>
              )}
            </button>
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
              {formatCurrency(metrics.totalRevenue)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active Client Roster
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {metrics.activeClients}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projects In Pipeline
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {metrics.activeProjects}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Completed Projects
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {metrics.completedProjects}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Area Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  Monthly Paid Revenue
                </h3>
                <p className="text-xs text-gray-500 mt-1">Growth trajectory across the fiscal year.</p>
              </div>
            </div>
            <div className="h-72 w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4e89ae" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4e89ae" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4e89ae" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No paid invoices available.</div>
              )}
            </div>
          </div>

          {/* Project Category Distribution Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  Service Category Breakdown
                </h3>
                <p className="text-xs text-gray-500 mt-1">Number of projects per core offering.</p>
              </div>
            </div>
            <div className="h-80 w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 20, left: 95, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis dataKey="category" type="category" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }} dx={-5} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="projects" fill="#4e89ae" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No project data available.</div>
              )}
            </div>
          </div>

          {/* Invoice Status Distribution Pie Chart */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-600" />
                  Invoice Capital Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-1">Real-time status of all issued billing statements.</p>
              </div>
            </div>
            <div className="min-h-[280px] w-full flex flex-col sm:flex-row items-center justify-between gap-6">
              {statusPieData.length > 0 ? (
                <>
                  <div className="w-full sm:flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `$${value.toLocaleString()}`}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-center flex-wrap gap-4 sm:gap-5 pb-2 sm:pb-0">
                    {statusPieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{entry.name}</p>
                          <p className="text-xs text-gray-500">${entry.value.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">No invoice data available.</div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
