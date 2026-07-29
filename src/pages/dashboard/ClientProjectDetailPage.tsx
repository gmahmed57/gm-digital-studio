import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { notificationService } from '../../services/notificationService';
import type { ProjectItem, ProjectStatus, MilestoneStatus } from '../../types/project';
import {
  ArrowLeft,
  FolderGit2,
  Building,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Check,
  RotateCcw,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCommentMilestoneId, setActiveCommentMilestoneId] = useState<string | null>(null);
  const [milestoneComment, setMilestoneComment] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await projectService.getProjectById(id);
      setProject(found);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleMilestoneAction = async (
    milestoneId: string,
    milestoneTitle: string,
    newStatus: MilestoneStatus,
    comment?: string
  ) => {
    if (!project) return;
    const updated = await projectService.updateMilestoneStatus(project.id, milestoneId, newStatus, comment);
    if (updated) {
      setProject(updated);

      let actionLabel = 'updated';
      if (newStatus === 'approved') actionLabel = 'approved';
      if (newStatus === 'modification_requested') actionLabel = 'requested modifications on';
      if (newStatus === 'in_progress') actionLabel = 'disapproved';

      // Explicitly target notification to ADMIN only (targetRole: 'admin')
      await notificationService.addNotification({
        title: `Milestone ${actionLabel.toUpperCase()}`,
        message: `${project.clientCompany} ${actionLabel} "${milestoneTitle}" for project "${project.title}".`,
        type: 'review',
        targetRole: 'admin',
        link: '/admin/projects',
      });

      setActiveCommentMilestoneId(null);
      setMilestoneComment('');
      setActionSuccessMsg(`Milestone "${milestoneTitle}" status updated to ${newStatus.replace('_', ' ')}.`);
    }
  };

  const milestoneStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border">
            In Progress
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'modification_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <RotateCcw className="w-3.5 h-3.5" /> Modifications Requested
          </span>
        );
    }
  };

  const projectStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Active Development
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Client Review Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <AlertCircle className="w-3.5 h-3.5" /> On Hold
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 text-sm font-semibold">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Not Found</h2>
        <Link to="/client/projects" className="text-xs text-brand-600 font-bold hover:underline">
          Return to My Projects
        </Link>
      </div>
    );
  }

  const approvedMilestonesCount = project.milestones.filter((m) => m.status === 'approved').length;

  return (
    <>
      <SEO
        title={`${project.title} - Client Project Workspace`}
        description="Review project progress, milestones, target delivery dates, and deliverable sign-offs."
      />

      <div className="space-y-6 font-sans">
        
        {/* Clean Header Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/client/projects"
              className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs flex-shrink-0"
              title="Back to My Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tight">
                {project.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span className="font-semibold text-brand-600 dark:text-brand-400">{project.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {project.clientCompany}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
            {projectStatusBadge(project.status)}
            <div className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-900 dark:text-white">
              {project.progress}% Done
            </div>
          </div>
        </div>

        {/* Action Success Alert Banner */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Scope & Milestones */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Progress Telemetry Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Project Progress ({approvedMilestonesCount} of {project.milestones.length} Approved)
                </span>
                <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Start Date: {project.startDate}</span>
                <span className="font-bold text-gray-900 dark:text-white">Target Delivery: {project.dueDate}</span>
              </div>
            </div>

            {/* Scope & Overview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-dark-border">
                <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                    Project Scope & Specifications
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Detailed engineering scope and sprint deliverables.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {project.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Per-Milestone Interactive Review Roadmap */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                    Milestones Approval Roadmap
                  </h2>
                  <p className="text-xs text-gray-500">Review, approve, or request modifications per milestone.</p>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-500/10 px-3 py-1 rounded-xl">
                  {approvedMilestonesCount} / {project.milestones.length} Approved
                </span>
              </div>

              <div className="space-y-4">
                {project.milestones.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No milestones defined for this project yet.</p>
                ) : (
                  project.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {milestoneStatusBadge(m.status)}
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due {m.dueDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{m.title}</h4>
                        </div>

                        {/* Milestone Approval Action Buttons (Enabled when in_review) */}
                        {m.status === 'in_review' && (
                          <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => handleMilestoneAction(m.id, m.title, 'approved')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveCommentMilestoneId(
                                  activeCommentMilestoneId === m.id ? null : m.id
                                )
                              }
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Request Modification
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMilestoneAction(m.id, m.title, 'in_progress')}
                              className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Disapprove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display Client Comment if modifications were requested */}
                      {m.clientComment && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Client Modification Note:
                          </p>
                          <p className="text-[11px] leading-relaxed">{m.clientComment}</p>
                        </div>
                      )}

                      {/* Inline Comment Text Area when requesting modification */}
                      {activeCommentMilestoneId === m.id && (
                        <div className="pt-3 border-t border-gray-200 dark:border-dark-border space-y-2">
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase">
                            Specify Required Modifications for "{m.title}"
                          </label>
                          <textarea
                            rows={2}
                            value={milestoneComment}
                            onChange={(e) => setMilestoneComment(e.target.value)}
                            placeholder="Add your revision request details..."
                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveCommentMilestoneId(null)}
                              className="px-3 py-1 rounded-xl border border-gray-300 text-xs text-gray-600 dark:text-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMilestoneAction(
                                  m.id,
                                  m.title,
                                  'modification_requested',
                                  milestoneComment
                                )
                              }
                              className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold"
                            >
                              Submit Revision Request
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Metadata & Deliverables */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Metadata Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Account & Financials
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Client Company</span>
                  <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-brand-600" /> {project.clientCompany}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <span className="text-gray-500">Total Budget</span>
                  <span className="font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {project.budget.replace('$', '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Deliverables Card (Only rendered when real deliverables exist) */}
            {project.deliverables && project.deliverables.length > 0 ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-brand-600" /> Key Deliverables
                </h3>
                <div className="space-y-2">
                  {project.deliverables.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>

        </div>

      </div>
    </>
  );
}

export default ClientProjectDetailPage;
