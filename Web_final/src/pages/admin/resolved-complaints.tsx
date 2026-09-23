import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { useRouter } from 'next/router';

interface ResolvedComplaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location_lat: number;
  location_lng: number;
  address?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  municipality?: {
    id: number;
    name: string;
  };
  official_comment?: string;
  resolution_time?: string;
}

export default function ResolvedComplaints() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ResolvedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgResolutionTime: '0 يوم'
  });

  useEffect(() => {
    fetchResolvedComplaints();
  }, []);

  const calculateResolutionTime = (created: string, resolved: string): string => {
    const createdDate = new Date(created);
    const resolvedDate = new Date(resolved);
    const diffTime = Math.abs(resolvedDate.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} يوم و ${diffHours} ساعة`;
    } else if (diffHours > 0) {
      return `${diffHours} ساعة و ${diffMinutes} دقيقة`;
    } else {
      return `${diffMinutes} دقيقة`;
    }
  };

  const fetchResolvedComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get<ResolvedComplaint[]>('/reports?status=resolved');
      const resolvedComplaints = response.data.map(complaint => ({
        ...complaint,
        resolution_time: calculateResolutionTime(complaint.created_at, complaint.updated_at)
      }));
      
      setComplaints(resolvedComplaints);
      
      if (resolvedComplaints.length > 0) {
        const totalDays = resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const resolved = new Date(c.updated_at);
          const diffTime = Math.abs(resolved.getTime() - created.getTime());
          return sum + (diffTime / (1000 * 60 * 60 * 24));
        }, 0);
        const avgDays = Math.round((totalDays / resolvedComplaints.length) * 10) / 10;
        setStats({
          total: resolvedComplaints.length,
          avgResolutionTime: `${avgDays} يوم`
        });
      }
    } catch (error) {
      console.error('Error fetching resolved complaints:', error);
      toast.error('فشل في تحميل الشكاوى المحلولة');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'الشكوى',
      accessor: (complaint: ResolvedComplaint) => (
        <div className="flex items-center gap-4">
          {complaint.images && complaint.images.length > 0 && (
            <img 
              src={complaint.images[0]} 
              alt={complaint.title}
              className="w-16 h-16 rounded-xl object-cover border-2 border-green-200"
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
      accessor: (complaint: ResolvedComplaint) => (
        <span className="text-xs font-cairo font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
          {complaint.category}
        </span>
      )
    },
    {
      header: 'البلدية',
      accessor: (complaint: ResolvedComplaint) => (
        <span className="text-xs font-cairo font-bold text-slate-600">
          {complaint.municipality?.name || 'غير محدد'}
        </span>
      )
    },
    {
      header: 'مدة الحل',
      accessor: (complaint: ResolvedComplaint) => (
        <div>
          <p className="text-sm font-cairo font-bold text-green-700">
            ⏱️ {complaint.resolution_time}
          </p>
          <p className="text-xs text-slate-500 font-cairo mt-1">
            تم الحل: {new Date(complaint.updated_at).toLocaleDateString('ar-SY')}
          </p>
        </div>
      )
    },
    {
      header: 'الإجراءات',
      accessor: (complaint: ResolvedComplaint) => (
        <Button
          variant="ghost"
          size="sm"
          className="!bg-primary/10 !text-primary hover:!bg-primary hover:!text-white"
          onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
        >
          عرض التفاصيل
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <DashboardHeader
        title="الشكاوى المحلولة ✅"
        subtitle="عرض جميع الشكاوى التي تم حلها مع المدة الزمنية"
      />

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-cairo font-black text-primary mb-2">
              {stats.total}
            </p>
            <p className="text-sm font-cairo font-bold text-slate-600">
              إجمالي الشكاوى المحلولة
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-cairo font-black text-green-600 mb-2">
              {stats.avgResolutionTime}
            </p>
            <p className="text-sm font-cairo font-bold text-slate-600">
              متوسط مدة الحل
            </p>
          </div>
        </Card>
      </div>

      <Card title="قائمة الشكاوى المحلولة" noPadding>
        <DataTable
          columns={columns as any}
          data={complaints}
          isLoading={loading}
          emptyMessage="لا توجد شكاوى محلولة حالياً"
        />
      </Card>
    </DashboardLayout>
  );
}

