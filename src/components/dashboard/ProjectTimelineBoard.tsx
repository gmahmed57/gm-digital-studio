import React, { useState } from 'react';
import type { MilestoneItem, MilestoneStatus } from '../../types/project';
import {
  Clock,
  RotateCcw,
  Calendar,
  Layers,
  Check,
  MessageSquare
} from 'lucide-react';

interface ProjectTimelineBoardProps {
  milestones: MilestoneItem[];
  startDate?: string;
  dueDate?: string;
  onMilestoneAction?: (
    milestoneId: string,
    milestoneTitle: string,
    newStatus: MilestoneStatus,
    comment?: string
  ) => void;
}

export const ProjectTimelineBoard: React.FC<ProjectTimelineBoardProps> = ({
  milestones,
  onMilestoneAction,
}) => {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState<string>('');

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'modification_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <RotateCcw className="w-3.5 h-3.5" /> Revision Requested
          </span>
        );
      case 'in_progress':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3.5 h-3.5" /> In Development
          </span>
        );
    }
  };

  const approvedCount = milestones.filter((m) => m.status === 'approved' || m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6 font-sans overflow-hidden">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-dark-border">
        <div>
          <h2 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" /> Interactive Project Timeline & Roadmap
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sequential sprint roadmap, milestone phase sign-offs, and target deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-900 dark:text-white">
            {approvedCount} of {milestones.length} Phases Approved ({progressPercent}%)
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Horizontal Progress Bar */}
      {milestones.length > 0 && (
        <div className="hidden md:block py-2 overflow-hidden">
          <div className="relative flex items-center justify-between px-4">
            {/* Connecting Line Background */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 dark:bg-dark-surface -z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
              style={{
                width: milestones.length <= 1
                  ? '0%'
                  : `${Math.min(100, Math.round((approvedCount / milestones.length) * 100))}%`,
                maxWidth: 'calc(100% - 48px)',
              }}
            />

            {/* Nodes */}
            {milestones.map((m, idx) => {
              const isApproved = m.status === 'approved' || m.completed;
              const isInReview = m.status === 'in_review';
              const isRevision = m.status === 'modification_requested';

              return (
                <div key={m.id || idx} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                      isApproved
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : isInReview
                        ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                        : isRevision
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white dark:bg-dark-card text-gray-400 border-gray-300 dark:border-dark-border'
                    }`}
                  >
                    {isApproved ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white mt-2 max-w-[100px] text-center truncate">
                    {m.title}
                  </span>
                  {m.dueDate && (
                    <span className="text-[10px] text-gray-400 font-semibold">{m.dueDate}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vertical Detailed Timeline Cards List */}
      {milestones.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 italic bg-gray-50 dark:bg-dark-surface rounded-2xl">
          No milestone phases currently defined for this project timeline.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200 dark:before:bg-dark-border">
          {milestones.map((m, idx) => {
            const isApproved = m.status === 'approved' || m.completed;
            const isInReview = m.status === 'in_review';
            const isRevision = m.status === 'modification_requested';

            return (
              <div key={m.id || idx} className="relative space-y-3">
                {/* Timeline Dot Connector */}
                <div
                  className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                    isApproved
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isInReview
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : isRevision
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-400'
                  }`}
                >
                  {isApproved ? <Check className="w-3 h-3" /> : idx + 1}
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 space-y-3 hover:border-brand-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(m.status)}
                        {m.dueDate && (
                          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" /> Target Date: {m.dueDate}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">
                        Phase {idx + 1}: {m.title}
                      </h3>
                    </div>

                    {/* Milestone Actions for Client when in_review */}
                    {onMilestoneAction && isInReview && (
                      <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => onMilestoneAction(m.id, m.title, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Phase
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveCommentId(activeCommentId === m.id ? null : m.id)
                          }
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Request Revision
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Client Revision Note Alert */}
                  {m.clientComment && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Client Requested Revision Note:
                      </p>
                      <p className="text-[11px] leading-relaxed">{m.clientComment}</p>
                    </div>
                  )}

                  {/* Revision Request Form Box */}
                  {activeCommentId === m.id && onMilestoneAction && (
                    <div className="pt-3 border-t border-gray-200 dark:border-dark-border space-y-2">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase">
                        Specify Required Changes for Phase "{m.title}"
                      </label>
                      <textarea
                        rows={2}
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder="Detail the revisions needed before final milestone approval..."
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveCommentId(null)}
                          className="px-3 py-1 rounded-xl border border-gray-300 text-xs text-gray-600 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMilestoneAction(m.id, m.title, 'modification_requested', revisionNote);
                            setActiveCommentId(null);
                            setRevisionNote('');
                          }}
                          className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold"
                        >
                          Submit Revision Request
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectTimelineBoard;
