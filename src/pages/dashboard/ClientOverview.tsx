import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();

  const activeProjects = [
    {
      title: 'Enterprise AI CRM Platform',
      category: 'Web Dev & AI Automation',
      progress: 78,
      status: 'On Schedule',
      nextMilestone: 'Beta Testing & Supabase Realtime Sync',
      dueDate: 'Aug 14, 2026',
    },
    {
      title: 'Global Brand Identity Refresh',
      category: 'UI/UX & Branding',
      progress: 95,
      status: 'Finalizing Review',
      nextMilestone: 'Design Tokens & Component Library Handoff',
      dueDate: 'Aug 04, 2026',
    },
  ];

  const recentInvoices = [
    { id: 'INV-2026-042', description: 'Sprint 2 Milestone Payment', amount: '$4,500.00', status: 'Paid', date: 'Jul 20, 2026' },
    { id: 'INV-2026-089', description: 'Phase 3 Deliverables & Hosting', amount: '$3,200.00', status: 'Pending', date: 'Jul 27, 2026' },
  ];

  return (
    <>
      <SEO
        title="Client Workspace - GM Digital Studio"
        description="View project status, milestones, pending invoices, and deliverables."
      />

      <div className="space-y-6 font-sans">
        
        {/* Consistent Top Client Header Card (Clean, Professional, Zero Emojis & Badges) */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName || 'Valued Client'}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Here is your active engineering overview, sprint milestone progress, and billing history for <span className="font-semibold text-gray-900 dark:text-white">{user?.company || 'Nexus Tech Global'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="mailto:support@gmdigitalstudio.com"
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Support Desk
            </a>
          </div>
        </div>

        {/* Client Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Projects</span>
              <FolderKanban className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">2 Active</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Time Logged This Month</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">142.5 Hrs</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Invoices</span>
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mt-2">$3,200.00</p>
          </div>
        </div>

        {/* Active Projects Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">Active Deliverables</h2>
            <span className="text-xs text-brand-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              View All <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.map((project, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{project.category}</span>
                    <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white mt-0.5">{project.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[11px] font-bold">
                    {project.status}
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

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-xs space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Next Deliverable Milestone</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{project.nextMilestone}</p>
                  <p className="text-[10px] text-gray-500">Target Delivery Date: {project.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Summary Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">Recent Invoices & Billing</h2>
            <button className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:underline">
              Invoice History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                {recentInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">{inv.id}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{inv.description}</td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">{inv.amount}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-brand-600" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

export default ClientOverview;
