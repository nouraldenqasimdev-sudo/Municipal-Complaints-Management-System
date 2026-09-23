import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import Link from 'next/link';
import { complaintService } from '@/services/complaintService';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export default function MunicipalityDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState([
    { label: 'شكاوى مسندة إليّ', value: '0', color: 'bg-blue-500', icon: '👤' },
    { label: 'قيد الانتظار', value: '0', color: 'bg-amber-500', icon: '⏳' },
    { label: 'تم إغلاقها (هذا الشهر)', value: '0', color: 'bg-green-500', icon: '✅' },
    { label: 'متوسط وقت الحل', value: '-', color: 'bg-purple-500', icon: '⏱️' },
  ]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await complaintService.getStats('staff');
        setStats([
          { label: 'شكاوى مسندة إليّ', value: statsData.assigned_to_me.toString(), color: 'bg-blue-500', icon: '👤' },
          { label: 'قيد الانتظار', value: statsData.awaiting.toString(), color: 'bg-amber-500', icon: '⏳' },
          { label: 'تم إغلاقها (هذا الشهر)', value: statsData.closed_this_month.toString(), color: 'bg-green-500', icon: '✅' },
          { label: 'متوسط وقت الحل', value: statsData.avg_time, color: 'bg-purple-500', icon: '⏱️' },
        ]);

        const response = await api.get('/reports');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.includes(searchTerm) || c.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      header: 'البلاغ / الموضوع', 
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-black text-primary mb-1">#{item.id}</span>
          <span className="font-black text-gray-800 text-sm group-hover:text-primary transition-colors">{item.title}</span>
        </div>
      )
    },
    { 
      header: 'الأولوية', 
      accessor: (item: any) => <StatusBadge type="priority" value={item.priority} /> 
    },
    { 
      header: 'القسم', 
      accessor: (item: any) => (
        <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          {item.category === 'infrastructure' ? '🚰 مياه وصرف' :
           item.category === 'electricity' ? '💡 كهرباء' :
           item.category === 'roads' ? '🛣️ طرق' :
           item.category === 'sanitation' ? '🗑️ نظافة' :
           item.category === 'building' ? '🏗️ بناء' :
           '📁 أخرى'}
        </span>
      )
    },
    { 
      header: 'الحالة', 
      accessor: (item: any) => <StatusBadge type="status" value={item.status} /> 
    },
    { 
      header: 'تاريخ الورود', 
      accessor: (item: any) => <span className="text-xs text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString('ar-SY')}</span> 
    },
    { 
      header: 'الإجراء', 
      accessor: (item: any) => (
        <Link href={`/municipality/complaints/${item.id}`}>
          <Button variant="outline" size="sm">إدارة</Button>
        </Link>
      )
    }
  ];

  return (
    <DashboardLayout role="municipality">
      <DashboardHeader 
        title={<>مرحباً، {user?.name || 'الموظف المناوب'} 🏛️</>}
        subtitle="لديك اليوم مهام معلقة تتطلب التدخل السريع. تابع مؤشرات الأداء أدناه."
        actions={[
          { label: 'عرض ملف الإنجاز', href: '/municipality/performance', icon: '📊' }
        ]}
      />

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <Card 
        title="مركز معالجة البلاغات الواردة" 
        subtitle="جميع البلاغات في بلديتك (المسندة إليك وغير المسندة)"
        noPadding
        headerAction={
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="بحث سريع برقم البلاغ..." 
                className="pr-12 pl-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold min-w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-6 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="pending">البلاغات الجديدة 🆕</option>
              <option value="processing">قيد التنفيذ 🛠️</option>
              <option value="resolved">تم الحل ✅</option>
            </select>
          </div>
        }
      >
        <DataTable 
          columns={columns as any} 
          data={filteredComplaints} 
          isLoading={loading}
          emptyMessage="لا يوجد بلاغات تطابق البحث حالياً"
        />
      </Card>
    </DashboardLayout>
  );
}
