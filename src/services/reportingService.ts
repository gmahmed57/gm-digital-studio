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
    } catch (err) {
      console.error('Failed to aggregate financial report:', err);
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
          completedMilestones += p.milestones.filter((m: any) => m.completed || m.status === 'approved').length;
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
    } catch (err) {
      console.error('Failed to aggregate project report:', err);
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
    } catch (err) {
      console.error('Failed to aggregate client report:', err);
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
    } catch (err) {
      console.error('Failed to aggregate tools usage report:', err);
      return {
        totalLaunches: 0,
        totalExecutions: 0,
        toolUsageBreakdown: {},
        clientActivityList: []
      };
    }
  },

  /**
   * Export Full Summary Report to CSV File
   */
  async exportFullCSVReport(): Promise<void> {
    const fin = await reportingService.getFinancialReport();
    const proj = await reportingService.getProjectReport();
    const client = await reportingService.getClientReport();
    const tools = await reportingService.getToolsUsageReport();

    const lines = [
      'GM DIGITAL STUDIO — EXECUTIVE SYSTEM SUMMARY REPORT',
      `Generated At,${new Date().toLocaleString()}`,
      '',
      '--- FINANCIAL TELEMETRY ---',
      `Total Invoices Issued,${fin.totalInvoices}`,
      `Total Billed Revenue,$${fin.totalBilled.toLocaleString()}`,
      `Paid Collected Revenue,$${fin.paidAmount.toLocaleString()}`,
      `Pending Uncollected Revenue,$${fin.pendingAmount.toLocaleString()}`,
      `Overdue Revenue,$${fin.overdueAmount.toLocaleString()}`,
      `Tax Collected,$${fin.totalTax.toLocaleString()}`,
      `Studio Gratuity / Tips,$${fin.totalTips.toLocaleString()}`,
      `Average Invoice Value,$${fin.avgInvoiceValue.toFixed(2)}`,
      '',
      '--- PROJECT OPERATIONS ---',
      `Total Projects,${proj.totalProjects}`,
      `Active Projects,${proj.activeProjects}`,
      `Completed Projects,${proj.completedProjects}`,
      `On-Hold Projects,${proj.onHoldProjects}`,
      `Average Project Completion,${proj.avgProgress}%`,
      `Total Milestones Configured,${proj.totalMilestones}`,
      `Completed Milestones Approved,${proj.completedMilestones}`,
      '',
      '--- CLIENT TELEMETRY ---',
      `Total Clients,${client.totalClients}`,
      `Active Clients,${client.activeClients}`,
      `Inactive Clients,${client.inactiveClients}`,
      `Average Revenue Per Client,$${client.avgRevenuePerClient.toFixed(2)}`,
      '',
      '--- SAAS STUDIO TOOLS TELEMETRY ---',
      `Total Tool Workspaces Launched,${tools.totalLaunches}`,
      `Total Tool Executions,${tools.totalExecutions}`,
    ];

    Object.entries(tools.toolUsageBreakdown).forEach(([tId, count]) => {
      lines.push(`Tool Usage [${tId}],${count}`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GM_Studio_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
