import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/layouts/MainLayout';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { complaintService } from '@/services/complaintService';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const MapPicker = dynamic(() => import('@/components/maps/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-[40px] flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">جارٍ تحميل نظام الخرائط الجغرافي...</div>
});

const complaintSchema = z.object({
  category: z.string().min(1, 'يرجى اختيار فئة الشكوى'),
  municipality_id: z.string().min(1, 'يرجى اختيار البلدية المعنية'),
  address: z.string().min(10, 'يرجى إدخال عنوان مفصل (10 أحرف على الأقل)'),
  location: z.object({
    lat: z.number().min(32, 'خطأ في خط العرض').max(37, 'خطأ في خط العرض'),
    lng: z.number().min(35, 'خطأ في خط الطول').max(42, 'خطأ في خط الطول'),
  }).refine((loc) => loc.lat && loc.lng, {
    message: 'يرجى تحديد الموقع على الخريطة'
  }),
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(20, 'يرجى تقديم وصف مفصل (20 حرف على الأقل)'),
  is_anonymous: z.boolean(),
});

type ComplaintForm = z.infer<typeof complaintSchema>;

const categories = [
  { id: 'infrastructure', name: 'خدمات المياه والصرف الصحي', icon: '🚰' },
  { id: 'electricity', name: 'الكهرباء والإنارة العامة', icon: '💡' },
  { id: 'roads', name: 'الطرق والجسور', icon: '🛣️' },
  { id: 'sanitation', name: 'النظافة وجمع النفايات', icon: '🗑️' },
  { id: 'building', name: 'مخالفات البناء', icon: '🏗️' },
  { id: 'other', name: 'أخرى', icon: '📁' },
];

