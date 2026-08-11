import { invoiceService } from './invoiceService';
import { projectService } from './projectService';
import { clientService } from './clientService';
import { activityLogService } from './activityLogService';

export interface FinancialReportData {
  totalInvoices: number;
  totalBilled: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalTax: number;
  totalTips: number;
  avgInvoiceValue: number;
  paymentMethodBreakdown: Record<string, number>;
}

export interface ProjectReportData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  avgProgress: number;
  categoryBreakdown: Record<string, number>;
  totalMilestones: number;
  completedMilestones: number;
}

export interface ClientReportData {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  packageBreakdown: Record<string, number>;
  avgRevenuePerClient: number;
}

export interface ClientToolActivityDetail {
  user_name: string;
  user_email: string;
  tool_id: string;
  action: string;
  details: string;
  created_at: string;
}

export interface ToolsUsageReportData {
  totalLaunches: number;
  totalExecutions: number;
  toolUsageBreakdown: Record<string, number>;
  clientActivityList: ClientToolActivityDetail[];
}

export const reportingService = {
  /**
   * Aggregate Financial Performance Telemetry
   */
  async getFinancialReport(): Promise<FinancialReportData> {
    try {
      const invoices = await invoiceService.getInvoices();
      let totalBilled = 0;
      let paidAmount = 0;
      let pendingAmount = 0;
      let overdueAmount = 0;
      let totalTax = 0;
      let totalTips = 0;

      const paymentMethodBreakdown: Record<string, number> = {};

      invoices.forEach((inv) => {
        const val = inv.total || (parseFloat((inv.amount || '0').replace(/[^0-9.]/g, '')) || 0);
        totalBilled += val;

        if (inv.status === 'Paid') {
          paidAmount += val;
        } else if (inv.status === 'Overdue') {
          overdueAmount += val;
        } else {
          pendingAmount += val;
        }

        totalTax += inv.tax || 0;
        totalTips += inv.tipAmount || 0;

        if (inv.paymentMethod) {
          const pm = inv.paymentMethod;
          paymentMethodBreakdown[pm] = (paymentMethodBreakdown[pm] || 0) + 1;
        }
      });

      const avgInvoiceValue = invoices.length > 0 ? totalBilled / invoices.length : 0;

      return {
        totalInvoices: invoices.length,
        totalBilled,
        paidAmount,
        pendingAmount,
        overdueAmount,
        totalTax,
        totalTips,
        avgInvoiceValue,
        paymentMethodBreakdown
      };
    } catch {
      return {
        totalInvoices: 0,
        totalBilled: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalTax: 0,
        totalTips: 0,
        avgInvoiceValue: 0,
        paymentMethodBreakdown: {}
      };
    }
  },

  /**
   * Aggregate Project Operational Telemetry
   */
  async getProjectReport(): Promise<ProjectReportData> {
    try {
      const projects = await projectService.getProjects();
      let activeProjects = 0;
      let completedProjects = 0;
      let onHoldProjects = 0;
      let totalProgressSum = 0;

      const categoryBreakdown: Record<string, number> = {};
      let totalMilestones = 0;
      let completedMilestones = 0;

      projects.forEach((p) => {
        if (p.status === 'completed') completedProjects++;
        else if (p.status === 'on_hold') onHoldProjects++;
        else activeProjects++;

        totalProgressSum += p.progress || 0;

        const cat = p.category || 'General';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

        if (p.milestones && Array.isArray(p.milestones)) {
          totalMilestones += p.milestones.length;
          completedMilestones += p.milestones.filter((m) => m.completed || m.status === 'approved').length;
        }
      });

      const avgProgress = projects.length > 0 ? Math.round(totalProgressSum / projects.length) : 0;

      return {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        onHoldProjects,
        avgProgress,
        categoryBreakdown,
        totalMilestones,
        completedMilestones
      };
    } catch {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        onHoldProjects: 0,
        avgProgress: 0,
        categoryBreakdown: {},
        totalMilestones: 0,
        completedMilestones: 0
      };
    }
  },

  /**
   * Aggregate Client Health Telemetry
   */
  async getClientReport(): Promise<ClientReportData> {
    try {
      const clients = await clientService.getClients();
      let activeClients = 0;
      let inactiveClients = 0;
      const packageBreakdown: Record<string, number> = {};
      let totalRevenueSum = 0;

      clients.forEach((c) => {
        if (c.status === 'active') activeClients++;
        else inactiveClients++;

        const pkg = c.assignedPackage || 'Custom Enterprise';
        packageBreakdown[pkg] = (packageBreakdown[pkg] || 0) + 1;

        const billedVal = parseFloat((c.totalBilled || '0').replace(/[^0-9.]/g, '')) || 0;
        totalRevenueSum += billedVal;
      });

      const avgRevenuePerClient = clients.length > 0 ? totalRevenueSum / clients.length : 0;

      return {
        totalClients: clients.length,
        activeClients,
        inactiveClients,
        packageBreakdown,
        avgRevenuePerClient
      };
    } catch {
      return {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        packageBreakdown: {},
        avgRevenuePerClient: 0
      };
    }
  },

  /**
   * Aggregate SaaS Studio Tools Usage Telemetry
   */
  async getToolsUsageReport(): Promise<ToolsUsageReportData> {
    try {
      const logs = await activityLogService.getActivityLogs({ entity_type: 'tools', limit: 500 });
      let totalLaunches = 0;
      let totalExecutions = 0;
      const toolUsageBreakdown: Record<string, number> = {};
      const clientActivityList: ClientToolActivityDetail[] = [];

      logs.forEach((log) => {
        if (log.action === 'TOOL_LAUNCHED') totalLaunches++;
        if (log.action === 'TOOL_EXECUTED') totalExecutions++;

        const toolId = log.entity_id || 'general-tool';
        toolUsageBreakdown[toolId] = (toolUsageBreakdown[toolId] || 0) + 1;

        clientActivityList.push({
          user_name: log.user_name || 'Client User',
          user_email: log.user_email || 'client@company.com',
          tool_id: toolId,
          action: log.action,
          details: log.details || '',
          created_at: log.created_at || new Date().toISOString()
        });
      });

      return {
        totalLaunches,
        totalExecutions,
        toolUsageBreakdown,
        clientActivityList
      };
    } catch {
      return {
        totalLaunches: 0,
        totalExecutions: 0,
        toolUsageBreakdown: {},
        clientActivityList: []
      };
    }
  },

  /**
   * Export Full Summary & Itemized Systems Report to CSV File
   */
  async exportFullCSVReport(): Promise<void> {
    const fin = await reportingService.getFinancialReport();
    const proj = await reportingService.getProjectReport();
    const client = await reportingService.getClientReport();
    const tools = await reportingService.getToolsUsageReport();

    const allInvoices = await invoiceService.getInvoices();
    const allProjects = await projectService.getProjects();
    const allClients = await clientService.getClients();
    const allLogs = await activityLogService.getActivityLogs();

    const escape = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const lines: string[] = [];

    // Title & Header
    lines.push([escape('GM DIGITAL STUDIO — EXECUTIVE FULL SYSTEM AUDIT REPORT')].join(','));
    lines.push([escape('Generated At'), escape(new Date().toLocaleString())].join(','));
    lines.push('');

    // 1. FINANCIAL SUMMARY & ITEMIZATION
    lines.push([escape('=== 1. FINANCIAL TELEMETRY SUMMARY ===')].join(','));
    lines.push([escape('Total Invoices Issued'), escape(fin.totalInvoices)].join(','));
    lines.push([escape('Total Billed Revenue ($)'), escape(fin.totalBilled)].join(','));
    lines.push([escape('Paid Collected Revenue ($)'), escape(fin.paidAmount)].join(','));
    lines.push([escape('Pending Uncollected Revenue ($)'), escape(fin.pendingAmount)].join(','));
    lines.push([escape('Overdue Revenue ($)'), escape(fin.overdueAmount)].join(','));
    lines.push([escape('Total Tax Collected ($)'), escape(fin.totalTax)].join(','));
    lines.push([escape('Studio Gratuity / Tips ($)'), escape(fin.totalTips)].join(','));
    lines.push([escape('Average Invoice Value ($)'), escape(fin.avgInvoiceValue.toFixed(2))].join(','));
    lines.push('');

    lines.push([escape('--- ITEMIZED INVOICES LIST ---')].join(','));
    lines.push(['Invoice Number', 'Client Name', 'Client Email', 'Amount ($)', 'Status', 'Issue Date', 'Due Date', 'Paid Date', 'Description'].map(escape).join(','));
    allInvoices.forEach((inv) => {
      lines.push([
        inv.invoiceNumber,
        inv.clientName,
        inv.clientEmail,
        inv.amount,
        inv.status,
        inv.date,
        inv.dueDate,
        inv.paymentSubmittedAt || 'N/A',
        inv.description
      ].map(escape).join(','));
    });
    lines.push('');

    // 2. PROJECT OPERATIONS & ITEMIZATION
    lines.push([escape('=== 2. PROJECT OPERATIONS SUMMARY ===')].join(','));
    lines.push([escape('Total Projects'), escape(proj.totalProjects)].join(','));
    lines.push([escape('Active Projects'), escape(proj.activeProjects)].join(','));
    lines.push([escape('Completed Projects'), escape(proj.completedProjects)].join(','));
    lines.push([escape('On-Hold Projects'), escape(proj.onHoldProjects)].join(','));
    lines.push([escape('Average Progress (%)'), escape(`${proj.avgProgress}%`)].join(','));
    lines.push('');

    lines.push([escape('--- ITEMIZED PROJECTS LIST ---')].join(','));
    lines.push(['Project Name', 'Client Name', 'Category', 'Budget ($)', 'Progress (%)', 'Status', 'Due Date', 'Milestones Count'].map(escape).join(','));
    allProjects.forEach((p) => {
      lines.push([
        p.title,
        p.clientName,
        p.category,
        p.budget || 'N/A',
        `${p.progress}%`,
        p.status,
        p.dueDate || 'N/A',
        p.milestones ? p.milestones.length : 0
      ].map(escape).join(','));
    });
    lines.push('');

    // 3. CLIENT DIRECTORY & ITEMIZATION
    lines.push([escape('=== 3. CLIENT DIRECTORY SUMMARY ===')].join(','));
    lines.push([escape('Total Clients'), escape(client.totalClients)].join(','));
    lines.push([escape('Active Clients'), escape(client.activeClients)].join(','));
    lines.push([escape('Inactive Clients'), escape(client.inactiveClients)].join(','));
    lines.push('');

    lines.push([escape('--- ITEMIZED CLIENTS LIST ---')].join(','));
    lines.push(['Client Name', 'Company', 'Email', 'Phone', 'Status', 'Joined Date'].map(escape).join(','));
    allClients.forEach((c) => {
      lines.push([
        c.fullName,
        c.company,
        c.email,
        c.phone || 'N/A',
        c.status,
        c.joinedDate || 'N/A'
      ].map(escape).join(','));
    });
    lines.push('');

    // 4. STUDIO AUDIT ACTIVITY LOGS
    lines.push([escape('=== 4. STUDIO AUDIT ACTIVITY LOGS ===')].join(','));
    lines.push(['Log ID', 'Timestamp', 'User Name', 'User Email', 'Role', 'Action', 'Entity Type', 'Details'].map(escape).join(','));
    allLogs.forEach((l) => {
      lines.push([
        l.id,
        new Date(l.created_at).toLocaleString(),
        l.user_name,
        l.user_email,
        l.user_role,
        l.action,
        l.entity_type,
        l.details
      ].map(escape).join(','));
    });
    lines.push('');

    // 5. SAAS STUDIO TOOLS TELEMETRY
    lines.push([escape('=== 5. SAAS STUDIO TOOLS TELEMETRY ===')].join(','));
    lines.push([escape('Total Tool Workspaces Launched'), escape(tools.totalLaunches)].join(','));
    lines.push([escape('Total Tool Executions'), escape(tools.totalExecutions)].join(','));
    Object.entries(tools.toolUsageBreakdown).forEach(([tId, count]) => {
      lines.push([escape(`Tool [${tId}]`), escape(count)].join(','));
    });

    const csvData = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GM_Studio_Executive_Full_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
