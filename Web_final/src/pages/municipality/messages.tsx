import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const messages = [
  { 
    id: 1, 
    sender: 'م. خالد الأحمد (رئيس قسم المياه والصرف الصحي)', 
    text: 'يرجى مراجعة شكوى الصرف الصحي في حي الميدان فوراً. البلاغ رقم 12 يتطلب تدخل عاجل بسبب فيضان المياه.', 
    time: 'منذ 10 دقائق', 
    unread: true,
    category: 'urgent',
    icon: '🚨'
  },
  { 
    id: 2, 
    sender: 'الفريق الفني للإنارة', 
    text: 'تم تأمين قطع الغيار المطلوبة لشبكة الإنارة في منطقة الشعلان. يمكنكم البدء بعملية الاستبدال.', 
    time: 'منذ ساعة', 
    unread: false,
    category: 'info',
    icon: '💡'
  },
  { 
    id: 3, 
    sender: 'الإدارة العامة للبلدية', 
    text: 'تذكير: موعد اجتماع تقييم الأداء الشهري غداً الساعة 10 صباحاً في القاعة الرئيسية. يرجى الحضور مع التقرير الشهري.', 
    time: 'منذ 3 ساعات', 
    unread: false,
    category: 'reminder',
    icon: '📅'
  },
  { 
    id: 4, 
    sender: 'م. فاطمة الكردي (مديرة قسم النظافة)', 
    text: 'تم استلام البلاغ رقم 18 بخصوص تراكم النفايات في حي المزة. سيتم إرسال فريق الجمع خلال الساعات القادمة.', 
    time: 'منذ 5 ساعات', 
    unread: false,
    category: 'update',
    icon: '🗑️'
  },
  { 
    id: 5, 
    sender: 'قسم الطرق والجسور', 
    text: 'تم الانتهاء من إصلاح الحفر في شارع المطار القديم. يمكنكم إبلاغ المواطن صاحب البلاغ رقم 22.', 
    time: 'منذ يوم', 
    unread: false,
    category: 'completed',
    icon: '🛣️'
  },
];

export default function InternalMessages() {
  return (
    <DashboardLayout role="municipality">
      <DashboardHeader 
        title="مركز التواصل الداخلي 💬"
        subtitle="تواصل مباشر مع الفرق الميدانية والإدارة العامة لمتابعة البلاغات والأنشطة."
        actions={[
          { label: 'رسالة جديدة', primary: true, icon: '✉️' }
        ]}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {messages.map((msg) => (
          <Card 
            key={msg.id} 
            className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl ${
              msg.unread ? 'border-2 border-primary/30 bg-blue-50/30 shadow-md' : 'border border-gray-100 shadow-sm'
            }`}
            noPadding
          >
            <div className={`absolute top-0 right-0 w-1 h-full ${
              msg.category === 'urgent' ? 'bg-red-500' :
              msg.category === 'info' ? 'bg-blue-500' :
              msg.category === 'reminder' ? 'bg-amber-500' :
              msg.category === 'update' ? 'bg-green-500' :
              'bg-gray-400'
            } opacity-20 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="p-6 lg:p-8">
              <div className="flex gap-6 items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ${
                  msg.category === 'urgent' ? 'bg-red-100 text-red-600' :
                  msg.category === 'info' ? 'bg-blue-100 text-blue-600' :
                  msg.category === 'reminder' ? 'bg-amber-100 text-amber-600' :
                  msg.category === 'update' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                } group-hover:scale-110 transition-transform`}>
                  {msg.icon}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 text-base lg:text-lg mb-1 group-hover:text-primary transition-colors">
                        {msg.sender}
                      </h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        msg.category === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' :
                        msg.category === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        msg.category === 'reminder' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        msg.category === 'update' ? 'bg-green-50 text-green-600 border border-green-100' :
                        'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}>
                        {msg.category === 'urgent' ? 'عاجل' :
                         msg.category === 'info' ? 'معلومة' :
                         msg.category === 'reminder' ? 'تذكير' :
                         msg.category === 'update' ? 'تحديث' :
                         'عام'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {msg.unread && (
                        <span className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></span>
                      )}
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed font-medium">
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

