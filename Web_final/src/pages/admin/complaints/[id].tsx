import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Section } from '@/components/ui/Section';
import dynamic from 'next/dynamic';   

const AdminMap = dynamic(() => import('@/components/maps/AdminMap'), { ssr: false });

export default function ComplaintDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolutionTime, setResolutionTime] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const data: any = await complaintService.getById(id as string);
      setComplaint({
        ...data,
        id: typeof data.id === 'string' ? parseInt(data.id) : data.id
      });
      
      if (data.status === 'resolved' && data.updated_at) {
        const created = new Date(data.created_at);
        const resolved = new Date(data.updated_at);
        const diffTime = Math.abs(resolved.getTime() - created.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setResolutionTime(`${diffDays} يوم و ${diffHours} ساعة`);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('فشل في تحميل الشكوى');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 font-cairo font-semibold">جاري التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-12">
          <p className="text-slate-500 font-cairo font-semibold">الشكوى غير موجودة</p>
        </div>
      </DashboardLayout>
    );
  }

  const priorityColors: any = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <DashboardLayout role="admin">
      <DashboardHeader
        title={complaint.title}
        subtitle={`الشكوى رقم #${complaint.id}`}
        actions={[
          { label: 'رجوع', onClick: () => router.back(), primary: false }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {complaint.images && complaint.images.length > 0 && (
            <Card title="الصور المرفقة">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complaint.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl border-2 border-slate-200 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            </Card>
          )}

          
          <Card title="وصف الشكوى">
            <p className="text-slate-700 font-cairo font-semibold leading-relaxed">
              {complaint.description}
            </p>
          </Card>

          
          <Card title="الموقع الجغرافي">
            <div className="h-96 rounded-xl overflow-hidden border-2 border-slate-200">
              <AdminMap reports={[{
                id: complaint.id,
                lat: complaint.location_lat,
                lng: complaint.location_lng,
                title: complaint.title,
                priority: complaint.priority,
                status: complaint.status,
                category: complaint.category
              }]} />
            </div>
            {complaint.address && (
              <p className="mt-4 text-sm text-slate-600 font-cairo font-semibold">
                📍 {complaint.address}
              </p>
            )}
          </Card>

          
          {complaint.official_comment && (
            <Card title="التعليق الرسمي">
              <p className="text-slate-700 font-cairo font-semibold leading-relaxed">
                {complaint.official_comment}
              </p>
            </Card>
          )}
        </div>

        
        <div className="space-y-6">
          
          <Card>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-2 block">
                  الحالة
                </label>
                <StatusBadge type="status" value={complaint.status} />
              </div>
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-2 block">
                  الأولوية
                </label>
                <span className={`inline-block px-4 py-2 rounded-xl text-sm font-cairo font-bold border-2 ${priorityColors[complaint.priority] || 'bg-gray-100 text-gray-700'}`}>
                  {complaint.priority === 'urgent' ? 'عاجل' : 
                   complaint.priority === 'high' ? 'عالية' :
                   complaint.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </span>
              </div>
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-2 block">
                  التصنيف
                </label>
                <span className="text-sm font-cairo font-bold text-slate-700">
                  {complaint.category}
                </span>
              </div>
            </div>
          </Card>

          
          <Card title="معلومات المبلغ">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-1 block">
                  الاسم
                </label>
                <p className="text-sm font-cairo font-bold text-slate-900">
                  {complaint.user?.name || 'مجهول'}
                </p>
              </div>
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-1 block">
                  البريد الإلكتروني
                </label>
                <p className="text-sm font-cairo font-semibold text-slate-600">
                  {complaint.user?.phone || 'غير متوفر'}
                </p>
              </div>
            </div>
          </Card>

          
          <Card title="البلدية المسؤولة">
            <p className="text-sm font-cairo font-bold text-slate-900">
              {complaint.municipality?.name || 'غير محدد'}
            </p>
          </Card>

          
          <Card title="معلومات الوقت">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-1 block">
                  تاريخ الإنشاء
                </label>
                <p className="text-sm font-cairo font-semibold text-slate-600">
                  {new Date(complaint.created_at).toLocaleString('ar-SY')}
                </p>
              </div>
              <div>
                <label className="text-xs font-cairo font-bold text-slate-500 uppercase mb-1 block">
                  آخر تحديث
                </label>
                <p className="text-sm font-cairo font-semibold text-slate-600">
                  {new Date(complaint.updated_at).toLocaleString('ar-SY')}
                </p>
              </div>
              {complaint.status === 'resolved' && resolutionTime && (
                <div>
                  <label className="text-xs font-cairo font-bold text-green-600 uppercase mb-1 block">
                    مدة الحل
                  </label>
                  <p className="text-sm font-cairo font-bold text-green-700">
                    ⏱️ {resolutionTime}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

