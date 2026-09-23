import api from './api';
import { User, UserRole } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  login: async (phone: string, password: string, role: UserRole) => {
    const response = await api.post<LoginResponse>('/login', { phone, password, role });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post<LoginResponse>('/register', {
      name: userData.full_name,
      email: `${userData.phone}@syria.gov`,
      national_id: userData.id_number,
      phone: userData.phone,
      governorate: userData.governorate,
      password: userData.password,
      password_confirmation: userData.confirm_password
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<User>('/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }
};
