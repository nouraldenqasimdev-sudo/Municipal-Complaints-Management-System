import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';

const ComplaintLocationMap = dynamic(() => import('@/components/maps/ComplaintLocationMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-[40px] flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">جارٍ تحميل الخريطة...</div>
});

export default function ComplaintDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchComplaint = async () => {
        try {
          const data = await complaintService.getById(id as string);
          setComplaint(data);
          setEditForm({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            address: data.address || '',
          });
        } catch (error) {
          console.error('Error fetching complaint:', error);
          toast.error('فشل في تحميل بيانات البلاغ');
        } finally {
          setLoading(false);
        }
      };
      fetchComplaint();
    }
  }, [id]);

  const downloadReceipt = async () => {
    if (!complaint) return;

    const confirmMessage = `سيتم الآن تحميل ملف إيصال المراجعة للبلاغ رقم #${complaint.id}\n\nهل تريد المتابعة؟`;
    const userConfirmed = window.confirm(confirmMessage);

    if (!userConfirmed) {
      toast('تم إلغاء عملية التحميل', { icon: 'ℹ️' });
      return;
    }

    setDownloadingReceipt(true);
    toast.loading('جاري تحميل الإيصال...', { id: 'downloading-receipt' });

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

      setDownloadingReceipt(false);
      toast.dismiss('downloading-receipt');
      toast.success('تم تحميل إيصال المراجعة بنجاح 📄');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadingReceipt(false);
      toast.dismiss('downloading-receipt');
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };


  const canEdit = complaint && user && complaint.status === 'pending' && complaint.user_id === user.id;

  const handleEdit = () => {
    if (!complaint) return;
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (complaint) {
      setEditForm({
        title: complaint.title || '',
        description: complaint.description || '',
        category: complaint.category || '',
        address: complaint.address || '',
      });
    }
  };

  const handleUpdate = async () => {
    if (!complaint || !id) return;

    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.category.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setUpdating(true);
    try {
      const updated = await complaintService.update(id as string, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        address: editForm.address.trim(),
      });
      
      setComplaint(updated);
      setIsEditing(false);
      toast.success('تم تحديث البلاغ بنجاح ✅');
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast.error(error.response?.data?.message || 'فشل في تحديث البلاغ');
    } finally {
      setUpdating(false);
    }
  };

  const categories = [
    { id: 'infrastructure', name: 'خدمات المياه والصرف الصحي', icon: '🚰' },
    { id: 'electricity', name: 'الكهرباء والإنارة العامة', icon: '💡' },
    { id: 'roads', name: 'الطرق والجسور', icon: '🛣️' },
    { id: 'sanitation', name: 'النظافة وجمع النفايات', icon: '🗑️' },
    { id: 'building', name: 'مخالفات البناء', icon: '🏗️' },
    { id: 'other', name: 'أخرى', icon: '📁' },
  ];


  if (loading) {
    return (
      <DashboardLayout role="citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-700 font-black text-xl uppercase tracking-wider">جاري تحميل بيانات البلاغ...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout role="citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-12 bg-white rounded-[50px] shadow-2xl border border-gray-100">
            <div className="text-8xl mb-6 opacity-20">❌</div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">الشكوى غير موجودة</h2>
            <p className="text-gray-600 text-base font-medium mb-8 leading-relaxed">
              لم يتم العثور على البلاغ المطلوب. قد يكون قد تم حذفه أو الرابط غير صحيح.
            </p>
            <Button
              onClick={() => router.push('/citizen/my-complaints')}
              variant="primary"
              size="lg"
              className="!rounded-[25px] !px-10"
            >
              العودة لقائمة البلاغات
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = [
    {
      status: 'تم تقديم الشكوى',
      date: new Date(complaint.created_at).toLocaleString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      active: true,
      desc: 'تم استلام البلاغ بنجاح في النظام وتوجيهه آلياً للقسم المعني'
    },
    {
      status: 'قيد المراجعة الفنية',
      date: complaint.status !== 'pending' ? 'مكتمل' : 'بانتظار المراجعة',
      active: complaint.status !== 'pending',
      desc: 'تم توجيه البلاغ للقسم المختص للمعاينة الميدانية والتقييم الفني'
    },
    {
      status: 'تم الحل النهائي',
      date: complaint.status === 'resolved' ? new Date(complaint.updated_at).toLocaleString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'قريباً',
      active: complaint.status === 'resolved',
      desc: 'تم إنجاز المعالجة الميدانية وتأكيد حل المشكلة بشكل نهائي'
    },
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 bg-gradient-to-br from-white to-gray-50 p-8 lg:p-12 rounded-[45px] border-2 border-gray-100 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -mr-36 -mt-36 group-hover:scale-125 transition-transform duration-1000 blur-2xl"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <span className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black tracking-wider uppercase shadow-lg">
                بلاغ رقم #{complaint.id}
              </span>
              <StatusBadge type="status" value={complaint.status} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-2">
              {complaint.title}
            </h1>
          </div>
          <div className="flex gap-4 relative z-10">
            {canEdit && (
              <Button
                variant="primary"
                size="lg"
                className="!rounded-[25px] !px-8 shadow-lg hover:shadow-xl transition-all"
                rightIcon={<span className="text-lg">✏️</span>}
                onClick={handleEdit}
              >
                تعديل البلاغ
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              className="!rounded-[25px] !px-8 shadow-lg hover:shadow-xl transition-all"
              rightIcon={<span className="text-lg">📄</span>}
              onClick={downloadReceipt}
              isLoading={downloadingReceipt}
              disabled={downloadingReceipt}
            >
              تحميل إيصال المراجعة
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="!p-10 border-2 border-gray-100 shadow-lg relative overflow-hidden group" noPadding>
              <div className="absolute top-0 right-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Section title="وصف وتفاصيل البلاغ الميداني" icon="📝">
                <div className="mb-10">
                  <p className="text-gray-700 leading-relaxed text-lg font-medium mb-8">
                    {complaint.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-[30px] border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-3">الموقع الجغرافي الموثق</p>
                      <p className="text-base font-black text-gray-800 leading-relaxed">
                        {complaint.address || 'لم يتم تحديد العنوان'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-blue-50/50 p-6 rounded-[30px] border-2 border-primary/20 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <p className="text-xs text-primary font-black uppercase tracking-widest mb-3">الجهة الحكومية المسؤولة</p>
                      <p className="text-base font-black text-primary leading-relaxed">
                        {complaint.municipality?.name || 'البلدية المعنية'}
                      </p>
                    </div>
                  </div>
                </div>

                {complaint.official_comment && (
                  <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50/50 p-8 rounded-[35px] border-2 border-green-200 relative shadow-inner overflow-hidden group/response">
                    <div className="absolute top-4 right-4 text-5xl opacity-10 group-hover/response:scale-125 group-hover/response:rotate-12 transition-all duration-1000">📢</div>
                    <p className="text-xs text-green-700 font-black uppercase tracking-widest mb-4 relative z-10">الرد الرسمي المعتمد من البلدية</p>
                    <p className="text-base font-black text-gray-800 leading-relaxed relative z-10">
                      {complaint.official_comment}
                    </p>
                  </div>
                )}
              </Section>
            </Card>

            <Card className="!p-10 border-2 border-gray-100 shadow-lg" noPadding>
              <Section
                title="الموقع الجغرافي للبلاغ"
                icon="📍"
              >
                <div className="mb-6">
                  <ComplaintLocationMap
                    lat={complaint.location_lat}
                    lng={complaint.location_lng}
                    title={complaint.title}
                    address={complaint.address}
                  />
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-[30px] border-2 border-blue-200">
                  <p className="text-xs text-blue-700 font-black uppercase tracking-widest mb-2">الإحداثيات الجغرافية</p>
                  <p className="text-sm font-bold text-gray-800">
                    خط العرض: {Number(complaint.location_lat || 0).toFixed(6)} | خط الطول: {Number(complaint.location_lng || 0).toFixed(6)}
                  </p>
                </div>
              </Section>
            </Card>

            <Card className="!p-10 border-2 border-gray-100 shadow-lg" noPadding>
              <Section
                title="المرفقات والتوثيق البصري"
                icon="📸"
                badge={`${complaint.images?.length || 0} ملف رقمي`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {complaint.images && complaint.images.length > 0 ? (
                    complaint.images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 rounded-[35px] overflow-hidden shadow-xl border-4 border-white group cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => window.open(img, '_blank')}
                      >
                        <img
                          src={img}
                          alt={`مرفق ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState
                        title="لا توجد صور توثيقية"
                        description="لم يتم إرفاق ملفات بصرية مع هذا البلاغ"
                      />
                    </div>
                  )}
                </div>
              </Section>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="!p-10 border-2 border-gray-100 shadow-xl relative overflow-hidden" noPadding>
              <div className="absolute top-0 right-0 w-2 h-full bg-primary opacity-30"></div>
              <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                <span>⏱️</span>
                <span>خط تتبع المعالجة</span>
              </h3>
              <div className="space-y-12 relative">
                <div className="absolute top-8 right-[19px] w-1 h-[calc(100%-4rem)] bg-gradient-to-b from-primary/20 to-gray-100 rounded-full"></div>
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative z-10 group">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg flex-shrink-0
                      ${step.active
                        ? 'bg-primary text-white scale-110 shadow-primary/30'
                        : 'bg-gray-100 text-gray-400 scale-100'
                      }
                      group-hover:scale-125 transition-transform
                    `}>
                      {step.active ? (
                        <span className="text-xl font-black">✓</span>
                      ) : (
                        <span className="text-sm font-black">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`font-black text-base uppercase tracking-tight transition-colors duration-300 mb-2 ${step.active ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                        {step.status}
                      </p>
                      <p className={`text-xs font-black uppercase tracking-wider mb-3 ${step.active ? 'text-primary' : 'text-gray-400'
                        }`}>
                        {step.date}
                      </p>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* Modal التعديل */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">تعديل البلاغ</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <Input
                    label="عنوان البلاغ *"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="أدخل عنوان البلاغ"
                    className="!rounded-[20px]"
                  />
                </div>

                <div>
                  <Select
                    label="فئة البلاغ *"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="!rounded-[20px]"
                    options={categories.map((cat) => ({
                      value: cat.id,
                      label: `${cat.icon} ${cat.name}`
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                    وصف البلاغ *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="أدخل وصف مفصل للبلاغ"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-[20px] focus:border-primary focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <Input
                    label="العنوان"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="أدخل العنوان التفصيلي"
                    className="!rounded-[20px]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpdate}
                    isLoading={updating}
                    disabled={updating}
                    className="!rounded-[25px] flex-1"
                  >
                    حفظ التعديلات
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="!rounded-[25px] flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
