import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { clientService } from '../../services/clientService';
import { notificationService } from '../../services/notificationService';
import { sendProjectStatusAlertEmail } from '../../services/resendService';
import type { ProjectCategory, ProjectStatus, MilestoneItem, MilestoneStatus } from '../../types/project';
import type { ClientItem } from '../../types/client';
import {
  ArrowLeft,
  FolderGit2,
  Building,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Layers,
  Package,
  MessageSquare,
  Send,
  Star,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function ProjectEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Enterprise Web Development');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [budget, setBudget] = useState('$15,000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [deliverablesText, setDeliverablesText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number | undefined>(undefined);
  const [feedbackComment, setFeedbackComment] = useState<string | undefined>(undefined);
  const [feedbackSubmittedAt, setFeedbackSubmittedAt] = useState<string | undefined>(undefined);

  // Custom Category State
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_project_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');

  const handleAddCustomCategory = () => {
    const trimmed = newCustomCategoryInput.trim();
    if (trimmed) {
      if (!customCategories.includes(trimmed)) {
        const updated = [...customCategories, trimmed];
        setCustomCategories(updated);
        localStorage.setItem('custom_project_categories', JSON.stringify(updated));
      }
      setCategory(trimmed);
      setNewCustomCategoryInput('');
      setIsAddingCustomCategory(false);
    }
  };

  // Client Selection
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Milestones State
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    const initData = async () => {
      const [allClients, allProjects] = await Promise.all([
        clientService.getClients(),
        projectService.getProjects(),
      ]);
      setClientsList(allClients);

      // Extract all unique custom categories stored in Supabase database
      const presetList = [
        'Enterprise Web Development',
        'UI/UX & Product Design',
        'Digital Marketing',
        'Social Media Management',
        'SEO',
        'Virtual Assistant',
        'AI Automation Suite',
        'Brand Identity Strategy',
        'Mobile App Development',
        'Cloud Infrastructure',
      ];
      const dbCustomCategories = Array.from(
        new Set(
          allProjects
            .map((p) => p.category)
            .filter((c): c is string => Boolean(c) && !presetList.includes(c))
        )
      );

      setCustomCategories((prev) => Array.from(new Set([...prev, ...dbCustomCategories])));

      if (isEditing && id) {
        const found = await projectService.getProjectById(id);
        if (found) {
          setTitle(found.title);
          setDescription(found.description);
          setCategory(found.category);
          setStatus(found.status);
          setBudget(found.budget);
          setStartDate(found.startDate);
          setDueDate(found.dueDate);
          setSelectedClientId(found.clientId);
          setMilestones(found.milestones || []);
          setDeliverablesText((found.deliverables || []).join(', '));
          setFeedbackRating(found.feedbackRating);
          setFeedbackComment(found.feedbackComment);
          setFeedbackSubmittedAt(found.feedbackSubmittedAt);
        }
      } else if (allClients.length > 0) {
        setSelectedClientId(allClients[0].id);
      }
    };
    initData();
  }, [id, isEditing]);

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newM: MilestoneItem = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: dueDate,
      status: 'in_progress',
      completed: false,
    };
    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
  };

  const updateMilestoneTitle = (mId: string, newTitle: string) => {
    setMilestones(
      milestones.map((m) => (m.id === mId ? { ...m, title: newTitle } : m))
    );
  };

  const updateMilestoneStatusLocal = (mId: string, newStatus: MilestoneStatus) => {
    setMilestones(
      milestones.map((m) =>
        m.id === mId
          ? {
              ...m,
              status: newStatus,
              completed: newStatus === 'approved',
            }
          : m
      )
    );
  };

  const removeMilestone = (mId: string) => {
    setMilestones(milestones.filter((m) => m.id !== mId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchedClient = clientsList.find((c) => c.id === selectedClientId);

    const approvedCount = milestones.filter((m) => m.status === 'approved').length;
    const computedProgress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

    const parsedDeliverables = deliverablesText
      ? deliverablesText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const targetProjectId = isEditing && id ? id : `proj-${Date.now()}`;

    await projectService.saveProject({
      id: targetProjectId,
      title,
      description,
      category,
      status,
      budget,
      startDate,
      dueDate,
      clientId: matchedClient?.id || 'client-1',
      clientName: matchedClient?.fullName || 'Client User',
      clientCompany: matchedClient?.company || 'Client Company',
      clientEmail: matchedClient?.email || 'client@company.com',
      progress: computedProgress,
      milestones,
      deliverables: parsedDeliverables,
    });

    // Send target live notification to CLIENT whenever Admin updates milestones or project details
    const targetEmail = matchedClient?.email || 'client@company.com';
    const hasInReview = milestones.some((m) => m.status === 'in_review') || status === 'in_review';

    await notificationService.addNotification({
      title: hasInReview ? 'Milestones Submitted for Review' : 'Project Milestones & Progress Updated',
      message: `Admin updated milestone status & progress details for "${title}". Click to review workspace.`,
      type: 'review',
      targetRole: 'client',
      targetEmail: targetEmail,
      link: `/client/projects/view/${targetProjectId}`,
    });

    sendProjectStatusAlertEmail({
      projectTitle: title,
      clientName: matchedClient?.fullName || matchedClient?.company || 'Valued Client',
      clientEmail: targetEmail,
      status: status,
      notes: `Project status updated to ${status.toUpperCase()}. Overall progress: ${computedProgress}%.`,
    }).catch((err) => console.warn('Project update email notice:', err));

    navigate('/admin/projects');
  };

  return (
    <>
      <SEO
        title={isEditing ? `Edit ${title || 'Project'} - GM Admin` : 'Create New Project - GM Admin'}
        description="Configure project details, assign client accounts, set progress milestones, and manage timelines."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/projects"
              className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs"
              title="Back to Project Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
                {isEditing ? `Edit Project: ${title}` : 'Create Studio Project Build'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Assign client accounts, define deliverable categories, and manage completion milestones.
              </p>
            </div>
          </div>

          <button
            type="submit"
            form="project-edit-form"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>

        {/* Project Form Layout */}
        <form id="project-edit-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Core Info & Client Assignment */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
              
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                    Project Overview & Client Assignment
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Primary deliverable details and assigned client organization.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nexus Analytics SaaS Portal"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Assigned Client Company
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all appearance-none"
                      >
                        {clientsList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company} ({c.fullName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Service Category
                      </label>
                      {!isAddingCustomCategory && (
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomCategory(true)}
                          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Custom Category
                        </button>
                      )}
                    </div>

                    {isAddingCustomCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCustomCategoryInput}
                          onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCategory();
                            }
                          }}
                          placeholder="e.g. Blockchain & Web3 Security"
                          className="flex-1 px-3 py-2 rounded-xl border border-brand-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className="px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCustomCategory(false);
                            setNewCustomCategoryInput('');
                          }}
                          className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Layers className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <select
                          value={category}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsAddingCustomCategory(true);
                            } else {
                              setCategory(e.target.value as ProjectCategory);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all appearance-none"
                        >
                          <option value="Enterprise Web Development">Enterprise Web Development</option>
                          <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                          <option value="Digital Marketing">Digital Marketing</option>
                          <option value="Social Media Management">Social Media Management</option>
                          <option value="SEO">SEO</option>
                          <option value="Virtual Assistant">Virtual Assistant</option>
                          <option value="AI Automation Suite">AI Automation Suite</option>
                          <option value="Brand Identity Strategy">Brand Identity Strategy</option>
                          <option value="Mobile App Development">Mobile App Development</option>
                          <option value="Cloud Infrastructure">Cloud Infrastructure</option>

                          {/* Custom Categories */}
                          {customCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}

                          {/* Currently Selected Custom Category if not in presets */}
                          {category &&
                            ![
                              'Enterprise Web Development',
                              'UI/UX & Product Design',
                              'Digital Marketing',
                              'Social Media Management',
                              'SEO',
                              'Virtual Assistant',
                              'AI Automation Suite',
                              'Brand Identity Strategy',
                              'Mobile App Development',
                              'Cloud Infrastructure',
                              ...customCategories,
                            ].includes(category) && (
                              <option value={category}>{category}</option>
                            )}

                          <option value="__add_new__" className="font-bold text-brand-600">
                            + Add New Custom Category...
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Project Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all appearance-none"
                    >
                      <option value="active">Active Development</option>
                      <option value="in_review">In Client Review</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Total Budget
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="$15,000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Target Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Project Deliverables (Comma separated)
                  </label>
                  <div className="relative">
                    <Package className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={deliverablesText}
                      onChange={(e) => setDeliverablesText(e.target.value)}
                      placeholder="e.g. Responsive Web App, REST API Docs, Figma File"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Project Scope & Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe project requirements, tech stack, and key goals..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Milestones & Progress Tracker */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                    Milestones Roadmap
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Re-edit requested modifications, update titles, and submit for review.
                  </p>
                </div>
              </div>

              {/* Add New Milestone */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Database Architecture Migration"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Milestones List with Status Selector & Re-Edit Controls */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {milestones.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-200 dark:border-dark-border rounded-2xl">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">No milestones added yet.</p>
                  </div>
                ) : (
                  milestones.map((m) => {
                    const isModificationRequested = m.status === 'modification_requested';

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl border space-y-3 ${
                          isModificationRequested
                            ? 'border-red-300 bg-red-50/40 dark:bg-red-950/20'
                            : 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50'
                        }`}
                      >
                        {/* Title Editable Input */}
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => updateMilestoneTitle(m.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-brand-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeMilestone(m.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                            title="Remove Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Display Client Revision Note if requested */}
                        {m.clientComment && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-1">
                            <p className="font-bold flex items-center gap-1 text-[11px]">
                              <MessageSquare className="w-3.5 h-3.5 text-red-500" /> Client Revision Feedback:
                            </p>
                            <p className="text-[11px] leading-relaxed">{m.clientComment}</p>
                          </div>
                        )}

                        {/* Status Dropdown & Re-Submit Quick Button */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <label className="text-[11px] font-bold text-gray-500">Status:</label>
                          <div className="flex items-center gap-2">
                            {isModificationRequested && (
                              <button
                                type="button"
                                onClick={() => updateMilestoneStatusLocal(m.id, 'in_review')}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
                                title="Re-submit milestone for client review"
                              >
                                <Send className="w-3 h-3" /> Re-submit for Review
                              </button>
                            )}

                            <select
                              value={m.status || 'in_progress'}
                              onChange={(e) => updateMilestoneStatusLocal(m.id, e.target.value as MilestoneStatus)}
                              className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs font-semibold"
                            >
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">Submit for Client Review</option>
                              <option value="approved">Mark as Approved</option>
                              <option value="modification_requested">Modification Requested</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Submitted Client Feedback & Star Rating Card */}
            {feedbackRating ? (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Client Star Rating & Review
                </h3>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= feedbackRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}
                    />
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-900 dark:text-white">{feedbackRating}/5 Stars</span>
                </div>
                {feedbackComment && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic p-3 rounded-xl bg-white/70 dark:bg-dark-card border border-amber-200/50 dark:border-amber-900/20">
                    "{feedbackComment}"
                  </p>
                )}
                {feedbackSubmittedAt && (
                  <div className="text-[10px] text-gray-400">
                    Submitted on: {new Date(feedbackSubmittedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </form>

      </div>
    </>
  );
}

export default ProjectEditPage;
