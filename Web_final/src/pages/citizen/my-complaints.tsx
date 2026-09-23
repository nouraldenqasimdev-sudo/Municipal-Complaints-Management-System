import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MyComplaints() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getAll();
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        toast.error('فشل في تحميل البلاغات. يرجى المحاولة مرة أخرى');
      } finally {
        setLoading(false);
      }
    };        
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(c => {
    const titleMatch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const idMatch = c.id?.toString().includes(searchTerm) || false;
    const matchesSearch = titleMatch || idMatch;
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const downloadReceipt = async (id: number | string) => {
    const complaint = complaints.find(c => c.id.toString() === id.toString());
    if (!complaint) {
      toast.error('لم يتم العثور على البلاغ');
      return;
    }

    const confirmMessage = `سيتم الآن تحميل ملف إيصال المراجعة للبلاغ رقم #${complaint.id}\n\nهل تريد المتابعة؟`;
    const userConfirmed = window.confirm(confirmMessage);
    
    if (!userConfirmed) {
      toast('تم إلغاء عملية التحميل', { icon: 'ℹ️' });
      return;
    }

    toast.loading('جاري تحميل الإيصال...', { id: `downloading-receipt-${id}` });
    
    try {
      const statusText = complaint.status === 'pending' ? 'قيد الانتظار' :
                        complaint.status === 'processing' ? 'قيد المعالجة' :
                        complaint.status === 'resolved' ? 'تم الحل' :
                        complaint.status === 'on-hold' ? 'مؤجل' :
                        complaint.status === 'rejected' ? 'مرفوض' : complaint.status;

      const receiptHTML = `
        <div dir="rtl" style="font-family: 'Cairo', 'Arial', 'Tahoma', sans-serif; padding: 40px; width: 800px; background: white; direction: rtl; text-align: right;">
          <h1 style="text-align: center; font-size: 26px; font-weight: 900; margin-bottom: 30px; color: #0047AB; letter-spacing: 0; line-height: 1.4;">
            إيصال مراجعة البلاغ
          </h1>
          <div style="margin-bottom: 20px;">
            <p style="font-size: 18px; font-weight: bold; color: #333;">رقم البلاغ: #${complaint.id}</p>
          </div>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0047AB; margin-bottom: 15px; letter-spacing: 0; line-height: 1.4;">
              بيانات البلاغ:
            </h2>
            <p style="font-size: 14px; margin: 8px 0; color: #555;"><strong>عنوان البلاغ:</strong> ${complaint.title}</p>
            <p style="font-size: 14px; margin: 8px 0; color: #555;"><strong>الحالة:</strong> ${statusText}</p>
            <p style="font-size: 14px; margin: 8px 0; color: #555;"><strong>تاريخ التقديم:</strong> ${new Date(complaint.created_at).toLocaleDateString('ar-SY')}</p>
            <p style="font-size: 14px; margin: 8px 0; color: #555;"><strong>البلدية المعنية:</strong> ${complaint.municipality?.name || 'غير محدد'}</p>
            <p style="font-size: 14px; margin: 8px 0; color: #555;"><strong>العنوان:</strong> ${complaint.address || 'لم يتم تحديد العنوان'}</p>
            <p style="font-size: 13px; margin: 8px 0; color: #777;"><strong>الإحداثيات:</strong> ${complaint.location_lat?.toFixed?.(6) || complaint.location_lat} , ${complaint.location_lng?.toFixed?.(6) || complaint.location_lng}</p>

            <h2 style="font-size: 16px; font-weight: 700; color: #0047AB; margin: 18px 0 10px 0; letter-spacing: 0; line-height: 1.4;">
              وصف وتفاصيل البلاغ الميداني:
            </h2>
            <p style="font-size: 14px; margin: 6px 0; color: #555; line-height: 1.8;">
              ${complaint.description}
            </p>
          </div>

          ${complaint.images && complaint.images.length > 0 ? `
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0047AB; margin-bottom: 12px; letter-spacing: 0; line-height: 1.4; font-family: 'Cairo', 'Arial', 'Tahoma', sans-serif;">
                المرفقات البصرية:
              </h2>
              <div style="border: 1px solid #eee; padding: 10px; border-radius: 10px; text-align: center;">
                <img src="${complaint.images[0]}" alt="صورة البلاغ" style="max-width: 100%; max-height: 300px; border-radius: 10px; object-fit: cover;" />
              </div>
            </div>
          ` : ''}
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <div style="margin-bottom: 25px;">
            <p style="font-size: 16px; font-weight: bold; color: #0047AB; margin-bottom: 10px;">رقم التتبع: #${complaint.id}</p>
            <p style="font-size: 12px; color: #666;">يمكنك استخدام هذا الرقم لمتابعة حالة البلاغ في أي وقت.</p>
          </div>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 11px; color: #888; text-align: center; margin-top: 30px;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SY')}</p>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.innerHTML = receiptHTML;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `إيصال_البلاغ_${complaint.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.dismiss(`downloading-receipt-${id}`);
      toast.success('تم تحميل الإيصال بنجاح 📄');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss(`downloading-receipt-${id}`);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, { label: string; icon: string }> = {
      infrastructure: { label: 'مياه وصرف صحي', icon: '🚰' },
      electricity: { label: 'كهرباء وإنارة', icon: '💡' },
      roads: { label: 'طرق وجسور', icon: '🛣️' },
      sanitation: { label: 'نظافة ونفايات', icon: '🗑️' },
      building: { label: 'مخالفات بناء', icon: '🏗️' },
    };
    return categories[category] || { label: 'أخرى', icon: '📁' };
  };

  if (loading) {
    return (
      <DashboardLayout role="citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-700 font-black text-xl uppercase tracking-wider">جاري تحميل البلاغات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="citizen">
      <DashboardHeader 
        title="سجل البلاغات الرقمية 📁"
        subtitle="تتبع جميع طلباتك المقدمة وحالات معالجتها مع إمكانية تحميل التوثيقات الرسمية"
        actions={[
          { label: 'تقديم بلاغ جديد', href: '/citizen/report', primary: true, icon: '➕' }
        ]}
      />

      <Card className="!p-4 mb-10 relative z-20 border-2 border-gray-100 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-primary transition-colors pointer-events-none">🔍</span>
            <input 
              type="text" 
              placeholder="البحث برقم البلاغ أو عنوان البلاغ..." 
              className="w-full pr-14 pl-6 py-4 rounded-[25px] border-2 border-gray-100 bg-gray-50 outline-none focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/10 transition-all font-black text-gray-800 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="px-8 py-4 rounded-[25px] border-2 border-gray-100 bg-gray-50 outline-none focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/10 transition-all font-black text-gray-700 appearance-none cursor-pointer min-w-[220px] pr-10"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">جميع الحالات 🌐</option>
              <option value="pending">قيد الانتظار 🆕</option>
              <option value="processing">قيد المعالجة 🛠️</option>
              <option value="on-hold">مؤجل ⏸️</option>
              <option value="resolved">تم الحل ✅</option>
              <option value="rejected">مرفوض ❌</option>
            </select>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8">
        {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => {
          const categoryInfo = getCategoryLabel(complaint.category || 'other');
          return (
            <Card 
              key={complaint.id} 
              className="relative overflow-hidden group border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-500" 
              noPadding
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 lg:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-mono font-black text-primary bg-primary/10 px-5 py-2.5 rounded-xl border border-primary/20 shadow-sm">
                      # {complaint.id}
                    </span>
                    <StatusBadge type="status" value={complaint.status} />
                    <span className="text-xs font-black text-gray-700 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                      <span>{categoryInfo.icon}</span>
                      <span>{categoryInfo.label}</span>
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-black uppercase tracking-wider bg-gray-50 px-5 py-2 rounded-full border border-gray-100">
                    {new Date(complaint.created_at).toLocaleDateString('ar-SY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 tracking-tight leading-snug">
                    {complaint.title}
                  </h3>
                  <p className="text-base text-gray-600 font-medium leading-relaxed line-clamp-2">
                    {complaint.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-6 flex-wrap">
                    <Link href={`/citizen/complaints/${complaint.id}`}>
                      <Button variant="primary" size="lg" className="!rounded-[25px] shadow-lg hover:shadow-xl transition-all">
                        عرض التفاصيل والتتبع →
                      </Button>
                    </Link>
                    <button 
                      onClick={() => downloadReceipt(complaint.id)}
                      className="text-gray-500 font-black text-sm uppercase tracking-wide hover:text-primary transition-all flex items-center gap-3 group/btn px-4 py-2 rounded-xl hover:bg-primary/5"
                    >
                      <span className="text-xl group-hover/btn:scale-125 transition-transform duration-300">📄</span>
                      <span>تحميل الإيصال</span>
                    </button>
                  </div>
                
                </div>
              </div>
            </Card>
          );
        }) : (
          <Card className="text-center py-32 bg-gradient-to-br from-gray-50 to-white rounded-[50px] border-2 border-gray-100 shadow-inner">
            <div className="text-9xl mb-8 opacity-20 grayscale">📂</div>
            <h3 className="text-gray-800 font-black text-3xl tracking-tight uppercase mb-4">
              لا توجد بلاغات مطابقة
            </h3>
            <p className="text-gray-500 text-base font-medium leading-relaxed mb-8 max-w-md mx-auto">
              لم يتم العثور على أي بلاغات تطابق معايير البحث الحالية. يرجى المحاولة بكلمات مختلفة أو تغيير فلتر الحالة
            </p>
            <Link href="/citizen/report">
              <Button variant="primary" size="lg" className="!rounded-[25px] shadow-lg hover:shadow-xl">
                تقديم بلاغ جديد
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
