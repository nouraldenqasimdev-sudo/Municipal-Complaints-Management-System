import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useRouter } from 'next/router';
import { complaintService } from '@/services/complaintService';
import { Complaint, ComplaintStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

export default function StaffComplaintManagement() {
  const router = useRouter();
  const { id } = router.query;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ComplaintStatus>('pending');
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchComplaint = async () => {
        try {
          const data = await complaintService.getById(id as string);
          setComplaint(data);
          setStatus(data.status);
          setComment(data.official_comment || '');
        } catch (error) {
          console.error('Error fetching complaint:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchComplaint();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      console.log('🔵 Updating complaint:', { id, status, comment });
      await complaintService.updateStatus(id as string, status, comment);
      toast.success('تم تحديث حالة البلاغ بنجاح');
      setTimeout(() => {
        router.push('/municipality');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error updating complaint status:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'فشل في تحديث حالة البلاغ';
      
      if (error.response?.status === 401) {
        errorMessage = 'يرجى تسجيل الدخول مرة أخرى';
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'غير مصرح لك بهذا الإجراء';
      } else if (error.response?.status === 422) {
        errorMessage = error.response?.data?.message || 'يرجى التحقق من البيانات المدخلة';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line'
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  if (!complaint) return <div className="flex items-center justify-center min-h-screen">البلاغ غير موجود</div>;

  return (
    <DashboardLayout role="municipality">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 bg-white p-12 rounded-[50px] border border-gray-100 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 transition-all duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-gray-950 text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl">كود البلاغ: #{complaint.id}</span>
            <StatusBadge type="status" value={complaint.status} />
            <StatusBadge type="priority" value={complaint.priority || 'medium'} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">{complaint.title}</h1>
        </div>
        <div className="flex gap-4 relative z-10">
           <Button variant="outline" size="lg" className="!rounded-[22px] !border-gray-100 shadow-sm" rightIcon={<span>🖨️</span>}>طباعة المهمة</Button>
           <Button size="lg" className="!rounded-[22px] shadow-2xl shadow-blue-200" rightIcon={<span>🗺️</span>}>فتح في الخريطة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <Card className="!p-12 border-none shadow-xl relative" noPadding>
            <Section title="المعلومات الفنية والميدانية" icon="🔍">
              <div className="bg-gray-50 p-10 rounded-[45px] border-2 border-gray-100/50 mb-12 shadow-inner group hover:bg-white hover:shadow-2xl transition-all duration-700">
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-4">وصف المشكلة كما وردت من المواطن</p>
                 <p className="text-xl font-medium text-gray-700 leading-[1.8] italic">"{complaint.description}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-white border-2 border-gray-50 rounded-[35px] shadow-sm hover:shadow-xl transition-all">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">الموقع الجغرافي الدقيق</p>
                  <p className="font-black text-gray-800 text-sm leading-relaxed">{complaint.address || 'غير محدد بدقة'}</p>
                </div>
                <div className="p-8 bg-white border-2 border-gray-50 rounded-[35px] shadow-sm hover:shadow-xl transition-all">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">هوية مقدم البلاغ</p>
                  <p className="font-black text-gray-800 text-sm">{complaint.is_anonymous ? '👤 مواطن مجهول' : (complaint.user?.name || 'مواطن مسجل')}</p>
                </div>
              </div>

              <div className="mt-12">
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-6 pr-2">التوثيق البصري المرفق</p>
                 <div className="grid grid-cols-3 gap-6">
                    {complaint.images && complaint.images.length > 0 ? (
                      complaint.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-gray-100 rounded-[30px] overflow-hidden border-4 border-white shadow-xl group cursor-pointer relative">
                          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                         <span className="text-4xl block mb-4 grayscale opacity-20">📸</span>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">لا توجد صور مرفقة</span>
                      </div>
                    )}
                 </div>
              </div>
            </Section>
          </Card>

          <Card className="!p-12 border-none shadow-xl" noPadding>
            <Section title="سجل المعالجة والإجراءات" icon="📋">
              <div className="space-y-8 relative">
                <div className="absolute top-0 right-[23px] w-1 h-full bg-gray-50 rounded-full"></div>
                {[
                  { title: 'استلام البلاغ رقمياً', date: 'منذ 3 ساعات', icon: '📥', color: 'bg-blue-500' },
                  { title: 'تحويل للمعاينة الميدانية', date: 'منذ ساعتين', icon: '🚜', color: 'bg-amber-500' },
                  { title: 'تحديث حالة العمل', date: 'الآن', icon: '✍️', color: 'bg-primary' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-8 items-start relative z-10 group">
                    <div className={`w-12 h-12 rounded-2xl ${log.color} text-white flex items-center justify-center text-xl shadow-xl transition-transform group-hover:scale-110`}>{log.icon}</div>
                    <div className="bg-gray-50/50 p-6 rounded-[30px] border border-gray-100 flex-1 group-hover:bg-white group-hover:shadow-2xl transition-all">
                      <p className="font-black text-gray-800 text-sm mb-1 uppercase tracking-tight">{log.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </Card>
        </div>

        <div className="space-y-12">
          <Card className="!p-12 border-none shadow-2xl sticky top-24 relative overflow-hidden group" noPadding>
            <div className="absolute top-0 left-0 w-full h-2 bg-primary group-hover:h-3 transition-all"></div>
            <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tighter uppercase">إدارة حالة البلاغ ⚙️</h3>
            
            <div className="space-y-8">
              <Select
                label="تعديل الحالة النهائية"
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                options={[
                  { value: 'pending', label: 'بانتظار المراجعة (Pending)' },
                  { value: 'processing', label: 'قيد التنفيذ الميداني (Processing)' },
                  { value: 'resolved', label: 'تمت المعالجة بالكامل (Resolved)' },
                  { value: 'rejected', label: 'مرفوض / غير مختص (Rejected)' }
                ]}
              />

              <Input
                label="الرد الرسمي المعتمد"
                multiline
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب التقرير الفني النهائي ليتم إرساله للمواطن..."
                rightLabel="الرد سيظهر للمواطن مباشرة"
              />

              <Button 
                fullWidth 
                size="xl" 
                onClick={handleUpdate} 
                isLoading={isUpdating}
                className="!rounded-[25px] shadow-[0_30px_60px_-15px_rgba(0,82,204,0.3)] mt-6"
                rightIcon={<span className="text-2xl">💾</span>}
              >
                حفظ التغييرات وإغلاق المهمة
              </Button>
            </div>

            <div className="mt-12 p-8 bg-red-50 rounded-[35px] border border-red-100">
               <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mb-3">إجراءات حساسة</p>
               <Button variant="ghost" className="w-full !text-red-500 hover:!bg-red-500 hover:!text-white !rounded-[18px] !font-black !text-xs !uppercase !tracking-widest border-2 border-red-100">تحويل البلاغ لقسم آخر</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