export default function CreateComplaint() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [municipalitiesByGovernorate, setMunicipalitiesByGovernorate] = useState<{ [key: string]: any[] }>({});
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');

  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await api.get('/municipalities');
        const munis = response.data || [];
        setMunicipalities(munis);
        
        const grouped: { [key: string]: any[] } = {};
        munis.forEach((muni: any) => {
          const gov = muni.governorate || 'أخرى';
          if (!grouped[gov]) {
            grouped[gov] = [];
          }
          grouped[gov].push(muni);
        });
        setMunicipalitiesByGovernorate(grouped);

        // Default governorate tab (first one alphabetically) to keep UI predictable
        const govs = Object.keys(grouped).sort();
        if (!selectedGovernorate && govs.length > 0) {
          setSelectedGovernorate(govs[0]);
        }
      } catch (error) {
        console.error('Error fetching municipalities:', error);
      }
    };
    fetchMunicipalities();
  }, [selectedGovernorate]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: '',
      municipality_id: '',
      address: '',
      title: '',
      description: '',
      is_anonymous: false,
      location: { lat: 33.5138, lng: 36.2765 }
    }
  });

  const formData = watch();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('فشل في تحميل الصورة'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('فشل في ضغط الصورة'));
              return;
            }

            if (blob.size > 1 * 1024 * 1024) {
              quality = 0.5;
              canvas.toBlob((smallBlob) => {
                if (!smallBlob) {
                  reject(new Error('فشل في ضغط الصورة'));
                  return;
                }
                const compressedFile = new File([smallBlob], file.name, { type: file.type });
                resolve(compressedFile);
              }, file.type, quality);
            } else {
              const compressedFile = new File([blob], file.name, { type: file.type });
              resolve(compressedFile);
            }
          }, file.type, quality);
        };
        img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الصورة'));
      reader.readAsDataURL(file);
    });
  };

  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(async (file, index) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`الملف ${file.name} ليس صورة`);
      }

      let processedFile = file;
      
      if (file.size > 1 * 1024 * 1024) {
        try {
          toast.loading(`جاري ضغط الصورة ${index + 1}...`, { id: `compressing-${index}` });
          processedFile = await compressImage(file, 1920, 1920, 0.7);
          toast.dismiss(`compressing-${index}`);
          console.log(`✅ Compressed image ${index + 1}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (error) {
          toast.dismiss(`compressing-${index}`);
          throw new Error(`فشل في ضغط الصورة ${index + 1}`);
        }
      }

      if (processedFile.size > 2 * 1024 * 1024) {
        throw new Error(`الصورة ${file.name} كبيرة جداً حتى بعد الضغط (أقصى 2 ميجابايت)`);
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          if (result && result.startsWith('data:image/')) {
            resolve(result);
          } else {
            reject(new Error(`فشل في قراءة الصورة ${index + 1}`));
          }
        };
        reader.onerror = () => reject(new Error(`فشل في قراءة الصورة ${index + 1}`));
        reader.readAsDataURL(processedFile);
      });
    });
    return Promise.all(promises);
  };

  const onSubmit = async (data: ComplaintForm) => {
    console.log('🔵 onSubmit called with data:', data);
    console.log('🔵 Form validation passed, starting submission...');
    
    try {
      if (!data.location || !data.location.lat || !data.location.lng) {
        console.error('❌ Location missing:', data.location);
        toast.error('يرجى تحديد الموقع على الخريطة');
        setStep(2);
        return;
      }

      if (data.location.lat < 32 || data.location.lat > 37 || 
          data.location.lng < 35 || data.location.lng > 42) {
        toast.error('يرجى تحديد موقع صحيح داخل سوريا');
        setStep(2);
        return;
      }

      let images: string[] = [];
      if (attachments.length > 0) {
        toast.loading('جاري معالجة الصور...', { id: 'uploading' });
        try {
          images = await convertImagesToBase64(attachments);
          toast.dismiss('uploading');
        } catch (error) {
          toast.dismiss('uploading');
          toast.error('فشل في معالجة الصور. يرجى المحاولة مرة أخرى');
          return;
        }
      }

      toast.loading('جاري إرسال البلاغ...', { id: 'sending' });
      
      const lat = typeof data.location.lat === 'number' ? data.location.lat : parseFloat(String(data.location.lat));
      const lng = typeof data.location.lng === 'number' ? data.location.lng : parseFloat(String(data.location.lng));
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('خطأ في الإحداثيات. يرجى تحديد الموقع مرة أخرى');
        setStep(2);
        return;
      }

      const municipalityId = parseInt(String(data.municipality_id), 10);
      if (isNaN(municipalityId) || municipalityId <= 0) {
        toast.error('يرجى اختيار بلدية صحيحة');
        setStep(2);
        return;
      }

      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        priority: 'medium',
        location_lat: parseFloat(lat.toFixed(8)),
        location_lng: parseFloat(lng.toFixed(8)),
        address: data.address?.trim() || '',
        municipality_id: municipalityId,
        is_anonymous: Boolean(data.is_anonymous || false),
        images: Array.isArray(images) ? images : []
      };

      if (!payload.location_lat || !payload.location_lng || isNaN(payload.location_lat) || isNaN(payload.location_lng)) {
        toast.error('خطأ في الإحداثيات. يرجى تحديد الموقع مرة أخرى');
        setStep(2);
        return;
      }

      if (!payload.municipality_id || isNaN(payload.municipality_id)) {
        toast.error('يرجى اختيار البلدية');
        setStep(2);
        return;
      }

      console.log('=== إرسال بلاغ جديد ===');
      console.log('البيانات المرسلة:', {
        title: payload.title,
        description: payload.description.substring(0, 50) + '...',
        category: payload.category,
        priority: payload.priority,
        location_lat: payload.location_lat,
        location_lng: payload.location_lng,
        location_lat_type: typeof payload.location_lat,
        location_lng_type: typeof payload.location_lng,
        location_lat_isNaN: isNaN(payload.location_lat),
        location_lng_isNaN: isNaN(payload.location_lng),
        address: payload.address,
        municipality_id: payload.municipality_id,
        municipality_id_type: typeof payload.municipality_id,
        is_anonymous: payload.is_anonymous,
        images_count: images.length,
        images_preview: images.length > 0 ? images.map((img, idx) => ({
          index: idx + 1,
          type: img.substring(0, 20) + '...',
          size: `${(img.length / 1024).toFixed(2)} KB`
        })) : []
      });
      
      if (!payload.location_lat || !payload.location_lng) {
        console.error('❌ خطأ: الإحداثيات مفقودة!', payload);
        toast.error('خطأ في الإحداثيات. يرجى تحديد الموقع مرة أخرى');
        setStep(2);
        return;
      }
      
      const response = await complaintService.create(payload);
      
      console.log('=== استجابة من السيرفر ===');
      const responseData = response as any;
      console.log('البلاغ المُنشأ:', {
        id: response.id,
        title: response.title,
        status: response.status,
        created_at: response.created_at,
        municipality: response.municipality,
        user: response.user,
        images_count: responseData.images_count || 0,
        location: responseData.location || {
          lat: response.location_lat,
          lng: response.location_lng,
          address: response.address
        }
      });

      toast.dismiss('sending');
      toast.success(`تم إرسال بلاغك بنجاح! رقم التتبع: #${response.id}`, {
        duration: 5000,
        icon: '✅'
      });
      
      setTimeout(() => {
        router.push('/citizen/my-complaints');
      }, 1000);
    } catch (error: any) {
      toast.dismiss('sending');
      toast.dismiss('uploading');
      
      console.error('=== خطأ في إرسال البلاغ ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'فشل في إرسال البلاغ، يرجى المحاولة لاحقاً';
      
      console.error('Full error response:', error.response);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          errorMessage = 'يرجى تسجيل الدخول أولاً';
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else if (status === 403) {
          errorMessage = 'غير مصرح لك بهذا الإجراء';
        } else if (status === 422 && errorData.errors) {
          const errors = errorData.errors;
          const errorMessages: string[] = [];
          
          if (errors.location_lat) {
            errorMessages.push(`خط العرض: ${Array.isArray(errors.location_lat) ? errors.location_lat[0] : errors.location_lat}`);
          }
          if (errors.location_lng) {
            errorMessages.push(`خط الطول: ${Array.isArray(errors.location_lng) ? errors.location_lng[0] : errors.location_lng}`);
          }
          if (errors.municipality_id) {
            errorMessages.push(`البلدية: ${Array.isArray(errors.municipality_id) ? errors.municipality_id[0] : errors.municipality_id}`);
          }
          if (errors.title) {
            errorMessages.push(`العنوان: ${Array.isArray(errors.title) ? errors.title[0] : errors.title}`);
          }
          if (errors.description) {
            errorMessages.push(`الوصف: ${Array.isArray(errors.description) ? errors.description[0] : errors.description}`);
          }
          if (errors.category) {
            errorMessages.push(`الفئة: ${Array.isArray(errors.category) ? errors.category[0] : errors.category}`);
          }
          
          errorMessage = errorMessages.length > 0 
            ? `يرجى تصحيح الأخطاء التالية:\n${errorMessages.join('\n')}`
            : errorData.message || 'يرجى التحقق من جميع الحقول';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line'
        }
      });
      
      if (errorMessage.includes('إحداثيات') || errorMessage.includes('موقع') || errorMessage.includes('location')) {
        setStep(2);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">اختر نوع البلاغ</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                حدد القطاع الخدمي الذي ينتمي إليه بلاغك لتسهيل عملية المعالجة
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setValue('category', cat.id); nextStep(); }}
                  className={`p-10 rounded-[45px] border-2 transition-all duration-500 text-center group hover:border-primary hover:bg-blue-50/30 ${formData.category === cat.id ? 'border-primary bg-blue-50 shadow-2xl shadow-blue-100 scale-[1.02]' : 'border-gray-50 bg-gray-50/20'}`}
                >
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform grayscale-0 group-hover:grayscale-0">{cat.icon}</div>
                  <div className="font-black text-sm text-gray-800 tracking-tight uppercase">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">حدد موقع المشكلة</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                اختر البلدية المعنية وحدد الموقع الدقيق على الخريطة لضمان الوصول السريع للمشكلة
              </p>
            </div>
            <div className="space-y-8">
              {/* Governorate tabs (quick filter) */}
              {Object.keys(municipalitiesByGovernorate).length > 0 && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-2">
                    اختر المحافظة
                  </label>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {Object.keys(municipalitiesByGovernorate)
                      .sort()
                      .map((gov) => {
                        const active = gov === selectedGovernorate;
                        return (
                          <button
                            key={gov}
                            type="button"
                            onClick={() => {
                              setSelectedGovernorate(gov);
                              setValue('municipality_id', '');
                            }}
                            className={`shrink-0 px-5 py-3 rounded-full border-2 font-cairo font-bold text-sm transition-all ${
                              active
                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'
                            }`}
                          >
                            {gov}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <Select
                {...register('municipality_id')}
                label="البلدية أو مجلس المدينة المعني"
                options={(() => {
                  const options: { value: string | number; label: string }[] = [];

                  // If a governorate is selected, show only its municipalities (cleaner UX).
                  if (selectedGovernorate && municipalitiesByGovernorate[selectedGovernorate]) {
                    municipalitiesByGovernorate[selectedGovernorate]
                      .sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .forEach((m: any) => options.push({ value: m.id, label: m.name }));
                    return options;
                  }

                  // Fallback (should be rare): show all grouped with governorate prefix
                  Object.keys(municipalitiesByGovernorate)
                    .sort()
                    .forEach((governorate) => {
                      municipalitiesByGovernorate[governorate]
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .forEach((m: any) => {
                          options.push({
                            value: m.id,
                            label: `${governorate} - ${m.name}`,
                          });
                        });
                    });

                  return options;
                })()}
                error={errors.municipality_id?.message}
              />
              <Input
                {...register('address')}
                label="العنوان التفصيلي الدقيق"
                placeholder="اسم الشارع، رقم البناء، علامات مميزة قريبة..."
                error={errors.address?.message}
              />
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-2">
                  تحديد الموقع عبر نظام GPS
                  {formData.location && formData.location.lat && formData.location.lng && (
                    <span className="text-green-600 mr-2">✓ تم التحديد</span>
                  )}
                </label>
                <div className="rounded-[45px] overflow-hidden border-4 border-gray-50 shadow-2xl relative">
                  <MapPicker 
                    onLocationSelect={(lat, lng) => {
                      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                        console.log('Location selected:', lat, lng);
                        setValue('location', { lat, lng }, { shouldValidate: true, shouldDirty: true });
                        toast.success(`تم تحديد الموقع: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, { 
                          duration: 2000,
                          icon: '📍'
                        });
                      }
                    }} 
                  />
                </div>
                {formData.location && formData.location.lat && formData.location.lng && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-cairo font-bold text-green-700 mb-1">
                      ✓ تم تحديد الموقع بنجاح
                    </p>
                    <p className="text-xs font-cairo font-semibold text-green-600">
                      📍 الإحداثيات: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
                {(!formData.location || !formData.location.lat || !formData.location.lng) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-cairo font-bold text-amber-700">
                      ⚠️ يرجى النقر على الخريطة لتحديد موقع المشكلة
                    </p>
                  </div>
                )}
                {errors.location && (
                  <p className="text-red-500 text-xs font-cairo font-bold mt-2">
                    {errors.location.message || 'يرجى تحديد الموقع على الخريطة'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-16 gap-6">
              <Button type="button" onClick={prevStep} variant="outline" size="lg" className="flex-1 !rounded-[22px]">العودة للخلف</Button>
              <Button 
                type="button" 
                onClick={() => {
                  if (!formData.location || !formData.location.lat || !formData.location.lng) {
                    toast.error('يرجى تحديد الموقع على الخريطة أولاً');
                    return;
                  }
                  if (!formData.municipality_id) {
                    toast.error('يرجى اختيار البلدية');
                    return;
                  }
                  if (!formData.address || formData.address.length < 10) {
                    toast.error('يرجى إدخال عنوان مفصل (10 أحرف على الأقل)');
                    return;
                  }
                  nextStep();
                }} 
                size="lg" 
                className="flex-[2] !rounded-[22px]" 
                rightIcon={<span className="text-2xl">←</span>}
              >
                الخطوة التالية
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">وصف المشكلة بالتفصيل</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                قدم وصفاً واضحاً ومفصلاً للمشكلة لمساعدة الفريق الميداني على فهمها والاستجابة بسرعة
              </p>
            </div>
            <div className="space-y-8">
              <Input
                {...register('title')}
                label="عنوان البلاغ (مختصر ومعبر)"
                placeholder="مثلاً: كسر في خط المياه الرئيسي بحي المزة..."
                error={errors.title?.message}
              />
              <Input
                {...register('description')}
                multiline
                rows={8}
                label="وصف تفصيلي للمشكلة والاحتياجات"
                placeholder="يرجى كتابة كافة التفاصيل الفنية التي تساعد الفريق الحكومي على الاستجابة السريعة..."
                error={errors.description?.message}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-16 gap-6">
              <Button type="button" onClick={prevStep} variant="outline" size="lg" className="flex-1 !rounded-[22px]">العودة للخلف</Button>
              <Button 
                type="button" 
                onClick={() => {
                  if (!formData.title || formData.title.length < 5) {
                    toast.error('يرجى إدخال عنوان البلاغ (5 أحرف على الأقل)');
                    return;
                  }
                  if (!formData.description || formData.description.length < 20) {
                    toast.error('يرجى إدخال وصف مفصل (20 حرف على الأقل)');
                    return;
                  }
                  nextStep();
                }} 
                size="lg" 
                className="flex-[2] !rounded-[22px]" 
                rightIcon={<span className="text-2xl">←</span>}
              >
                الخطوة التالية
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">إرفاق الصور والوثائق</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                أرفق صوراً توثيقية للمشكلة إن أمكن ذلك لتسريع عملية المعاينة والمعالجة (اختياري)
              </p>
            </div>
            <div 
              className="border-4 border-dashed border-gray-100 rounded-[60px] p-24 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group relative shadow-inner overflow-hidden" 
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-primary"></div>
              <input
                id="file-upload"
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files).slice(0, 3);
                    const validFiles: File[] = [];
                    
                    files.forEach((file) => {
                      if (!file.type.startsWith('image/')) {
                        toast.error(`الملف ${file.name} ليس صورة`);
                        return;
                      }
                      
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error(`الملف ${file.name} أكبر من 5 ميجابايت`);
                        return;
                      }
                      
                      validFiles.push(file);
                    });
                    
                    if (validFiles.length > 0) {
                      setAttachments(validFiles);
                      toast.success(`تم رفع ${validFiles.length} صورة بنجاح`);
                    }
                  }
                }}
              />
              <div className="text-9xl mb-10 group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">📸</div>
              <p className="text-gray-900 font-black text-2xl tracking-tighter uppercase mb-4">انقر هنا لرفع الصور التوثيقية</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
                يمكنك رفع حتى 3 صور بدقة عالية لتسريع عملية المعاينة <br/> (حد أقصى 5 ميجابايت لكل ملف)
              </p>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-cairo font-bold text-green-600">
                  ✓ تم رفع {attachments.length} صورة بنجاح
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {attachments.map((file, i) => {
                    const imageUrl = URL.createObjectURL(file);
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    return (
                      <div key={i} className="relative group">
                        <img 
                          src={imageUrl} 
                          alt={`صورة ${i + 1}`}
                          className="w-full h-48 object-cover rounded-[25px] border-2 border-primary/10 shadow-xl"
                          onError={(e) => {
                            console.error('Error loading image:', file.name);
                            toast.error(`فشل في تحميل الصورة: ${file.name}`);
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setAttachments(attachments.filter((_, idx) => idx !== i));
                            URL.revokeObjectURL(imageUrl);
                            toast.success('تم حذف الصورة');
                          }}
                          className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-cairo font-bold">
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </div>
                        <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-lg font-cairo font-bold">
                          {fileSizeMB} MB
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between mt-16 gap-6">
              <Button type="button" onClick={prevStep} variant="outline" size="lg" className="flex-1 !rounded-[22px]">العودة للخلف</Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                size="lg" 
                className="flex-[2] !rounded-[22px]" 
                rightIcon={<span className="text-2xl">←</span>}
              >
                مراجعة البلاغ النهائي
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">مراجعة البلاغ النهائي</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
                راجع جميع البيانات المدخلة وتأكد من صحتها قبل إرسال البلاغ للحصول على رقم تتبع فوري
              </p>
            </div>
            
            <div className="bg-gray-900 p-12 rounded-[50px] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">القطاع الخدمي</span>
                <span className="font-black text-primary text-sm bg-white/5 px-6 py-2 rounded-xl border border-white/5">{categories.find(c => c.id === formData.category)?.name}</span>
              </div>
              <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">الموقع الموثق</span>
                <div className="text-left max-w-[250px]">
                  <span className="font-black text-gray-200 text-sm leading-relaxed block mb-1">
                    {municipalities.find(m => m.id.toString() === formData.municipality_id.toString())?.name || 'غير محدد'}
                  </span>
                  <span className="font-semibold text-gray-400 text-xs leading-relaxed block mb-1">
                    {formData.address || 'غير محدد'}
                  </span>
                  {formData.location && formData.location.lat && formData.location.lng && (
                    <span className="font-mono text-gray-500 text-xs">
                      📍 {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">موضوع البلاغ</span>
                <span className="font-black text-gray-200 text-sm text-left max-w-[250px]">{formData.title}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">الوصف</span>
                <span className="font-semibold text-gray-300 text-xs text-left max-w-[250px] leading-relaxed line-clamp-3">{formData.description}</span>
              </div>
              {attachments.length > 0 && (
                <div className="flex justify-between items-center border-t border-white/5 pt-6">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">المرفقات</span>
                  <span className="font-black text-green-400 text-sm">✓ {attachments.length} صورة مرفقة</span>
                </div>
              )}
            </div>

            <div className="p-8 bg-amber-50 rounded-[35px] border border-amber-100 flex gap-6 items-start shadow-inner">
              <span className="text-4xl">⚠️</span>
              <div className="space-y-2">
                <p className="text-[11px] text-amber-900 leading-relaxed font-black uppercase tracking-widest">تحذير قانوني رسمي</p>
                <p className="text-xs text-amber-800/80 leading-relaxed font-bold italic">
                  تقديم بلاغات مضللة أو معلومات غير دقيقة يترتب عليه مسؤولية قانونية كاملة. يرجى التأكد من مصداقية البلاغ الميداني لضمان عدم إهدار الموارد الحكومية.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-6 p-8 bg-white border-2 border-gray-100 rounded-[40px] cursor-pointer hover:border-primary/30 transition-all group shadow-sm hover:shadow-xl">
              <input type="checkbox" {...register('is_anonymous')} className="w-8 h-8 rounded-xl border-gray-200 text-primary focus:ring-primary cursor-pointer shadow-inner" />
              <div>
                <p className="text-lg font-black text-gray-800 tracking-tight uppercase">تقديم البلاغ كـ "مواطن مجهول"</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">لن تظهر هويتك للموظفين الميدانيين أو فريق الاستجابة (اختياري)</p>
              </div>
            </label>

            <div className="flex flex-col sm:flex-row justify-between mt-16 gap-6">
              <Button type="button" onClick={prevStep} variant="outline" size="lg" className="flex-1 !rounded-[25px]">تعديل البيانات</Button>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                disabled={isSubmitting}
                size="xl" 
                className={`flex-[2] !rounded-[25px] shadow-[0_30px_60px_-10px_rgba(22,163,74,0.4)] ${isSubmitting ? '' : 'bg-green-600 hover:bg-green-700'}`}
                rightIcon={<span className="text-3xl">🚀</span>}
                onClick={(e) => {
                  console.log('🔵 Submit button clicked');
                  console.log('🔵 Form data:', formData);
                  console.log('🔵 Is submitting:', isSubmitting);
                  console.log('🔵 Form errors:', errors);
                }}
              >
                تأكيد وإرسال البلاغ الميداني الآن
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="mb-16">
          <div className="flex justify-between mb-8 bg-gray-50 p-2.5 rounded-[25px] border border-gray-100 shadow-inner">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex-1 h-4 rounded-2xl mx-1 transition-all duration-1000 ${step >= i ? 'bg-primary shadow-xl shadow-blue-200 scale-y-110' : 'bg-white'}`}></div>
            ))}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-5">تقديم بلاغ خدمي ميداني جديد</h1>
          <p className="text-gray-600 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
            ساهم في تحسين خدمات بلديتك من خلال تقديم بلاغاتك بكل سهولة وأمان. 
            نظامنا الرقمي الموحد يضمن وصول صوتك للجهات المعنية بأسرع وقت.
          </p>
        </div>

        <Card className="!p-12 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] border-none relative overflow-hidden group" noPadding>
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-br-[150px] -ml-24 -mt-24 transition-all duration-1000 group-hover:scale-110"></div>
          
          <form 
            onSubmit={(e) => {
              console.log('🟢 Form submit event triggered');
              handleSubmit(onSubmit)(e);
            }} 
            className="relative z-10"
          >
            {renderStep()}
          </form>
        </Card>
        
        <div className="mt-16 flex items-center justify-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-50 grayscale hover:grayscale-0 transition-all">
           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">🛡️</div>
           <span>نظام معالجة بلاغات مشفر وآمن بالكامل (END-TO-END ENCRYPTED)</span>
        </div>
      </div>
    </MainLayout>
  );
}
