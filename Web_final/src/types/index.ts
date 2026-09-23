export type UserRole = 'citizen' | 'municipality' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  national_id: string;
  phone: string;
  role: UserRole;
  governorate?: string;
  is_active: boolean;
  municipality_id?: number;
  municipality?: {
    id: number;
    name: string;
    governorate?: string;
  };
}

export type ComplaintStatus = 'pending' | 'processing' | 'on-hold' | 'resolved' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Complaint {
  address: string;
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location_lat: number;
  location_lng: number;
  user_id: string;
  municipality_id: number;
  assigned_to?: number | null;
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  };
  municipality?: {
    id: number;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    phone: string;
  };
  is_anonymous: boolean;
  official_comment?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
