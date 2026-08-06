import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { invoiceService } from '../../services/invoiceService';
import type { ProjectItem } from '../../types/project';
import type { InvoiceItem } from '../../types/invoice';
import { 
  FolderKanban, 
  Clock, 
  FileText, 
  Download, 
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

import SEO from '../../components/common/SEO';

export function ClientOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [allProjects, allInvoices] = await Promise.all([
          projectService.getProjects(),
          invoiceService.getInvoices(),
        ]);

        const clientEmailLower = user.email.toLowerCase();

        // Filter strictly by authenticated client email
        const userProjects = allProjects.filter(
          (p) => p.clientEmail.toLowerCase() === clientEmailLower
        );
        const userInvoices = allInvoices.filter(
          (i) => i.clientEmail.toLowerCase() === clientEmailLower
        );

        setProjects(userProjects);
        setInvoices(userInvoices);
      } catch (err) {
        console.error('Failed to load client overview data from Supabase backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  // Compute metrics (Active Projects are any project not completed and not on hold)
  const activeProjects = projects.filter(
    (p) => p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'on_hold'
  );
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Pending Verification');
  
  const pendingInvoicesTotal = pendingInvoices.reduce((sum, inv) => {
    const val = parseFloat((inv.amount || '0').replace(/[^0-9.]/g, '')) || inv.total || 0;
    return sum + val;
  }, 0);

  // Total completed vs in-progress milestones
  const totalMilestonesCount = projects.reduce((acc, p) => acc + p.milestones.length, 0);
  const completedMilestonesCount = projects.reduce(
    (acc, p) => acc + p.milestones.filter((m) => m.status === 'approved' || m.completed).length,
    0
  );

  return (
    <>
      <SEO
        title="Client Workspace - GM Digital Studio"
        description="View project status, milestones, pending invoices, and deliverables."
      />

      <div className="space-y-6 font-sans">
        
        {/* Consistent Top Client Header Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName || 'Valued Client'}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Here is your active engineering overview, sprint milestone progress, and billing history for{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {user?.company || projects[0]?.clientCompany || 'Your Organization'}
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/client/messages"
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Support Desk
            </Link>
          </div>
        </div>

        {/* Client Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Projects</span>
              <FolderKanban className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : `${activeProjects.length} Active`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Completed Milestones</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : `${completedMilestonesCount} / ${totalMilestonesCount}`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Invoices</span>
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">
              {loading ? '...' : `$${pendingInvoicesTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>

        {/* Active Projects Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">Active Deliverables</h2>
            <Link to="/client/projects" className="text-xs text-brand-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              View All Projects <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-semibold text-gray-400">
              Fetching assigned deliverables...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center space-y-2">
              <FolderKanban className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Assigned Projects</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You currently have no active project builds registered in your portal. Contact studio support to initialize a project.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => {
                const nextMilestone = project.milestones.find((m) => m.status === 'in_progress' || m.status === 'in_review') || project.milestones[0];
                const isCompleted = project.status === 'completed';
                const isInReview = project.status === 'in_review';
                const isOnHold = project.status === 'on_hold';
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/client/projects/view/${project.id}`)}
                    className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4 hover:shadow-md hover:border-brand-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{project.category}</span>
                        <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white mt-0.5">{project.title}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isInReview
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : isOnHold
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {isCompleted ? 'Completed' : isInReview ? 'In Review' : isOnHold ? 'On Hold' : 'Active'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Overall Progress</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    {nextMilestone && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-xs space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Current Milestone Phase</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{nextMilestone.title}</p>
                        <p className="text-[10px] text-gray-500">Target Delivery Date: {nextMilestone.dueDate || project.dueDate}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoices Summary Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">Recent Invoices & Billing</h2>
            <Link to="/client/invoices" className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:underline">
              Invoice History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs font-semibold text-gray-400">
              Fetching billing statements...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <FileText className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="font-semibold">No Billing Statements Found</p>
              <p className="text-[11px] text-gray-400">There are no billing statements generated for your account yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Invoice ID</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50">
                      <td className="py-3 font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{inv.description}</td>
                      <td className="py-3 font-bold text-gray-900 dark:text-white">{inv.amount}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : inv.status === 'Pending Verification'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link to="/client/invoices" className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-brand-600 inline-block" title="View Invoices">
                          <Download className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default ClientOverview;

