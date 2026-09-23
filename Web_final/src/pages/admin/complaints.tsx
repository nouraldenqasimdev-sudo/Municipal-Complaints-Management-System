import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaintService';
import { handleApiError } from '@/utils/errorHandler';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Complaint } from '@/types';
import api from '@/services/api';
import { useRouter } from 'next/router';

export default function AdminComplaints() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [municipalityStaff, setMunicipalityStaff] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    municipality_id: ''
  });
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [municipalitiesByGovernorate, setMunicipalitiesByGovernorate] = useState<{ [key: string]: any[] }>({});
  const [assignData, setAssignData] = useState({
    assigned_to: '',
    priority: '',
    comment: ''
  });

  useEffect(() => {
    if (selectedComplaint?.municipality?.id) {
      fetchMunicipalityStaff(selectedComplaint.municipality.id);
    }
  }, [selectedComplaint]);

  useEffect(() => {
    fetchComplaints();
    fetchMunicipalities();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.municipality_id) params.append('municipality_id', filters.municipality_id);

      const response = await api.get<Complaint[]>(`/reports?${params.toString()}`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('فشل في تحميل الشكاوى');
    } finally {
      setLoading(false);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const response = await api.get('/municipalities');
      const munis = response.data || [];
      setMunicipalities(munis);
      
      const grouped: { [key: string]: any[] } = {};
      munis.forEach((muni: any) => {
        const gov = muni.governorate || 'أخرى';
        if (!grouped[gov]) {
          grouped[gov] = [];
        }
        grouped[gov].push(muni);
      });
      setMunicipalitiesByGovernorate(grouped);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const fetchMunicipalityStaff = async (municipalityId: number) => {
    try {
      const response = await api.get(`/users?municipality_id=${municipalityId}&role=municipality`);
      setMunicipalityStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleAssign = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAssignData({
      assigned_to: '',
      priority: complaint.priority,
      comment: ''
    });
    setShowAssignModal(true);
  };

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await complaintService.update(selectedComplaint.id.toString(), {
        status: 'processing',
        priority: (assignData.priority || selectedComplaint.priority) as any,
        assigned_to: assignData.assigned_to ? parseInt(assignData.assigned_to) : null,
        official_comment: assignData.comment || 'تم إسناد الشكوى للمسؤول'
      });

      toast.success('تم إسناد الشكوى بنجاح');
      setShowAssignModal(false);
      setSelectedComplaint(null);
      setAssignData({ assigned_to: '', priority: '', comment: '' });
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إسناد الشكوى');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await complaintService.updateStatus(id.toString(), newStatus as any, '');
      toast.success('تم تحديث حالة الشكوى');
      fetchComplaints();
    } catch (error) {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشكوى؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    
    try {
      await complaintService.delete(id.toString());
      toast.success('تم حذف الشكوى بنجاح');
      fetchComplaints();
    } catch (error: any) {
      handleApiError(error, router);      
    }
  };

  const columns = [
    {
      header: 'الشكوى',
      accessor: (complaint: Complaint) => (
        <div className="flex items-center gap-4">
          {complaint.images && complaint.images.length > 0 && (
            <img 
              src={complaint.images[0]} 
              alt={complaint.title}
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200"
            />
          )}
          <div>
            <p className="font-cairo font-black text-slate-950 text-sm">{complaint.title}</p>
            <p className="text-xs text-slate-500 font-cairo font-semibold mt-1 line-clamp-1">
              {complaint.description}
            </p>
            <p className="text-xs text-slate-400 font-cairo mt-1">
              {complaint.user?.name || 'مجهول'} • {new Date(complaint.created_at).toLocaleDateString('ar-SY')}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'التصنيف',
      accessor: (complaint: Complaint) => {
        const categoryMap: any = {
          'infrastructure': { name: '🚰 مياه وصرف صحي', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          'electricity': { name: '💡 كهرباء وإنارة', color: 'bg-amber-100 text-amber-700 border-amber-200' },
          'roads': { name: '🛣️ طرق وجسور', color: 'bg-gray-100 text-gray-700 border-gray-200' },
          'sanitation': { name: '🗑️ نظافة ونفايات', color: 'bg-green-100 text-green-700 border-green-200' },
          'building': { name: '🏗️ مخالفات بناء', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        };
        const cat = categoryMap[complaint.category] || { name: '📁 أخرى', color: 'bg-gray-100 text-gray-700 border-gray-200' };
        return (
          <span className={`text-xs font-cairo font-bold px-3 py-1.5 rounded-full border ${cat.color}`}>
            {cat.name}
          </span>
        );
      }
    },
    {
      header: 'الأولوية',
      accessor: (complaint: Complaint) => {
        const priorityColors: any = {
          urgent: 'bg-red-100 text-red-700',
          high: 'bg-orange-100 text-orange-700',
          medium: 'bg-yellow-100 text-yellow-700',
          low: 'bg-green-100 text-green-700'
        };
        return (
          <span className={`text-xs font-cairo font-bold px-3 py-1.5 rounded-full ${priorityColors[complaint.priority] || 'bg-gray-100 text-gray-700'}`}>
            {complaint.priority === 'urgent' ? 'عاجل' : 
             complaint.priority === 'high' ? 'عالية' :
             complaint.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
          </span>
        );
      }
    },
    {
      header: 'الحالة',
      accessor: (complaint: Complaint) => (
        <StatusBadge type="status" value={complaint.status} />
      )
    },
    {
      header: 'البلدية',
      accessor: (complaint: Complaint) => (
        <span className="text-xs font-cairo font-bold text-slate-600">
          {complaint.municipality?.name || 'غير محدد'}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      accessor: (complaint: Complaint) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="!bg-primary/10 !text-primary hover:!bg-primary hover:!text-white"
            onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
            title="عرض التفاصيل"
          >
            👁️
          </Button>
          {complaint.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              className="!bg-blue-50 !text-blue-600 hover:!bg-blue-600 hover:!text-white"
              onClick={() => handleAssign(complaint)}
              title="إسناد للمسؤول"
            >
              📋
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="!bg-red-50 !text-red-600 hover:!bg-red-600 hover:!text-white"
            onClick={() => handleDelete(typeof complaint.id === 'string' ? parseInt(complaint.id) : complaint.id)}
            title="حذف"
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <DashboardHeader
        title="إدارة الشكاوى والبلاغات 📋"
        subtitle="مراقبة وإسناد الشكاوى للمسؤولين المختصين"
      />

      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="الحالة"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'الكل' },
              { value: 'pending', label: 'قيد الانتظار' },
              { value: 'processing', label: 'قيد المعالجة' },
              { value: 'resolved', label: 'تم الحل' },
              { value: 'rejected', label: 'مرفوض' }
            ]}
          />
          <Select
            label="التصنيف"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            options={[
              { value: '', label: 'الكل' },
              { value: 'INFRASTRUCTURE', label: 'البنية التحتية' },
              { value: 'SANITATION', label: 'النظافة' },
              { value: 'OTHER', label: 'أخرى' }
            ]}
          />
          <Select
            label="الأولوية"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            options={[
              { value: '', label: 'الكل' },
              { value: 'urgent', label: 'عاجل' },
              { value: 'high', label: 'عالية' },
              { value: 'medium', label: 'متوسطة' },
              { value: 'low', label: 'منخفضة' }
            ]}
          />
          <Select
            label="البلدية"
            value={filters.municipality_id}
            onChange={(e) => setFilters({ ...filters, municipality_id: e.target.value })}
            options={[
              { value: '', label: 'الكل' },
              ...(() => {
                const options: { value: string; label: string }[] = [];
                Object.keys(municipalitiesByGovernorate).sort().forEach((governorate) => {
                  municipalitiesByGovernorate[governorate]
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                    .forEach((m: any) => {
                      options.push({ 
                        value: m.id.toString(), 
                        label: `${governorate} - ${m.name}` 
                      });
                    });
                });
                return options;
              })()
            ]}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setFilters({ status: '', category: '', priority: '', municipality_id: '' })}
          >
            إعادة تعيين
          </Button>
        </div>
      </Card>

      <Card title="قائمة الشكاوى والبلاغات" noPadding>
        <DataTable
          columns={columns as any}
          data={complaints}
          isLoading={loading}
          emptyMessage="لا توجد شكاوى متاحة"
        />
      </Card>

      
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedComplaint(null);
          setAssignData({ assigned_to: '', priority: '', comment: '' });
        }}
        title="إسناد الشكوى للمسؤول"
        subtitle={`إسناد الشكوى: ${selectedComplaint?.title}`}
      >
        <form onSubmit={submitAssign} className="space-y-6">
          {selectedComplaint?.municipality?.id && (
            <Select
              label="إسناد للموظف"
              value={assignData.assigned_to}
              onChange={(e) => {
                setAssignData({ ...assignData, assigned_to: e.target.value });
                if (e.target.value && selectedComplaint.municipality?.id) {
                  fetchMunicipalityStaff(selectedComplaint.municipality.id);
                }
              }}
              options={[
                { value: '', label: 'اختر الموظف (اختياري)' },
                ...municipalityStaff.map(staff => ({ 
                  value: staff.id.toString(), 
                  label: `${staff.name} - ${staff.email}` 
                }))
              ]}
            />
          )}
          <Select
            label="الأولوية"
            value={assignData.priority}
            onChange={(e) => setAssignData({ ...assignData, priority: e.target.value })}
            options={[
              { value: 'urgent', label: 'عاجل' },
              { value: 'high', label: 'عالية' },
              { value: 'medium', label: 'متوسطة' },
              { value: 'low', label: 'منخفضة' }
            ]}
            required
          />
          <div>
            <label className="block text-sm font-cairo font-bold text-slate-700 mb-2">
              تعليق (اختياري)
            </label>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 font-cairo text-sm"
              rows={4}
              value={assignData.comment}
              onChange={(e) => setAssignData({ ...assignData, comment: e.target.value })}
              placeholder="أضف تعليقاً أو ملاحظات..."
            />
          </div>
          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">
              تأكيد الإسناد
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

