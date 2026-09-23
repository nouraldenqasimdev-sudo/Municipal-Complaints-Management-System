import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="text-9xl font-black text-primary/10 mb-4 tracking-tighter">404</div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">عذراً، الصفحة غير موجودة!</h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          يبدو أنك سلكت طريقاً خاطئاً. الصفحة التي تبحث عنها غير متاحة حالياً أو تم نقلها.
        </p>
        <Link href="/" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
          العودة للرئيسية
        </Link>
        <div className="mt-12 flex justify-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-600"></div>
           <div className="w-2 h-2 rounded-full bg-black"></div>
           <div className="w-2 h-2 rounded-full bg-green-600"></div>
        </div>
      </div>
    </div>
  );
}

