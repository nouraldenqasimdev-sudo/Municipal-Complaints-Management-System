import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaintService';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const AdminMap = dynamic(() => import('@/components/maps/AdminMap'), { 
  ssr: false,
  loading: () => <div className="h-[450px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">جارٍ تحميل خريطة التحليلات...</div>
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'إجمالي الشكاوى', value: '0', trend: '0%', color: 'bg-primary', icon: '📊' },
    { label: 'شكاوى قيد المراجعة', value: '0', trend: '0%', color: 'bg-amber-600', icon: '⏳' },
    { label: 'متوسط وقت الحل', value: '-', trend: '0%', color: 'bg-green-600', icon: '⏱️' },
    { label: 'معدل رضا المواطنين', value: '0%', trend: '0%', color: 'bg-blue-600', icon: '⭐' },
  ]);
  const [municipalityPerformance, setMunicipalityPerformance] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [mapReports, setMapReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, catData, mapData] = await Promise.all([
          complaintService.getStats('admin'),
          complaintService.getStatsByCategory(),
          complaintService.getReportsForMap()
        ]);

        const totalTrend = statsData.total_trend || 0;
        const underReviewTrend = statsData.under_review_trend || 0;
        
        setStats([
          { 
            label: 'إجمالي الشكاوى', 
            value: statsData.total_reports.toLocaleString(), 
            trend: `${totalTrend >= 0 ? '+' : ''}${totalTrend}%`, 
            color: 'bg-primary', 
            icon: '📊' 
          },
          { 
            label: 'شكاوى قيد المراجعة', 
            value: statsData.under_review.toLocaleString(), 
            trend: `${underReviewTrend >= 0 ? '+' : ''}${underReviewTrend}%`, 
            color: 'bg-amber-600', 
            icon: '⏳' 
          },
          { 
            label: 'متوسط وقت الحل', 
            value: statsData.avg_resolution_time || 'لا توجد بيانات', 
            trend: '-', 
            color: 'bg-green-600', 
            icon: '⏱️' 
          },
          { 
            label: 'معدل رضا المواطنين', 
            value: statsData.satisfaction_rate || '0%', 
            trend: '-', 
            color: 'bg-blue-600', 
            icon: '⭐' 
          },
        ]);
        setMunicipalityPerformance(statsData.municipality_ranking);
        setCategoryStats(catData);
        setMapReports(mapData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role="admin">
      <DashboardHeader 
        title={<>مرحباً، <span className="text-primary">{user?.name || 'مدير النظام'}</span> 🛡️</>}
        subtitle="بيانات الرقابة العامة والتحليل الاستراتيجي لكافة المناطق السورية."
        
      />

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8 sm:mb-10">
        {stats.map((s, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${i * 100}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <Card 
            title="التوزيع الجغرافي للبلاغات" 
            subtitle="Heatmap of citizen reports across the country"
            headerAction={
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-100">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
                 <span className="text-xs font-cairo font-bold text-red-600 uppercase tracking-wider">مباشر (Live)</span>
              </div>
            }
            className="animate-in fade-in slide-in-from-left duration-700"
          >
            <div className="h-[450px] sm:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner hover:border-primary/20 transition-all duration-300 group">
              <AdminMap reports={mapReports} />
            </div>
          </Card>
          
          <Card 
            title="تحليل القطاعات الأكثر بلاغاً"
            className="animate-in fade-in slide-in-from-left duration-700 delay-200"
          >
            <div className="space-y-6">
              {categoryStats.length > 0 ? categoryStats.map((item, idx) => (
                <div key={idx} className="space-y-3 group/item">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-cairo font-bold text-slate-700 uppercase tracking-tight">
                      {item.category === 'infrastructure' ? '🚰 مياه وصرف صحي' :
                       item.category === 'electricity' ? '💡 كهرباء وإنارة' :
                       item.category === 'roads' ? '🛣️ طرق وجسور' :
                       item.category === 'sanitation' ? '🗑️ نظافة ونفايات' :
                       item.category === 'building' ? '🏗️ مخالفات بناء' :
                       '📁 أخرى'}
                    </span>
                    <span className="text-xs font-cairo font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">{item.count} بلاغ</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 group-hover/item:border-primary/30 transition-colors">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-600 shadow-md shadow-primary/20 rounded-full transition-all duration-1000 group-hover/item:shadow-lg group-hover/item:shadow-primary/30" 
                      style={{ width: `${(item.count / (parseInt(stats[0].value.replace(/,/g, '')) || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="font-cairo font-bold text-sm uppercase italic">لا توجد بيانات متاحة للتحليل حالياً</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        
        <div className="space-y-6 sm:space-y-8">
          <Card variant="dark" className="relative overflow-hidden group animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-cairo font-black mb-6 sm:mb-8 flex items-center gap-3 text-white tracking-tightest">
                <span className="text-amber-400 text-2xl sm:text-3xl">🏆</span> 
                <span>ترتيب البلديات المتميزة</span>
              </h3>
              <div className="space-y-5 sm:space-y-6">
                {municipalityPerformance.length > 0 ? municipalityPerformance.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group/item">
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-cairo font-black transition-all duration-300 ${
                        i === 0 
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-110' 
                          : 'bg-white/10 text-white border border-white/20 group-hover/item:scale-105'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm sm:text-base font-cairo font-black tracking-tightest text-white">{m.name}</p>
                        <p className="text-xs text-white/60 font-cairo font-semibold mt-1">تم الحل: {m.resolved} / {m.total}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-cairo font-black text-green-400 tracking-tightest">{m.rate}%</p>
                      <p className="text-[10px] text-white/50 uppercase font-cairo font-bold tracking-wider mt-1">الكفاءة</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-white/60">
                    <p className="text-sm font-cairo font-semibold">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
