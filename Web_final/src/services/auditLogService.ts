import api from './api';

export interface AuditLog {
  id: number;
  user?: {
    id: number;
    name: string;
    role: string;
  };
  action: string;
  target: string;
  details?: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: number;
  action?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
}

export interface AuditLogStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  top_actions: Array<{ action: string; count: number }>;
  top_users: Array<{ user_id: number; count: number; user?: { id: number; name: string } }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const auditLogService = {
  getAll: async (filters?: AuditLogFilters) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action) params.append('action', filters.action);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get<AuditLog[] | PaginatedResponse<AuditLog>>(`/audit-logs?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<AuditLogStats>('/audit-logs/stats');
    return response.data;
  },

  restoreUser: async (auditLogId: number) => {
    const response = await api.post(`/audit-logs/${auditLogId}/restore-user`);
    return response.data;
  }
};

