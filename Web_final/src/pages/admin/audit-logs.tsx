import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { auditLogService, AuditLog, AuditLogFilters, AuditLogStats } from '@/services/auditLogService';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    per_page: 50
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogService.getAll(filters);
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('فشل في تحميل السجلات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await auditLogService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRestoreUser = async (auditLogId: number) => {
    if (!confirm('هل أنت متأكد من استعادة هذا المستخدم؟')) return;
    
    try {
      await auditLogService.restoreUser(auditLogId);
      toast.success('تم استعادة المستخدم بنجاح');
      fetchLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في استعادة المستخدم');
    }
  };

  const canRestore = (log: AuditLog): boolean => {
    if (log.action !== 'حذف مستخدم') return false;
    if (!log.details) return false;
    
    try {
      const details = JSON.parse(log.details);
      return details.can_restore === true && !details.restored;
    } catch {
      return false;
    }
  };

  const columns = [
    {
      header: 'المستخدم / النظام',
      accessor: (log: AuditLog) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs">
            {log.user?.name ? log.user.name[0] : '🤖'}
          </div>
          <p className="font-black text-gray-900 text-sm tracking-tight">{log.user?.name || 'النظام الرقمي'}</p>
        </div>
      )
    },
    {
      header: 'نوع الإجراء',
      accessor: (log: AuditLog) => (
        <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/5 tracking-tighter">
          {log.action}
        </span>
      )
    },
    {
      header: 'الهدف العملياتي',
      accessor: (log: AuditLog) => <span className="font-mono text-[11px] text-gray-500 font-bold tracking-widest">{log.target}</span>
    },
    {
      header: 'التوقيت الزمني',
      accessor: (log: AuditLog) => <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(log.created_at).toLocaleString('ar-SY')}</span>
    },
    {
      header: 'عنوان الشبكة (IP)',
      accessor: (log: AuditLog) => <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{log.ip_address}</span>
    },
    {
      header: 'الدور الرقابي',
      accessor: (log: AuditLog) => (
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
          log.user?.role === 'admin' ? 'text-purple-600' : 'text-gray-400'
        }`}>
          {log.user?.role === 'admin' ? 'مدير نظام' : log.user?.role || 'SYSTEM'}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      accessor: (log: AuditLog) => (
        <div className="flex gap-2">
          {canRestore(log) && (
            <Button
              variant="ghost"
              size="sm"
              className="!bg-green-50 !text-green-600 hover:!bg-green-600 hover:!text-white"
              title="تراجع عن الحذف"
              onClick={() => handleRestoreUser(log.id)}
            >
              ↺ استعادة
            </Button>
          )}
          {log.details && (() => {
            try {
              const details = JSON.parse(log.details);
              if (details.restored) {
                return (
                  <span className="text-xs text-green-600 font-bold px-2 py-1 bg-green-50 rounded-lg">
                    ✓ تم الاستعادة
                  </span>
                );
              }
            } catch {}
            return null;
          })()}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <DashboardHeader 
        title="سجل الأنشطة والرقابة السيادية 🛡️"
        subtitle="تتبع كامل لكافة التحركات والإجراءات المتخذة على النظام لضمان أعلى مستويات النزاهة والشفافية."
      />

      
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          <StatCard 
            label="إجمالي السجلات" 
            value={stats.total.toLocaleString()} 
            trend="" 
            color="bg-primary" 
            icon="📊" 
          />
          <StatCard 
            label="اليوم" 
            value={stats.today.toLocaleString()} 
            trend="" 
            color="bg-green-600" 
            icon="📅" 
          />
          <StatCard 
            label="هذا الأسبوع" 
            value={stats.this_week.toLocaleString()} 
            trend="" 
            color="bg-blue-600" 
            icon="📆" 
          />
          <StatCard 
            label="هذا الشهر" 
            value={stats.this_month.toLocaleString()} 
            trend="" 
            color="bg-purple-600" 
            icon="🗓️" 
          />
        </div>
      )}

      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="البحث بالإجراء"
            placeholder="البحث..."
            value={filters.action || ''}
            onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
          />
          <Input
            label="من تاريخ"
            type="date"
            value={filters.from_date || ''}
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={filters.to_date || ''}
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })}
          />
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => setFilters({ per_page: 50 })}
              className="w-full"
            >
              إعادة تعيين
            </Button>
          </div>
        </div>
      </Card>

      <Card title="سجل العمليات الرقمي (Audit Logs)" noPadding>
        <DataTable 
          columns={columns as any} 
          data={logs} 
          isLoading={loading}
          emptyMessage="لا توجد أنشطة مسجلة في النظام حالياً"
        />
        
        {!loading && logs.length > 0 && (
          <div className="p-10 bg-gray-50/30 text-center border-t border-gray-50">
            <button className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              تحميل سجل الأرشيف الكامل (JSON/CSV)
            </button>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
