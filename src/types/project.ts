export type ProjectStatus = 'active' | 'in_review' | 'completed' | 'on_hold';

export type ProjectCategory =
  | 'Enterprise Web Development'
  | 'UI/UX & Product Design'
  | 'Digital Marketing'
  | 'Social Media Management'
  | 'SEO'
  | 'Virtual Assistant'
  | 'AI Automation Suite'
  | 'Brand Identity Strategy'
  | 'Mobile App Development'
  | 'Cloud Infrastructure'
  | (string & {});

export type MilestoneStatus = 'in_progress' | 'in_review' | 'approved' | 'modification_requested';

export interface MilestoneItem {
  id: string;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
  completed?: boolean; // Legacy fallback helper
  clientComment?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  status: ProjectStatus;
  progress: number;
  budget: string;
  spent: string;
  startDate: string;
  dueDate: string;
  milestones: MilestoneItem[];
  deliverables: string[];
  techStack: string[];
  feedbackRating?: number; // 1 to 5
  feedbackComment?: string;
  feedbackSubmittedAt?: string;
  createdAt?: string;
}
