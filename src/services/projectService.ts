import type { ProjectItem, ProjectStatus, MilestoneItem, MilestoneStatus } from '../types/project';
import { supabase } from './supabase';

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
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error('Supabase select projects error:', error.message);
      throw error;
    }

    if (data) {
      return data.map((row: any) => {
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
    }
    
    return [];
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<ProjectItem | null> => {
    const projects = await projectService.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  // Save or update project
  saveProject: async (project: Partial<ProjectItem>): Promise<ProjectItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    let targetItem: ProjectItem;

    if (project.id && project.id !== 'new') {
      const existing = await projectService.getProjects();
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
    }

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

    const { error } = await supabase.from('projects').upsert(dbPayload);
    if (error) throw error;

    return await projectService.getProjects();
  },

  // Update specific milestone status & comment
  updateMilestoneStatus: async (
    projectId: string,
    milestoneId: string,
    newStatus: MilestoneStatus,
    clientComment?: string
  ): Promise<ProjectItem | null> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const existing = await projectService.getProjects();
    const project = existing.find((p) => p.id === projectId);
    
    if (!project) return null;

    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            status: newStatus,
            completed: newStatus === 'approved',
            clientComment: clientComment !== undefined ? clientComment : m.clientComment,
          }
        : m
    );

    const metrics = projectService.computeProjectMetrics(updatedMilestones, project.status);

    const updatedProject = {
      ...project,
      milestones: metrics.milestones,
      progress: metrics.progress,
      status: metrics.status,
    };

    const dbPayload = {
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      category: updatedProject.category,
      client_id: updatedProject.clientId,
      client_name: updatedProject.clientName,
      client_company: updatedProject.clientCompany,
      client_email: updatedProject.clientEmail,
      status: updatedProject.status,
      progress: updatedProject.progress,
      budget: updatedProject.budget,
      spent: updatedProject.spent,
      start_date: updatedProject.startDate,
      due_date: updatedProject.dueDate,
      milestones: updatedProject.milestones,
      deliverables: updatedProject.deliverables,
      tech_stack: updatedProject.techStack,
    };
    
    const { error } = await supabase.from('projects').upsert(dbPayload);
    if (error) throw error;

    return updatedProject;
  },

  // Delete project
  deleteProject: async (id: string): Promise<ProjectItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;

    return await projectService.getProjects();
  },
};
