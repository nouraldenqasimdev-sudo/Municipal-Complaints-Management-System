import api from './api';
import { Complaint, ComplaintStatus } from '@/types';

export const complaintService = {
  getAll: async () => {
    const response = await api.get<Complaint[]>('/reports');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Complaint>(`/reports/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    console.log('Raw data received:', data);
    
    if (data.location_lat === undefined || data.location_lat === null || 
        data.location_lng === undefined || data.location_lng === null) {
      console.error('Missing coordinates:', { lat: data.location_lat, lng: data.location_lng });
      throw new Error('الإحداثيات مطلوبة');
    }

    const lat = Number(data.location_lat);
    const lng = Number(data.location_lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates:', { lat, lng });
      throw new Error('الإحداثيات غير صحيحة');
    }

    const payload = {
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      category: String(data.category || ''),
      priority: data.priority || 'medium',
      location_lat: lat,
      location_lng: lng,
      address: String(data.address || '').trim(),
      municipality_id: Number(data.municipality_id),
      is_anonymous: Boolean(data.is_anonymous || false),
      images: Array.isArray(data.images) ? data.images : []
    };

    if (!payload.title || !payload.description || !payload.category) {
      throw new Error('يرجى ملء جميع الحقول المطلوبة');
    }

    if (!payload.location_lat || !payload.location_lng || isNaN(payload.location_lat) || isNaN(payload.location_lng)) {
      throw new Error('الإحداثيات مطلوبة وصحيحة');
    }

    if (!payload.municipality_id || isNaN(payload.municipality_id)) {
      throw new Error('يرجى اختيار البلدية');
    }

    console.log('=== إرسال طلب API ===');
    console.log('Payload:', {
      ...payload,
      images_count: payload.images.length,
      images_size: payload.images.reduce((total: number, img: string) => total + img.length, 0) / 1024 + ' KB'
    });

    try {
      const response = await api.post<Complaint>('/reports', payload);
      console.log('=== استجابة API ناجحة ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== خطأ في API ===');
      console.error('Error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateStatus: async (id: string, status: ComplaintStatus, comment?: string) => {
    try {
      const payload: any = { 
        status 
      };
      
      if (comment && comment.trim().length > 0) {
        payload.official_comment = comment.trim();
      }
      
      const response = await api.put<Complaint>(`/reports/${id}`, payload);
      return response.data;
    } catch (error: any) {    
      console.error('Error updating complaint status:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Complaint>) => {
    try {
      const payload: any = {};
      
      if (data.status !== undefined) payload.status = data.status;
      if (data.official_comment !== undefined) {
        payload.official_comment = data.official_comment;
      }
      if (data.priority !== undefined) payload.priority = data.priority;
      if (data.assigned_to !== undefined) payload.assigned_to = data.assigned_to;
      
      if (data.title !== undefined && data.title.trim().length > 0) {
        payload.title = data.title.trim();
      }
      if (data.description !== undefined && data.description.trim().length > 0) {
        payload.description = data.description.trim();
      }
      if (data.category !== undefined && data.category.trim().length > 0) {
        payload.category = data.category.trim();
      }
      
      // إضافة الحقول الجديدة للتعديل
      if (data.address !== undefined) {
        payload.address = data.address.trim();
      }
      if (data.location_lat !== undefined && data.location_lng !== undefined) {
        payload.location_lat = Number(data.location_lat);
        payload.location_lng = Number(data.location_lng);
      }
      if (data.images !== undefined && Array.isArray(data.images)) {
        payload.images = data.images;
      }
      
      const response = await api.put<Complaint>(`/reports/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/reports/${id}`);
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  },

  getStats: async (role: string) => {
    const response = await api.get(`/stats/${role}`);
    return response.data;
  },

  getStatsByCategory: async () => {
    const response = await api.get('/stats/reports-category');
    return response.data;
  },

  getReportsForMap: async () => {
    const response = await api.get('/stats/map');
    return response.data;
  },

  getDetailedReport: async () => {
    const response = await api.get('/stats/admin/detailed');
    return response.data;
  }
};
