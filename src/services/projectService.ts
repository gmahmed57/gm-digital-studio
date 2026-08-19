import type { ProjectItem, ProjectStatus, MilestoneItem, MilestoneStatus } from '../types/project';
import type { UserProfile } from '../types/auth';
import { supabase } from './supabase';
import { activityLogService } from './activityLogService';

// Helper to normalize milestones and compute progress based on approved milestones
const computeProjectMetrics = (milestones: MilestoneItem[], currentStatus: ProjectStatus) => {
  const normalizedMs = (milestones || []).map((m) => ({
    ...m,
    status: m.status || 'pending',
  }));

  const totalMs = normalizedMs.length;
  const completedMs = normalizedMs.filter((m) => m.status === 'approved').length;
  const computedProgress = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  return {
    progress: computedProgress,
    milestones: normalizedMs,
    status: currentStatus,
  };
};

export const projectService = {
  computeProjectMetrics,

  // Get projects with server-side query isolation for client users
  getProjects: async (user?: UserProfile | null): Promise<ProjectItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized');

    let query = supabase.from('projects').select('*');

    // Enforce server-side query isolation for non-admin client users
    if (user && user.role !== 'admin') {
      const email = user.email ? user.email.toLowerCase().trim() : '';
      const userId = user.id || '';

      const filterConditions: string[] = [];
      if (email) filterConditions.push(`client_email.ilike.%${email}%`, `client_email.eq.${email}`);
      if (userId) filterConditions.push(`client_id.eq.${userId}`);

      if (filterConditions.length > 0) {
        query = query.or(filterConditions.join(','));
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Project Service] Database query error:', error.message);
      return [];
    }

    if (data) {
      return data.map((row: any) => {
        const rawMilestones: MilestoneItem[] = row.milestones || [];
        const metrics = computeProjectMetrics(rawMilestones, row.status as ProjectStatus);

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
          feedbackRating: row.feedbackRating || row.feedback_rating || undefined,
          feedbackComment: row.feedbackComment || row.feedback_comment || undefined,
          feedbackSubmittedAt: row.feedbackSubmittedAt || row.feedback_submitted_at || undefined,
          createdAt: row.created_at || row.createdAt || row.startDate || row.start_date || '',
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
    if (!supabase) throw new Error('Database service is not initialized.');

    let targetItem: ProjectItem;

    if (project.id && project.id !== 'new') {
      const existing = await projectService.getProjects();
      const current = existing.find((p) => p.id === project.id);
      const rawMilestones = project.milestones || current?.milestones || [];
      const metrics = computeProjectMetrics(rawMilestones, project.status || current?.status || 'active');

      targetItem = {
        ...current,
        ...project,
        milestones: metrics.milestones,
        progress: metrics.progress,
        status: metrics.status,
      } as ProjectItem;
    } else {
      const rawMilestones = project.milestones || [];
      const metrics = computeProjectMetrics(rawMilestones, project.status || 'active');

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
      feedback_rating: targetItem.feedbackRating,
      feedback_comment: targetItem.feedbackComment,
      feedback_submitted_at: targetItem.feedbackSubmittedAt,
    };

    const { error } = await supabase.from('projects').upsert(dbPayload);
    if (error) throw error;

    activityLogService.logActivity({
      user_name: targetItem.clientName || 'Studio Admin',
      user_email: targetItem.clientEmail || '',
      user_role: 'admin',
      action: project.id ? 'PROJECT_UPDATED' : 'PROJECT_CREATED',
      entity_type: 'project',
      entity_id: targetItem.id,
      details: `Project "${targetItem.title}" ${project.id ? 'updated' : 'created'} with status ${targetItem.status} (${targetItem.progress}% complete).`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_project_updated'));
    }

    return await projectService.getProjects();
  },

  // Submit Client Project Feedback & Star Rating
  submitProjectFeedback: async (
    projectId: string,
    rating: number,
    comment: string
  ): Promise<ProjectItem | null> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const submittedAt = new Date().toISOString();
    const existing = await projectService.getProjects();
    const current = existing.find((p) => p.id === projectId);

    if (!current) return null;

    const updatedProject: ProjectItem = {
      ...current,
      feedbackRating: rating,
      feedbackComment: comment,
      feedbackSubmittedAt: submittedAt,
    };

    const { error } = await supabase
      .from('projects')
      .update({
        feedback_rating: rating,
        feedback_comment: comment,
        feedback_submitted_at: submittedAt,
      })
      .eq('id', projectId);

    if (error) {
      console.warn('[Project Service] Milestone feedback notice:', error.message);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_project_updated'));
    }

    return updatedProject;
  },

  // Update specific milestone status & comment
  updateMilestoneStatus: async (
    projectId: string,
    milestoneId: string,
    newStatus: MilestoneStatus,
    clientComment?: string
  ): Promise<ProjectItem | null> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const existing = await projectService.getProjects();
    const project = existing.find((p) => p.id === projectId);
    
    if (!project) return null;

    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            status: newStatus,
            clientComment: clientComment !== undefined ? clientComment : m.clientComment,
          }
        : m
    );

    const metrics = computeProjectMetrics(updatedMilestones, project.status);

    const updatedProject = {
      ...project,
      milestones: metrics.milestones,
      progress: metrics.progress,
      status: metrics.status,
    };

    const { error } = await supabase
      .from('projects')
      .update({
        milestones: updatedProject.milestones,
        progress: updatedProject.progress,
        status: updatedProject.status,
      })
      .eq('id', projectId);

    if (error) {
      console.warn('[Project Service] Milestone update notice:', error.message);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_project_updated'));
    }

    return updatedProject;
  },

  // Delete project
  deleteProject: async (id: string): Promise<ProjectItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_project_updated'));
    }

    return await projectService.getProjects();
  },
};
