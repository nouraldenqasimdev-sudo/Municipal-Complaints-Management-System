import React, { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'الصرف الصحي', icon: '🚰', status: 'نشط' },
    { id: 2, name: 'الإنارة العامة', icon: '💡', status: 'نشط' },
    { id: 3, name: 'تراكم النفايات', icon: '🗑️', status: 'نشط' },
    { id: 4, name: 'مخالفات البناء', icon: '🏗️', status: 'نشط' },
    { id: 5, name: 'الطرق والجسور', icon: '🛣️', status: 'نشط' },
  ]);

  const handleSave = () => {
    toast.success('تم حفظ التغييرات في إعدادات النظام بنجاح.');
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إعدادات وتهيئة النظام ⚙️</h1>
          <p className="text-gray-500 mt-2">تخصيص الخيارات العامة، تعريف الفئات، وربط خوادم التنبيهات.</p>
        </div>
        <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          حفظ كافة التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-4 mb-6 flex items-center gap-2">
              <span>📁</span> تعريف فئات الشكاوى
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-primary hover:text-primary transition-all">
                <span>➕</span> إضافة فئة جديدة
              </button>
            </div>
          </div>

          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-4 mb-6 flex items-center gap-2">
              <span>📲</span> إعدادات خادم الرسائل القصيرة (SMS Gateway)
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">مزود الخدمة (Provider)</label>
                  <select className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold outline-none">
                    <option>Syriatel SMS API</option>
                    <option>MTN Gateway</option>
                    <option>Twilio Global</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">مفتاح الربط (API Key)</label>
                  <input type="password" defaultValue="••••••••••••••••" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-blue-800">حالة الربط: متصل ويعمل</span>
                </div>
                <button className="text-[10px] bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm">اختبار الإرسال</button>
              </div>
            </div>
          </div>

          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-4 mb-6 flex items-center gap-2">
              <span>📝</span> قوالب الردود الجاهزة
            </h3>
            <div className="space-y-4">
              {[
                { title: 'تأكيد الاستلام', content: 'نشكر تواصلك معنا، تم استلام بلاغك برقم {id} وسيتم العمل عليه...' },
                { title: 'تم الحل بنجاح', content: 'يسعدنا إعلامك بأنه تم الانتهاء من معالجة بلاغك {id} بنجاح...' },
              ].map((tpl, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl relative group">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">{tpl.title}</h4>
                  <p className="text-xs text-gray-500 italic">{tpl.content}</p>
                  <button className="absolute left-4 top-4 text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">تعديل القالب</button>
                </div>
              ))}
                    <button className="text-xs text-primary font-bold">تعديل</button>
                    <button className="text-xs text-red-500 font-bold">حذف</button>
              <button className="text-xs text-primary font-bold">+ إضافة قالب جديد</button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <span>🏢</span> الهوية والبيانات العامة
            </h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">اسم المؤسسة</label>
              <input className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold outline-none" defaultValue="وزارة الإدارة المحلية والبيئة" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">شعار المؤسسة</label>
              <div className="w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold bg-gray-50">
                انقر لتغيير الشعار
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs font-bold text-gray-700">تفعيل الإغلاق التلقائي (بعد 7 أيام)</span>
              <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          
          <div className="bg-gray-900 p-8 rounded-3xl text-white">
            <h3 className="font-bold text-lg mb-4">النسخ الاحتياطي 💾</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">آخر نسخة احتياطية تمت بنجاح: اليوم الساعة 04:00 فجراً.</p>
            <div className="space-y-3">
              <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-all">أخذ نسخة الآن</button>
              <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-all">تحميل آخر نسخة</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
