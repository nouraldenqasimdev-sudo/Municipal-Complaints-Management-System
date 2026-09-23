import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { complaintService } from '@/services/complaintService';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Card } from '@/components/ui/Card';

export default function PerformancePage() {
  const [performanceStats, setPerformanceStats] = useState([
    { label: 'إجمالي البلاغات المسندة', value: '0', trend: 'جميع البلاغات', color: 'bg-blue-600', icon: '📈' },
    { label: 'متوسط وقت المعالجة', value: '-', trend: 'وفقاً للمعايير', color: 'bg-primary', icon: '⏱️' },
    { label: 'بلاغات قيد الانتظار', value: '0', trend: 'تتطلب مراجعة', color: 'bg-amber-500', icon: '⏳' },
    { label: 'بلاغات تم حلها', value: '0', trend: 'هذا الشهر', color: 'bg-green-600', icon: '🏆' },
  ]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data = await complaintService.getStats('staff');
        setPerformanceStats([
          { label: 'إجمالي البلاغات المسندة', value: data.assigned_to_me.toString(), trend: 'جميع البلاغات', color: 'bg-blue-600', icon: '📈' },
          { label: 'متوسط وقت المعالجة', value: data.avg_time, trend: 'بناءً على الأداء الفعلي', color: 'bg-primary', icon: '⏱️' },
          { label: 'بلاغات قيد الانتظار', value: data.awaiting.toString(), trend: 'تتطلب مراجعة سريعة', color: 'bg-amber-500', icon: '⏳' },
          { label: 'بلاغات تم حلها', value: data.closed_this_month.toString(), trend: 'إنجاز الشهر الحالي', color: 'bg-green-600', icon: '🏆' },
        ]);
      } catch (error) {
        console.error('Error fetching performance stats:', error);
      }
    };
    fetchPerformance();
  }, []);

  return (
    <DashboardLayout role="municipality">
      <DashboardHeader 
        title="ملف الإنجاز والأداء الحكومي 📊"
        subtitle="تحليل دقيق لكفاءة الاستجابة الميدانية وجودة الخدمات البلدية المقدمة للمواطنين."
      />

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        {performanceStats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <Card title="تطور الأداء العملياتي (6 أشهر)">
          <div className="h-80 bg-gray-50 rounded-[40px] flex items-end justify-between p-10 gap-4 shadow-inner border border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            {[40, 65, 55, 80, 70, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 relative z-10">
                <div className="w-full bg-primary/20 rounded-2xl transition-all duration-700 hover:bg-primary hover:scale-x-110 shadow-sm" style={{ height: `${h}%` }}></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">شهر {i + 1}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
