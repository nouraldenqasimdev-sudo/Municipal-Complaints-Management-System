import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import Link from 'next/link';
import api from '@/services/api';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SolvedCase {
  id: string;
  title: string;
  municipality: string;
  before: string;
  after: string;
  date: string;
  category: string;
  icon: string;
  color: string;
  impact?: string;
  images?: string[];
  created_at?: string;
}

const getCategoryInfo = (category: string): { name: string; icon: string; color: string } => {
  const categoryMap: { [key: string]: { name: string; icon: string; color: string } } = {
    'infrastructure': { name: 'مياه وصرف صحي', icon: '🚰', color: 'bg-blue-500' },
    'electricity': { name: 'كهرباء وإنارة', icon: '💡', color: 'bg-amber-500' },
    'roads': { name: 'طرق وجسور', icon: '🛣️', color: 'bg-secondary' },
    'sanitation': { name: 'نظافة وجمع النفايات', icon: '🗑️', color: 'bg-green-600' },
    'building': { name: 'بناء وتشييد', icon: '🏗️', color: 'bg-indigo-600' },
  };
  return categoryMap[category] || { name: category, icon: '📁', color: 'bg-gray-500' };
};

const formatArabicDate = (dateString: string): string => {
  try {
    if (!dateString) return 'تاريخ غير متاح';
    
    const date = new Date(dateString);
      
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'تاريخ غير صحيح';
    }
    
    const months = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'تاريخ غير متاح';
  }
};

