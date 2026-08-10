export type EntityType = 
  | 'auth' 
  | 'project' 
  | 'invoice' 
  | 'file' 
  | 'message' 
  | 'email' 
  | 'client' 
  | 'system'
  | 'cms'
  | 'tools';

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: EntityType;
  entity_id?: string;
  details: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateActivityLogDTO {
  user_id?: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: EntityType;
  entity_id?: string;
  details: string;
  metadata?: Record<string, any>;
}
