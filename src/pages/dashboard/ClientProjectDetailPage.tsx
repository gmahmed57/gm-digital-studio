import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { notificationService } from '../../services/notificationService';
import { sendProjectStatusAlertEmail, sendProjectFeedbackAlertEmail } from '../../services/resendService';
import type { ProjectItem, ProjectStatus, MilestoneStatus } from '../../types/project';
import ProjectTimelineBoard from '../../components/dashboard/ProjectTimelineBoard';
import {
  ArrowLeft,
  FolderGit2,
  Building,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Check,
  Star,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';
import SEO from '../../components/common/SEO';


export function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Feedback form state
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackCommentText, setFeedbackCommentText] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string>('');

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await projectService.getProjectById(id);
      setProject(found);
      if (found?.feedbackRating) {
        setSelectedRating(found.feedbackRating);
      }
      if (found?.feedbackComment) {
        setFeedbackCommentText(found.feedbackComment);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (selectedRating < 1 || selectedRating > 5) return;

    setIsSubmittingFeedback(true);
    try {
      const updated = await projectService.submitProjectFeedback(
        project.id,
        selectedRating,
        feedbackCommentText
      );

      if (updated) {
        setProject(updated);
        setFeedbackSuccessMsg('Thank you! Your feedback and star rating have been submitted successfully.');

        // Notify Admin via notification & email
        await notificationService.addNotification({
          title: 'New Project Feedback Received',
          message: `${project.clientCompany} submitted a ${selectedRating}-star rating for "${project.title}".`,
          type: 'system',
          targetRole: 'admin',
          link: '/admin/projects',
        });

        sendProjectFeedbackAlertEmail({
          projectTitle: project.title,
          clientName: project.clientName,
          clientEmail: project.clientEmail,
          rating: selectedRating,
          comment: feedbackCommentText,
        }).catch((err) => console.warn('Feedback alert email notice:', err));
      }
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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

      sendProjectStatusAlertEmail({
        projectTitle: project.title,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        status: project.status,
        milestoneTitle: milestoneTitle,
        milestoneStatus: newStatus,
        notes: comment,
      }).catch((err) => console.warn('Project milestone alert notice:', err));

      setActionSuccessMsg(`Milestone "${milestoneTitle}" status updated to ${newStatus.replace('_', ' ')}.`);
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

            {/* Project Completion Feedback & Star Rating Section */}
            {project.status === 'completed' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-dark-card dark:to-dark-card border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-200/60 dark:border-amber-900/40">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Project Completed!
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                        Official Review
                      </span>
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Rate your experience and leave feedback for GM Digital Studio.
                    </p>
                  </div>
                </div>

                {feedbackSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {feedbackSuccessMsg}
                  </div>
                )}

                {/* If feedback is already submitted */}
                {project.feedbackRating ? (
                  <div className="p-5 rounded-2xl bg-white/80 dark:bg-dark-surface border border-amber-200/80 dark:border-amber-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= project.feedbackRating!
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs font-extrabold text-gray-900 dark:text-white">
                          {project.feedbackRating}/5 Stars
                        </span>
                      </div>
                      {project.feedbackSubmittedAt && (
                        <span className="text-[11px] font-medium text-gray-400">
                          {new Date(project.feedbackSubmittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {project.feedbackComment && (
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-xs text-gray-800 dark:text-gray-200 font-medium italic">
                        "{project.feedbackComment}"
                      </div>
                    )}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Thank you for rating GM Digital Studio! Your review is recorded in our studio telemetry.
                    </p>
                  </div>
                ) : (
                  /* Interactive Feedback Form */
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
                        Select Your Overall Star Rating *
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                star <= (hoverRating || selectedRating)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300 dark:text-gray-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {selectedRating === 5 && '5/5 Excellent!'}
                          {selectedRating === 4 && '4/5 Very Good'}
                          {selectedRating === 3 && '3/5 Good'}
                          {selectedRating === 2 && '2/5 Fair'}
                          {selectedRating === 1 && '1/5 Needs Improvement'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                        Your Feedback / Review Message *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={feedbackCommentText}
                        onChange={(e) => setFeedbackCommentText(e.target.value)}
                        placeholder="Share your experience regarding project execution, milestone deliverables, communication, and overall results..."
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingFeedback || !feedbackCommentText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingFeedback ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Submitting Feedback...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Submit Star Rating & Review
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Interactive Timeline & Roadmap Board */}
            <ProjectTimelineBoard
              milestones={project.milestones}
              startDate={project.startDate}
              dueDate={project.dueDate}
              onMilestoneAction={handleMilestoneAction}
            />


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
