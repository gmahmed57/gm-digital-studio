import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import type { ProjectItem, ProjectStatus } from '../../types/project';
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  Edit,
  Trash2,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import ConfirmModal from '../../components/common/ConfirmModal';

export function Projects() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deletingProject, setDeletingProject] = useState<{ id: string; title: string } | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      if (isAdmin) {
        setProjects(data);
      } else {
        const clientProjects = data.filter(
          (p) => p.clientEmail.toLowerCase() === user?.email?.toLowerCase()
        );
        setProjects(clientProjects);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [isAdmin, user]);

  const handleDelete = async (id: string, title: string) => {
    setDeletingProject({ id, title });
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    const updated = await projectService.deleteProject(deletingProject.id);
    if (isAdmin) {
      setProjects(updated);
    } else {
      setProjects(updated.filter((p) => p.clientEmail.toLowerCase() === user?.email?.toLowerCase()));
    }
    setDeletingProject(null);
  };

  const getEffectiveStatus = (proj: ProjectItem): ProjectStatus => {
    return proj.status || 'active';
  };

  // Filter projects by search term & status
  const filteredProjects = projects.filter((project) => {
    const effectiveStatus = getEffectiveStatus(project);
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || effectiveStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = projects.length;
  const activeCount = projects.filter((p) => getEffectiveStatus(p) === 'active').length;
  const reviewCount = projects.filter((p) => getEffectiveStatus(p) === 'in_review').length;
  const completedCount = projects.filter((p) => getEffectiveStatus(p) === 'completed').length;

  const statusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Active Development
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Client Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <AlertCircle className="w-3.5 h-3.5" /> On Hold
          </span>
        );
    }
  };

  return (
    <>
      <SEO
        title={isAdmin ? 'Project Directory - GM Admin' : 'My Projects - Client Portal'}
        description="Track active agency deliverables, milestones, completion timelines, and project status."
      />

      <div className="space-y-6 font-sans">

        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Project Directory' : 'My Assigned Projects'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAdmin
                ? 'Manage active studio client builds, milestone progress, and budget tracking.'
                : 'Track your ongoing project milestones, timelines, and deliverables.'}
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/projects/edit/new"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </Link>
          )}
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Projects
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {totalCount}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active Development
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {activeCount}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                In Client Review
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {reviewCount}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Completed
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              {completedCount}
            </p>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'active', label: 'Active' },
              { id: 'in_review', label: 'In Review' },
              { id: 'completed', label: 'Completed' },
              { id: 'on_hold', label: 'On Hold' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedStatus === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAdmin ? 'Search projects or clients...' : 'Search projects...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-xs transition-all"
            />
          </div>
        </div>

        {/* Projects Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-semibold text-sm">
            Loading project data...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Projects Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchTerm
                ? 'No project records matched your search query.'
                : 'There are no active projects registered in this view.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => {
              const effectiveStatus = getEffectiveStatus(proj);
              const approvedMilestones = proj.milestones.filter((m) => m.status === 'approved' || m.completed).length;
              const computedProgress = proj.milestones.length > 0
                ? Math.round((approvedMilestones / proj.milestones.length) * 100)
                : proj.progress;

              return (
                <div
                  key={proj.id}
                  onClick={() => !isAdmin && navigate(`/client/projects/view/${proj.id}`)}
                  className={`p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${!isAdmin ? 'cursor-pointer hover:border-brand-500/50' : ''
                    }`}
                >
                  <div className="space-y-4">
                    {/* Status Badge & Actions Header */}
                    <div className="flex items-center justify-between">
                      {statusBadge(effectiveStatus)}

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/projects/edit/${proj.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(proj.id, proj.title);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title & Category */}
                    <div>
                      <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                        {proj.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Assigned Client Info */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {proj.clientCompany}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {proj.clientName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="text-brand-600 dark:text-brand-400">{computedProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all duration-500"
                          style={{ width: `${computedProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                        <span>Milestones: {approvedMilestones} of {proj.milestones.length} done</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due {proj.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Budget & View Details */}
                  <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Budget
                      </span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        {proj.budget.replace('$', '')}
                      </p>
                    </div>

                    {isAdmin ? (
                      <Link
                        to={`/admin/projects/edit/${proj.id}`}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
                      >
                        Edit Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/client/projects/view/${proj.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        View Full Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={Boolean(deletingProject)}
        title="Delete Client Project"
        message={deletingProject ? `Are you sure you want to permanently delete project "${deletingProject.title}"? This action cannot be undone.` : ''}
        confirmText="Permanently Delete Project"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteProject}
        onClose={() => setDeletingProject(null)}
      />
    </>
  );
}

export default Projects;