const calculateResolutionTime = (created: string, resolved: string): string => {
  try {
    if (!created || !resolved) return 'غير محدد';
    
    const createdDate = new Date(created);
    const resolvedDate = new Date(resolved);
    
    if (isNaN(createdDate.getTime()) || isNaN(resolvedDate.getTime())) {
      console.warn('Invalid date for resolution time calculation:', { created, resolved });
      return 'غير محدد';
    }
    
    const diffTime = Math.abs(resolvedDate.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} يوم${diffDays > 1 ? '' : ''}${diffHours > 0 ? ` و ${diffHours} ساعة` : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} ساعة${diffMinutes > 0 ? ` و ${diffMinutes} دقيقة` : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} دقيقة`;
    } else {
      return 'أقل من دقيقة';
    }
  } catch (error) {
    console.error('Error calculating resolution time:', error);
    return 'غير محدد';
  }
};

export default function TransparencyPortal() {
  const { isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState([
    { label: 'إجمالي البلاغات الميدانية المعالجة', value: '0', icon: '✅', color: 'bg-secondary', trend: 'جاري التحميل...' },
    { label: 'متوسط سرعة الاستجابة الميدانية', value: 'جاري التحميل...', icon: '⏱️', color: 'bg-primary', trend: 'جاري التحميل...' },
    { label: 'البلديات ومجالس المدن الموثقة', value: '0', icon: '🏢', color: 'bg-indigo-600', trend: 'جاري التحميل...' },
  ]);
  const [solvedCases, setSolvedCases] = useState<SolvedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    metrics: true,
    categories: true,
    cases: true,
  });
  const [selectedCase, setSelectedCase] = useState<SolvedCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 Starting to fetch transparency data...');
        setLoading(true);
        setError(null);
        setLoadingStates({ metrics: true, categories: true, cases: true });
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
        console.log('📡 API Base URL:', apiBaseUrl);
        
        console.log('📥 Fetching data from API endpoints...');
        const [statsRes, muniRes, resolvedReportsRes] = await Promise.allSettled([
          api.get('/stats/reports-category').catch((err) => {
            console.error('❌ Error fetching stats:', err);
            if (err.response?.status === 401) {
              console.warn('Stats endpoint requires auth, using empty data');
              return { data: [] };
            }
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
              return { data: [] };
            }
            throw err;
          }),
          api.get('/municipalities').catch((err) => {
            console.error('❌ Error fetching municipalities:', err);
            if (err.response?.status === 401) {
              console.warn('Municipalities endpoint requires auth, using empty data');
              return { data: [] };
            }
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
              return { data: [] };
            }
            throw err;
          }),
          api.get('/reports?status=resolved').catch((err) => {
            console.error('❌ Error fetching resolved reports:', err);
            if (err.response?.status === 401) {
              console.warn('Resolved reports endpoint requires auth, using empty data');
              return { data: [] };
            }
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
              return { data: [] };
            }
            throw err;
          })
        ]);
        
        console.log('✅ All API requests completed:', {
          stats: statsRes.status,
          municipalities: muniRes.status,
          resolvedReports: resolvedReportsRes.status
        });
        
        let totalReports = 0;
        let categoryStatsData: any[] = [];
        if (statsRes.status === 'fulfilled') {
          try {
            categoryStatsData = statsRes.value.data || [];
            totalReports = categoryStatsData.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
            setCategoryStats(categoryStatsData);
            setLoadingStates(prev => ({ ...prev, categories: false }));
          } catch (err) {
            console.error('Error processing stats data:', err);
            toast.error('حدث خطأ في معالجة بيانات الإحصائيات');
          }
        } else {
          console.error('Error fetching stats:', statsRes.reason);
          toast.error('فشل في تحميل إحصائيات البلاغات');
        }
        
        let municipalitiesCount = 0;
        if (muniRes.status === 'fulfilled') {
          try {
            municipalitiesCount = muniRes.value.data?.length || 0;
          } catch (err) {
            console.error('Error processing municipalities data:', err);
          }
        } else {
          console.error('Error fetching municipalities:', muniRes.reason);
          toast.error('فشل في تحميل بيانات البلديات');
        }
        
        let resolvedReports: any[] = [];
        let avgResponseTime = 'غير متاح';
        
        if (resolvedReportsRes.status === 'fulfilled') {
          try {
            resolvedReports = resolvedReportsRes.value.data || [];
            console.log('Resolved reports fetched:', resolvedReports.length);
          } catch (err) {
            console.error('Error processing resolved reports:', err);
          }
        }
        
        try {
          console.log('⏱️ Calculating average response time...');
          const [processingRes, resolvedRes] = await Promise.allSettled([
            api.get('/reports?status=processing').catch((err) => {
              console.error('❌ Error fetching processing reports:', err);
              if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                console.error('Network error - API server may be down');
                return { data: [] };
              }
              return { data: [] };
            }),
            api.get('/reports?status=resolved').catch((err) => {
              console.error('❌ Error fetching resolved reports:', err);
              if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                console.error('Network error - API server may be down');
                return { data: [] };
              }
              return { data: [] };
            })
          ]);
          
          let allProcessedReports: any[] = [];
          
          if (processingRes.status === 'fulfilled' && processingRes.value?.data) {
            const processingData = Array.isArray(processingRes.value.data) 
              ? processingRes.value.data 
              : [];
            allProcessedReports = allProcessedReports.concat(processingData);
            console.log('📊 Processing reports:', processingData.length);
          }
          
          if (resolvedRes.status === 'fulfilled' && resolvedRes.value?.data) {
            const resolvedData = Array.isArray(resolvedRes.value.data) 
              ? resolvedRes.value.data 
              : [];
            allProcessedReports = allProcessedReports.concat(resolvedData);
            console.log('📊 Resolved reports:', resolvedData.length);
          }
          
          console.log('📊 Total processed reports:', allProcessedReports.length);
          
          console.log('🔍 Filtering reports...');
          if (allProcessedReports.length > 0) {
            console.log('📋 Sample report:', JSON.stringify(allProcessedReports[0], null, 2));
          }
          
          const validReports = allProcessedReports.filter((r: any, index: number) => {
            if (!r) {
              console.log(`⚠️ Report ${index} is null or undefined`);
              return false;
            }
            if (!r.created_at || !r.updated_at) {
              console.log(`⚠️ Report ${r.id || index} missing timestamps:`, { 
                id: r.id, 
                hasCreated: !!r.created_at, 
                hasUpdated: !!r.updated_at,
                created_at: r.created_at,
                updated_at: r.updated_at
              });
              return false;
            }
            const created = new Date(r.created_at);
            const updated = new Date(r.updated_at);
            if (isNaN(created.getTime()) || isNaN(updated.getTime())) {
              console.log(`⚠️ Report ${r.id || index} has invalid dates:`, { 
                id: r.id,
                created: r.created_at, 
                updated: r.updated_at,
                createdValid: !isNaN(created.getTime()),
                updatedValid: !isNaN(updated.getTime())
              });
              return false;
            }
            const timeDiff = updated.getTime() - created.getTime();
            if (timeDiff < 0) {
              console.log(`⚠️ Report ${r.id || index} updated_at < created_at:`, { 
                id: r.id,
                created: r.created_at, 
                updated: r.updated_at, 
                diff: timeDiff 
              });
              return false;
            }
            if (index < 3) {
              console.log(`✅ Report ${r.id || index} is valid:`, {
                id: r.id,
                created: r.created_at,
                updated: r.updated_at,
                diff: timeDiff,
                diffHours: (timeDiff / (1000 * 60 * 60)).toFixed(2)
              });
            }
            return true;
          });
          
          console.log('✅ Valid reports with timestamps:', validReports.length);
          
          if (validReports.length > 0) {
            const totalTime = validReports.reduce((sum: number, report: any) => {
              try {
                const created = new Date(report.created_at);
                const updated = new Date(report.updated_at);
                const diff = Math.max(0, updated.getTime() - created.getTime());
                return sum + diff;
              } catch (err) {
                console.warn('⚠️ Error calculating time for report:', report.id, err);
                return sum;
              }
            }, 0);
            
            console.log('⏱️ Total time in ms:', totalTime);
            
            if (totalTime > 0) {
              const avgMs = totalTime / validReports.length;
              const avgHours = avgMs / (1000 * 60 * 60);
              console.log('📈 Average hours:', avgHours);
              
              if (avgHours < 1) {
                const avgMinutes = Math.round(avgMs / (1000 * 60));
                avgResponseTime = avgMinutes > 0 ? `${avgMinutes} دقيقة` : 'أقل من دقيقة';
              } else if (avgHours < 24) {
                avgResponseTime = `${Math.round(avgHours)} ساعة`;
              } else {
                const avgDays = Math.round(avgHours / 24);
                avgResponseTime = `${avgDays} يوم`;
              }
              console.log('✅ Calculated response time:', avgResponseTime);
            } else {
              console.warn('⚠️ Total time is 0, cannot calculate average');
              avgResponseTime = 'أقل من دقيقة';
            }
          } else {
            console.warn('⚠️ No valid reports found with timestamps');
            console.log('💡 Tip: Make sure you have reports with status "processing" or "resolved" in the database');
          }
        } catch (err) {
          console.error('❌ Error calculating response time:', err);
        }
        
        if (resolvedReportsRes.status === 'fulfilled') {
          try {
            
            const mappedCases: SolvedCase[] = resolvedReports
              .sort((a: any, b: any) => {
                const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                return dateB - dateA;
              })
              .slice(0, 12)
              .reduce<SolvedCase[]>((acc, report: any) => {
                try {
                  const categoryInfo = getCategoryInfo(report.category || '');
                  const resolutionTime = calculateResolutionTime(report.created_at, report.updated_at);
                  
                  acc.push({
                    id: report.id?.toString() || `case-${Math.random()}`,
                    title: report.title || 'عنوان غير متاح',
                    municipality: report.municipality?.name || 'غير محدد',
                    before: report.description || 'لا يوجد وصف متاح',
                    after: report.official_comment || 'تم حل المشكلة بنجاح',
                    date: formatArabicDate(report.updated_at || report.created_at),
                    category: categoryInfo.name,
                    icon: categoryInfo.icon,
                    color: categoryInfo.color,
                    impact: resolutionTime,
                    images: report.images || [],
                    created_at: report.created_at
                  });
                } catch (err) {
                  console.error('Error mapping report:', report.id, err);
                }
                return acc;
              }, []);
            
            console.log('Mapped cases:', mappedCases.length);
            setSolvedCases(mappedCases);
            setLoadingStates(prev => ({ ...prev, cases: false }));
          } catch (err: any) {
            console.error('Error processing resolved reports:', err);
            console.error('Error details:', {
              message: err?.message,
              stack: err?.stack,
              response: err?.response?.data
            });
            toast.error(`حدث خطأ في معالجة الحالات المحلولة: ${err?.message || 'خطأ غير معروف'}`);
            setSolvedCases([]);
            setLoadingStates(prev => ({ ...prev, cases: false }));
          }
        } else {
          const errorReason = resolvedReportsRes.reason;
          console.error('Error fetching resolved reports:', errorReason);
          console.error('Error details:', {
            message: errorReason?.message,
            response: errorReason?.response?.data,
            status: errorReason?.response?.status
          });
          
          const errorMessage = errorReason?.response?.data?.message 
            || errorReason?.message 
            || 'فشل في تحميل الحالات المحلولة';
          
          toast.error(errorMessage);
          setSolvedCases([]);
          setLoadingStates(prev => ({ ...prev, cases: false }));
        }

        
        let responseTimeValue = avgResponseTime;
        let responseTimeTrend = 'بيانات حية';

        if (!isAuthenticated) {
          responseTimeValue = 'سجّل الدخول لمعرفة متوسط سرعة الاستجابة';
          responseTimeTrend = 'متاح بعد تسجيل الدخول';
        } else if (
          !avgResponseTime ||
          avgResponseTime === 'غير متاح' ||
          avgResponseTime === 'لا توجد بيانات'
        ) {
          responseTimeValue = 'غير متاح حالياً';
          responseTimeTrend = 'لا توجد بيانات كافية بعد';
        }
        
        
        setMetrics([
          { 
            label: 'إجمالي البلاغات الميدانية المعالجة', 
            value: totalReports.toLocaleString('ar-SA'), 
            icon: '✅', 
            color: 'bg-secondary', 
            trend: 'بيانات حية' 
          },
          { 
            label: 'متوسط سرعة الاستجابة الميدانية', 
            value: responseTimeValue, 
            icon: '⏱️', 
            color: 'bg-primary', 
            trend: responseTimeTrend 
          },
          { 
            label: 'البلديات ومجالس المدن الموثقة', 
            value: municipalitiesCount.toString(), 
            icon: '🏢', 
            color: 'bg-indigo-600', 
            trend: 'بيانات حية' 
          },
        ]);
        
        setLoadingStates(prev => ({ ...prev, metrics: false }));
        
      } catch (error: any) {
        console.error('Error fetching transparency data:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'حدث خطأ غير متوقع';
        setError(errorMessage);
        toast.error(`فشل في تحميل بيانات الشفافية: ${errorMessage}`); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <MainLayout>
      
      <div className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 sm:py-28 lg:py-32 overflow-hidden">
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-[400px] -mt-[400px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px] -ml-[350px] -mb-[350px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
        </div>

        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8 sm:space-y-10">
            
            
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-2 border-primary/30 backdrop-blur-sm shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></span>
              <span className="text-sm sm:text-base font-cairo font-black text-primary uppercase tracking-wider">
                بوابة البيانات السيادية المفتوحة
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" style={{ animationDelay: '0.5s' }}></span>
            </div>

            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-cairo font-black text-slate-950 tracking-tightest leading-[1.05]">
                <span className="block">الشفافية</span>
                <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  أساس الثقة
                </span>
            </h1>

              
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent to-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-l from-transparent to-secondary rounded-full"></div>
              </div>
            </div>

            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 font-cairo font-bold leading-[1.9] max-w-4xl mx-auto">
              نؤمن بأن الوصول للمعلومة هو حق أصيل للمواطن. هنا نعرض وبكل فخر نتائج العمل الحكومي الميداني المقاس بالأرقام الموثقة والواقع الرقمي الحقيقي.
            </p>

            
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
                <span className="text-3xl">📊</span>
                <div className="text-right">
                  <p className="text-xs font-cairo font-bold text-slate-500 uppercase">بيانات حية</p>
                  <p className="text-lg font-cairo font-black text-slate-950">محدثة الآن</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
                <span className="text-3xl">🔒</span>
                <div className="text-right">
                  <p className="text-xs font-cairo font-bold text-slate-500 uppercase">موثوقة</p>
                  <p className="text-lg font-cairo font-black text-slate-950">مصادقة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
                <span className="text-3xl">⚡</span>
                <div className="text-right">
                  <p className="text-xs font-cairo font-bold text-slate-500 uppercase">فورية</p>
                  <p className="text-lg font-cairo font-black text-slate-950">تحديث مباشر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-gradient-to-b from-white via-slate-50/50 to-white py-16 sm:py-20 lg:py-24 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cairo font-black text-slate-950 mb-4">
              المؤشرات الرئيسية
            </h2>
            <p className="text-lg text-slate-600 font-cairo font-semibold max-w-2xl mx-auto">
              أرقام حقيقية تعكس أداء النظام والخدمات المقدمة
            </p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div className="flex-1">
                  <p className="font-cairo font-black text-red-900 mb-1">حدث خطأ</p>
                  <p className="font-cairo font-semibold text-red-700">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="!border-red-300 !text-red-700 hover:!bg-red-100"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {loadingStates.metrics ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="h-full bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-slate-100 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
                      <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-24 h-10 bg-slate-200 rounded"></div>
                      <div className="w-full h-4 bg-slate-200 rounded"></div>
                    </div>
              </div>
            ))}
              </>
            ) : (
              metrics.map((m, i) => (
                <div 
                  key={i} 
                  className="group animate-in fade-in slide-in-from-bottom duration-700 h-full transform hover:scale-105 transition-all"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative h-full bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl border-2 border-slate-100 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                    
                    <div className={`absolute top-0 right-0 w-32 h-32 ${m.color} opacity-10 rounded-full blur-3xl`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:rotate-12 transition-transform`}>
                          {m.icon}
                        </div>
                        <span className="text-xs font-cairo font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                          {m.trend}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-3xl sm:text-4xl font-cairo font-black text-slate-950 group-hover:text-primary transition-colors">
                          {m.value}
                        </p>
                        <p className="text-sm sm:text-base font-cairo font-bold text-slate-600 leading-relaxed">
                          {m.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      
      {loadingStates.categories ? (
        <div className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="h-8 w-64 bg-slate-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 w-96 bg-slate-200 rounded-lg mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="w-16 h-8 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-32 h-4 bg-slate-200 rounded mb-3"></div>
                  <div className="w-full h-2 bg-slate-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : categoryStats.length > 0 ? (
        <div className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-cairo font-black text-slate-950 mb-4">
                التوزيع حسب القطاعات
              </h2>
              <p className="text-lg text-slate-600 font-cairo font-semibold max-w-2xl mx-auto">
                إحصائيات مفصلة عن البلاغات حسب كل قطاع خدمي
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStats.map((stat: any, index: number) => {
                const categoryInfo = getCategoryInfo(stat.category || '');
                const total = categoryStats.reduce((sum: number, s: any) => sum + (s.count || 0), 0);
                const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                
                return (
                  <div 
                    key={index}
                    className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 border-slate-100 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${categoryInfo.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                        {categoryInfo.icon}
                      </div>
                      <span className="text-2xl font-cairo font-black text-slate-950">
                        {stat.count?.toLocaleString('ar-SA') || 0}
                      </span>
                    </div>
                    
                    <p className="text-base font-cairo font-bold text-slate-700 mb-3">
                      {categoryInfo.name}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-cairo font-semibold text-slate-500">النسبة</span>
                        <span className="font-cairo font-black text-primary">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${categoryInfo.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20 lg:py-24 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-12 sm:mb-16 space-y-6">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-lg border-2 border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                ✨
              </div>
              <div className="text-right">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-cairo font-black text-slate-950 mb-2">
                  حقائق ميدانية
                </h2>
                <p className="text-base sm:text-lg text-slate-600 font-cairo font-semibold">
                  تحويل البلاغات الرقمية إلى إنجازات خدمية ملموسة
                </p>
              </div>
            </div>
          </div>

          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              variant="ghost" 
              className="!text-gray-700 !font-bold hover:!text-primary hover:!bg-primary/10 transition-all !px-6 !py-3 !rounded-xl border-2 border-slate-200 hover:border-primary/30"
            >
              كافة القطاعات السيادية
            </Button>
            <Button 
              size="md" 
              className="shadow-lg hover:shadow-xl transition-all !px-6 !py-3 !rounded-xl !font-bold"
            >
              الأحدث أولاً
            </Button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {loadingStates.cases ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden animate-pulse">
                    <div className="h-32 bg-slate-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <div className="w-24 h-6 bg-slate-200 rounded"></div>
                        <div className="w-20 h-6 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-full h-6 bg-slate-200 rounded"></div>
                      <div className="w-3/4 h-6 bg-slate-200 rounded"></div>
                      <div className="pt-4 space-y-3">
                        <div className="w-full h-4 bg-slate-200 rounded"></div>
                        <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              solvedCases.map((c, i) => (
                <div 
                  key={c.id} 
                  className="group animate-in fade-in slide-in-from-bottom duration-700 transform hover:scale-[1.02] transition-all cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => {
                    setSelectedCase(c);
                    setIsModalOpen(true);
                  }}
                >
                  <Card hoverable className="!p-0 !rounded-3xl bg-white border-2 border-slate-200 hover:border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                    
                    
                    {c.images && c.images.length > 0 && (
                      <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden bg-slate-100">
                        <img 
                          src={c.images[0]} 
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {c.images.length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-cairo font-bold">
                            +{c.images.length - 1} صورة
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}

                    
                    <div className={`relative ${c.color} p-8 overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                      
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-20 h-20 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-2 border-white/30 transform group-hover:rotate-12 transition-transform">
                        {c.icon}
                      </div>
                        <span className="text-sm font-cairo font-black text-white bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-white/40 shadow-lg">
                        {c.category}
                      </span>
                    </div>
                  </div>

                    
                    <div className="p-6 sm:p-8 space-y-6 flex-grow">
                  
                      
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <span className="text-xs sm:text-sm font-cairo font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border-2 border-primary/20">
                          {c.municipality}
                        </span>
                          <span className="text-xs sm:text-sm font-cairo font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                            📅 {c.date}
                        </span>
                      </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-cairo font-black text-slate-950 tracking-tight leading-[1.2] group-hover:text-primary transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                    </div>

                      
                      <div className="space-y-6 pt-6 border-t-2 border-slate-100">
                        
                        
                        <div className="flex gap-4 items-start group/item">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xl font-black shadow-lg border-2 border-red-200 transform group-hover/item:scale-110 transition-transform">
                          !
                        </div>
                          <div className="flex-1 space-y-3">
                            <p className="text-xs sm:text-sm font-cairo font-black text-slate-500 uppercase tracking-wider">
                            الحالة قبل التدخل
                          </p>
                            <p className="text-sm sm:text-base lg:text-lg text-slate-700 font-cairo font-semibold leading-[1.8] line-clamp-3">
                            {c.before}
                          </p>
                            
                            {c.images && c.images.length > 0 && (
                              <div className="pt-3 space-y-2">
                                <p className="text-xs font-cairo font-bold text-slate-500 uppercase tracking-wider">
                                  📸 الصور المرفقة ({c.images.length})
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {c.images.slice(0, 3).map((img, idx) => (
                                    <div 
                                      key={idx}
                                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-primary/50 transition-all group/img"
                                    >
                                      <img 
                                        src={img} 
                                        alt={`صورة ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      {idx === 2 && c.images && c.images.length > 3 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                          <span className="text-white text-xs font-cairo font-bold">
                                            +{c.images.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                        
                        <div className="flex gap-4 items-start group/item pt-4 border-t border-slate-100">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/30 text-secondary flex items-center justify-center flex-shrink-0 text-xl font-black shadow-lg border-2 border-secondary/30 transform group-hover/item:scale-110 transition-transform">
                          ✓
                        </div>
                          <div className="flex-1 space-y-3">
                            <p className="text-xs sm:text-sm font-cairo font-black text-slate-500 uppercase tracking-wider">
                            النتيجة النهائية
                          </p>
                            <p className="text-sm sm:text-base lg:text-lg text-slate-950 font-cairo font-bold leading-[1.8] line-clamp-3">
                            {c.after}
                          </p>
                          {c.impact && (
                              <div className="pt-3 border-t border-slate-100">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20">
                                  <span className="text-lg">📊</span>
                                  <span className="text-xs font-cairo font-black text-primary">
                                    {c.impact}
                                  </span>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCase(null);
        }}
        title={selectedCase?.title || 'تفاصيل البلاغ'}
        subtitle="معلومات كاملة عن البلاغ والحل المطبق"
        maxWidth="max-w-5xl"
      >
        {selectedCase && (
          <div className="space-y-8">
            
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b-2 border-slate-200">
              <div className={`${selectedCase.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {selectedCase.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-sm font-cairo font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border-2 border-primary/20">
                    {selectedCase.municipality}
                  </span>
                  <span className="text-sm font-cairo font-black text-white bg-slate-800 px-4 py-2 rounded-xl">
                    {selectedCase.category}
                  </span>
                  <span className="text-sm font-cairo font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                    📅 {selectedCase.date}
                  </span>
                  {selectedCase.impact && (
                    <span className="text-sm font-cairo font-black text-secondary bg-secondary/10 px-4 py-2 rounded-xl border-2 border-secondary/20">
                      ⏱️ {selectedCase.impact}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-cairo font-black text-slate-950 mt-3">
                  {selectedCase.title}
                </h2>
              </div>
        </div>

            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-2xl font-black shadow-lg border-2 border-red-200">
                  !
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm font-cairo font-black text-slate-500 uppercase tracking-wider">
                    الحالة قبل التدخل
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 font-cairo font-semibold leading-[1.8]">
                    {selectedCase.before}
                  </p>
                  
                  
                  {selectedCase.images && selectedCase.images.length > 0 && (
                    <div className="pt-4 space-y-3">
                      <p className="text-sm font-cairo font-black text-slate-700 uppercase tracking-wider border-b-2 border-slate-200 pb-2">
                        📸 صور المشكلة ({selectedCase.images.length > 1 ? selectedCase.images.length - 1 : selectedCase.images.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(selectedCase.images.length > 1 
                          ? selectedCase.images.slice(0, -1)
                          : selectedCase.images
                        ).map((img, idx) => (
                          <div 
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-primary/50 transition-all group cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          >
                            <img 
                              src={img} 
                              alt={`صورة المشكلة ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-xs font-cairo font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                🔍 عرض كامل
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>

            
            <div className="space-y-6 pt-6 border-t-2 border-slate-200">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/30 text-secondary flex items-center justify-center flex-shrink-0 text-2xl font-black shadow-lg border-2 border-secondary/30">
                  ✓
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm font-cairo font-black text-slate-500 uppercase tracking-wider">
                    النتيجة النهائية
                  </p>
                  <p className="text-base sm:text-lg text-slate-950 font-cairo font-bold leading-[1.8]">
                    {selectedCase.after}
                  </p>
                  
                  
                  {selectedCase.images && selectedCase.images.length > 1 && (
                    <div className="pt-4 space-y-3">
                      <p className="text-sm font-cairo font-black text-secondary uppercase tracking-wider border-b-2 border-secondary/20 pb-2">
                        ✨ صور بعد الحل
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        
                        <div 
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-secondary/30 hover:border-secondary/50 transition-all group cursor-pointer"
                          onClick={() => window.open(selectedCase.images![selectedCase.images!.length - 1], '_blank')}
                        >
                          <img 
                            src={selectedCase.images[selectedCase.images.length - 1]} 
                            alt="صورة بعد الحل"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/20 transition-colors flex items-center justify-center">
                            <span className="text-white text-xs font-cairo font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              🔍 عرض كامل
                            </span>
                          </div>
                          <div className="absolute top-2 left-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-cairo font-black shadow-lg">
                            ✨ بعد الحل
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCase(null);
                }}
                className="!px-6 !py-3 !rounded-xl !font-bold"
              >
                إغلاق
              </Button>
        </div>
      </div>
        )}
      </Modal>
    </MainLayout>
  );
}
