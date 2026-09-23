import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'municipality' | 'admin';
  municipality_id?: number;
  municipality?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  national_id?: string;
  governorate?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'citizen' | 'municipality' | 'admin';
  municipality_id?: number;
  national_id?: string;
  governorate?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: 'citizen' | 'municipality' | 'admin';
  municipality_id?: number;
  is_active?: boolean;
  national_id?: string;
  governorate?: string;
}

export interface UserFilters {
  role?: 'citizen' | 'municipality' | 'admin';
  municipality_id?: number;
  is_active?: boolean;
  search?: string;
}

export const userService = {
  getAll: async (filters?: UserFilters) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.municipality_id) params.append('municipality_id', filters.municipality_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<User[]>(`/users?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserData) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },

  toggleStatus: async (id: number, isActive: boolean) => {
    const response = await api.put<User>(`/users/${id}`, { is_active: isActive });
    return response.data;
  }
};

