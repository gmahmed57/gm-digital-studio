import type { ProjectItem, ProjectStatus, MilestoneItem, MilestoneStatus } from '../types/project';
import { supabase } from './supabase';

const INITIAL_PROJECTS: ProjectItem[] = [];

const STORAGE_KEY = 'gm_studio_projects_db';

export const projectService = {
  // Helper to normalize milestones and compute progress based on approved milestones
  computeProjectMetrics: (milestones: MilestoneItem[], currentStatus: ProjectStatus) => {
    const normalizedMs = milestones.map((m) => {
      let status: MilestoneStatus = m.status;
      if (!status) {
        status = m.completed ? 'approved' : 'in_progress';
      }
      return {
        ...m,
        status,
        completed: status === 'approved',
      };
    });

    const approvedCount = normalizedMs.filter((m) => m.status === 'approved').length;
    const computedProgress = normalizedMs.length > 0
      ? Math.round((approvedCount / normalizedMs.length) * 100)
      : 0;

    const computedStatus: ProjectStatus = (computedProgress === 100 && normalizedMs.length > 0)
      ? 'completed'
      : currentStatus;

    return {
      milestones: normalizedMs,
      progress: computedProgress,
      status: computedStatus,
    };
  },

  // Get all projects
  getProjects: async (): Promise<ProjectItem[]> => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) {
          console.error('Supabase select projects error:', error.message || error);
        } else if (data && data.length > 0) {
          const normalized: ProjectItem[] = data.map((row: any) => {
            const rawMilestones: MilestoneItem[] = row.milestones || [];
            const metrics = projectService.computeProjectMetrics(rawMilestones, row.status as ProjectStatus);

            return {
              id: row.id,
              title: row.title || 'Untitled Project',
              description: row.description || '',
              category: row.category || 'Enterprise Web Development',
              clientId: row.clientId || row.client_id || '',
              clientName: row.clientName || row.client_name || 'Client User',
              clientCompany: row.clientCompany || row.client_company || 'Client Company',
              clientEmail: row.clientEmail || row.client_email || 'client@company.com',
              status: metrics.status,
              progress: metrics.progress,
              budget: row.budget || '$0',
              spent: row.spent || '$0',
              startDate: row.startDate || row.start_date || '',
              dueDate: row.dueDate || row.due_date || '',
              milestones: metrics.milestones,
              deliverables: row.deliverables || [],
              techStack: row.techStack || row.tech_stack || [],
            };
          });
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Supabase projects fetch failed, using local storage database.', e);
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed: ProjectItem[] = JSON.parse(cached);
        return parsed.map((p) => {
          const metrics = projectService.computeProjectMetrics(p.milestones || [], p.status);
          return {
            ...p,
            status: metrics.status,
            progress: metrics.progress,
            milestones: metrics.milestones,
          };
        });
      } catch (e) {
        // Fallback
      }
    }

    return INITIAL_PROJECTS;
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<ProjectItem | null> => {
    const projects = await projectService.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  // Save or update project
  saveProject: async (project: Partial<ProjectItem>): Promise<ProjectItem[]> => {
    const existing = await projectService.getProjects();
    let updatedList: ProjectItem[];
    let targetItem: ProjectItem;

    if (project.id && project.id !== 'new') {
      const current = existing.find((p) => p.id === project.id);
      const rawMilestones = project.milestones || current?.milestones || [];
      const metrics = projectService.computeProjectMetrics(rawMilestones, project.status || current?.status || 'active');

      targetItem = {
        ...current,
        ...project,
        milestones: metrics.milestones,
        progress: metrics.progress,
        status: metrics.status,
      } as ProjectItem;

      updatedList = existing.map((p) => (p.id === project.id ? targetItem : p));
    } else {
      const rawMilestones = project.milestones || [];
      const metrics = projectService.computeProjectMetrics(rawMilestones, project.status || 'active');

      targetItem = {
        id: `proj-${Date.now()}`,
        title: project.title || 'New Studio Project',
        description: project.description || '',
        category: project.category || 'Enterprise Web Development',
        clientId: project.clientId || 'client-1',
        clientName: project.clientName || 'Client User',
        clientCompany: project.clientCompany || 'Client Company',
        clientEmail: project.clientEmail || 'client@company.com',
        status: metrics.status,
        progress: metrics.progress,
        budget: project.budget || '$10,000',
        spent: project.spent || '$0',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        dueDate: project.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        milestones: metrics.milestones,
        deliverables: project.deliverables !== undefined ? project.deliverables : [],
        techStack: project.techStack !== undefined ? project.techStack : [],
      };
      updatedList = [targetItem, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const dbPayload = {
      id: targetItem.id,
      title: targetItem.title,
      description: targetItem.description,
      category: targetItem.category,
      client_id: targetItem.clientId,
      client_name: targetItem.clientName,
      client_company: targetItem.clientCompany,
      client_email: targetItem.clientEmail,
      status: targetItem.status,
      progress: targetItem.progress,
      budget: targetItem.budget,
      spent: targetItem.spent || '$0',
      start_date: targetItem.startDate,
      due_date: targetItem.dueDate,
      milestones: targetItem.milestones,
      deliverables: targetItem.deliverables,
      tech_stack: targetItem.techStack,
    };

    try {
      if (supabase) {
        await supabase.from('projects').upsert(dbPayload);
      }
    } catch (e) {
      console.warn('Supabase project sync notice:', e);
    }

    return updatedList;
  },

  // Update specific milestone status & comment
  updateMilestoneStatus: async (
    projectId: string,
    milestoneId: string,
    newStatus: MilestoneStatus,
    clientComment?: string
  ): Promise<ProjectItem | null> => {
    const existing = await projectService.getProjects();
    let updatedProject: ProjectItem | null = null;

    const updatedList = existing.map((p) => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                status: newStatus,
                completed: newStatus === 'approved',
                clientComment: clientComment !== undefined ? clientComment : m.clientComment,
              }
            : m
        );

        const metrics = projectService.computeProjectMetrics(updatedMilestones, p.status);

        updatedProject = {
          ...p,
          milestones: metrics.milestones,
          progress: metrics.progress,
          status: metrics.status,
        };
        return updatedProject;
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedProject) {
      try {
        const dbPayload = {
          id: (updatedProject as ProjectItem).id,
          title: (updatedProject as ProjectItem).title,
          description: (updatedProject as ProjectItem).description,
          category: (updatedProject as ProjectItem).category,
          client_id: (updatedProject as ProjectItem).clientId,
          client_name: (updatedProject as ProjectItem).clientName,
          client_company: (updatedProject as ProjectItem).clientCompany,
          client_email: (updatedProject as ProjectItem).clientEmail,
          status: (updatedProject as ProjectItem).status,
          progress: (updatedProject as ProjectItem).progress,
          budget: (updatedProject as ProjectItem).budget,
          spent: (updatedProject as ProjectItem).spent,
          start_date: (updatedProject as ProjectItem).startDate,
          due_date: (updatedProject as ProjectItem).dueDate,
          milestones: (updatedProject as ProjectItem).milestones,
          deliverables: (updatedProject as ProjectItem).deliverables,
          tech_stack: (updatedProject as ProjectItem).techStack,
        };
        await supabase.from('projects').upsert(dbPayload);
      } catch (e) {
        // Ignore
      }
    }

    return updatedProject;
  },

  // Delete project
  deleteProject: async (id: string): Promise<ProjectItem[]> => {
    const existing = await projectService.getProjects();
    const updatedList = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    try {
      if (supabase) {
        await supabase.from('projects').delete().eq('id', id);
      }
    } catch (e) {
      // Ignore
    }

    return updatedList;
  },
};
