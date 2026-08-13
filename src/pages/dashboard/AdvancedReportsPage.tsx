import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { downloadExecutiveReportPDF } from '../../utils/pdfGenerator';
import { 
  reportingService, 
  type FinancialReportData, 
  type ProjectReportData, 
  type ClientReportData,
  type ToolsUsageReportData
} from '../../services/reportingService';
import { 
  BarChart3, 
  DollarSign, 
  Layers, 
  Users, 
  Download, 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  PieChart as PieIcon,
  Loader2,
  Wrench
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export function AdvancedReportsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);
  const [exportingCSV, setExportingCSV] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [financialData, setFinancialData] = useState<FinancialReportData | null>(null);
  const [projectData, setProjectData] = useState<ProjectReportData | null>(null);
  const [clientData, setClientData] = useState<ClientReportData | null>(null);
  const [toolsData, setToolsData] = useState<ToolsUsageReportData | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [fin, proj, cli, tls] = await Promise.all([
        reportingService.getFinancialReport(),
        reportingService.getProjectReport(),
        reportingService.getClientReport(),
        reportingService.getToolsUsageReport()
      ]);
      setFinancialData(fin);
      setProjectData(proj);
      setClientData(cli);
      setToolsData(tls);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await reportingService.exportFullCSVReport();
    } catch (err) {
      console.error('Export CSV failed:', err);
    } finally {
      setExportingCSV(false);
    }
  };

  /**
   * Capture Dashboard Report UI with Recharts graphics & clean 190mm A4 page width fit
   */
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setExportingPDF(true);

    try {
      // Pause slightly so DOM layout expands scroll containers for capture
      await new Promise((resolve) => setTimeout(resolve, 400));

      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // 300 DPI high resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#090d16' : '#ffffff',
        logging: false,
        windowWidth: 1280,
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
      const printWidth = pdfWidth - marginX * 2; // 190mm printable width

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Single page content height in canvas pixels based on printable area
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
        }

        const pageImgData = pageCanvas.toDataURL('image/png');
        const printHeight = (sliceHeight * printWidth) / canvasWidth;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImgData, 'PNG', marginX, marginY, printWidth, printHeight);

        renderedHeight += sliceHeight;
        pageIndex++;
      }

      pdf.save(`GM_Studio_Executive_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      // Fallback vector export
      downloadExecutiveReportPDF(financialData, projectData, clientData, toolsData, timeframe);
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Compiling executive studio reports...</p>
        <p className="text-xs text-gray-400 mt-1">Synchronizing live financial telemetry and client performance analytics...</p>
      </div>
    );
  }

  // Charts Data Prep
  const revenueDistribution = [
    { name: 'Collected', value: financialData?.paidAmount || 0, color: '#10b981' },
    { name: 'Pending', value: financialData?.pendingAmount || 0, color: '#f59e0b' },
    { name: 'Overdue', value: financialData?.overdueAmount || 0, color: '#ef4444' }
  ];

  const projectStatusDistribution = [
    { name: 'Active', count: projectData?.activeProjects || 0, color: '#3b82f6' },
    { name: 'Completed', count: projectData?.completedProjects || 0, color: '#10b981' },
    { name: 'On Hold', count: projectData?.onHoldProjects || 0, color: '#6b7280' }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-extrabold text-gray-900 dark:text-white">
              Advanced Studio Telemetry & Reports
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time financial performance statement, project delivery velocity, and client account health metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Time History</option>
            <option value="year">This Fiscal Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-500' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="px-3.5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {exportingCSV ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={exportingPDF}
            className="px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Printable Report Canvas Area (Captured for PDF Download) */}
      <div ref={reportRef} className="space-y-8 p-4 md:p-6 bg-white dark:bg-dark-bg rounded-2xl border border-gray-200/60 dark:border-dark-border/60">
        
        {/* Report Canvas Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-4">
          <div>
            <h2 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white">GM DIGITAL STUDIO</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Executive Performance & System Telemetry Statement</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20">
              Live Telemetry Report
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Financial Overview Metric Cards */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Financial Performance Telemetry
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                <span>Total Billed Revenue</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                ${financialData?.totalBilled.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Across {financialData?.totalInvoices} issued statements</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                <span>Collected Revenue</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                ${financialData?.paidAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Fully settled client payments</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                <span>Pending / Overdue</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-amber-500 mt-2">
                ${((financialData?.pendingAmount || 0) + (financialData?.overdueAmount || 0)).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Outstanding receivable balance</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                <span>Average Invoice Size</span>
                <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                ${financialData?.avgInvoiceValue.toFixed(0)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Average statement value</p>
            </div>

          </div>
        </div>

        {/* Visual Analytics Charts (Captured into PDF with SVG graphics) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Distribution Chart */}
          <div className="bg-gray-50/50 dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Revenue Settlement Status</h4>
                <p className="text-[11px] text-gray-400">Distribution of collected vs pending receivables</p>
              </div>
              <PieIcon className="w-4 h-4 text-gray-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs mt-2">
              {revenueDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}: ${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status Breakdown Chart */}
          <div className="bg-gray-50/50 dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Project Operational Status</h4>
                <p className="text-[11px] text-gray-400">Active development vs completed client deliverables</p>
              </div>
              <Layers className="w-4 h-4 text-gray-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {projectStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs mt-2">
              <span className="text-gray-500">Average Completion Rate: <strong className="text-brand-500">{projectData?.avgProgress}%</strong></span>
            </div>
          </div>

        </div>

        {/* Project & Client Operational Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Project Operations Card */}
          <div className="bg-gray-50/50 dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" /> Project Delivery Velocity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Total Managed Projects</span>
                <span className="font-bold text-gray-900 dark:text-white">{projectData?.totalProjects}</span>
              </div>
              
              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Active In-Development</span>
                <span className="font-bold text-blue-500">{projectData?.activeProjects}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Completed & Delivered</span>
                <span className="font-bold text-emerald-500">{projectData?.completedProjects}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Total Milestones Configured</span>
                <span className="font-bold text-gray-900 dark:text-white">{projectData?.totalMilestones} ({projectData?.completedMilestones} Approved)</span>
              </div>
            </div>
          </div>

          {/* Client Health & Accounts Card */}
          <div className="bg-gray-50/50 dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Client Account Health
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Total Client Accounts</span>
                <span className="font-bold text-gray-900 dark:text-white">{clientData?.totalClients}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Active Accounts</span>
                <span className="font-bold text-emerald-500">{clientData?.activeClients}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white dark:bg-dark-surface">
                <span className="text-gray-600 dark:text-gray-400">Tax & Tips Received</span>
                <span className="font-bold text-brand-500">${((financialData?.totalTax || 0) + (financialData?.totalTips || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SaaS Studio Tools Telemetry Card */}
          <div className="bg-gray-50/50 dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" /> SaaS Studio Tools Usage Telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200/60 dark:border-dark-border">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Total Workspaces Launched</span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-1 block">{toolsData?.totalLaunches || 0}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200/60 dark:border-dark-border">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Total Tool Executions</span>
                <span className="text-xl font-extrabold text-amber-500 mt-1 block">{toolsData?.totalExecutions || 0}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200/60 dark:border-dark-border">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Active SaaS Tools</span>
                <span className="text-xl font-extrabold text-emerald-500 mt-1 block">5 Modules</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200/60 dark:border-dark-border">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Usage Audit Trail</span>
                <span className="text-xl font-extrabold text-brand-500 mt-1 block">100% DB Logged</span>
              </div>
            </div>

            {toolsData?.toolUsageBreakdown && Object.keys(toolsData.toolUsageBreakdown).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-dark-border space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Usage Count Per Tool</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(toolsData.toolUsageBreakdown).map(([toolId, count]) => (
                      <span key={toolId} className="px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border font-medium text-gray-700 dark:text-gray-300 shadow-xs">
                        <strong className="text-amber-500 capitalize">{toolId.replace('-', ' ')}</strong>: {count} total interaction{count > 1 ? 's' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {toolsData?.clientActivityList && toolsData.clientActivityList.length > 0 && !exportingPDF && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Client Tool Activity Log</p>
                    <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border ${
                      exportingPDF ? 'max-h-none overflow-visible' : 'max-h-64 overflow-y-auto'
                    }`}>
                      {toolsData.clientActivityList.slice(0, 10).map((act, idx) => (
                        <div key={`tool-act-${idx}`} className="p-3 text-xs flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-white truncate">{act.user_name}</span>
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">({act.user_email})</span>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 truncate">{act.details}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              act.action === 'TOOL_EXECUTED'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            }`}>
                              {act.action === 'TOOL_EXECUTED' ? 'Main Execution' : 'Workspace Launch'}
                            </span>
                            <span className="block text-[10px] text-gray-400 mt-1">
                              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
