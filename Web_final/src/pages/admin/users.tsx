import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { userService, User, CreateUserData } from '@/services/userService';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '' as '' | 'citizen' | 'municipality' | 'admin',
    search: ''
  });
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [municipalitiesByGovernorate, setMunicipalitiesByGovernorate] = useState<{ [key: string]: any[] }>({});
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'citizen',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchMunicipalities();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll({
        role: filters.role || undefined,
        search: filters.search || undefined
      });
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.create(formData);
      toast.success('تم تسجيل المستخدم الجديد بنجاح');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'citizen',
        is_active: true
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تسجيل المستخدم');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    if (currentUser && String(selectedUser.id) === String(currentUser.id)) {
      toast.error('لا يمكنك تعديل حسابك الخاص من هنا. يرجى استخدام صفحة الملف الشخصي');
      return;
    }
    
    try {
      await userService.update(selectedUser.id, formData);
      toast.success('تم تحديث المستخدم بنجاح');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث المستخدم');
    }
  };

  const toggleStatus = async (id: number) => {
    if (currentUser && String(id) === String(currentUser.id)) {
      toast.error('لا يمكنك تعطيل حسابك الخاص');
      return;
    }
    
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;
      await userService.toggleStatus(id, !user.is_active);
      toast.success('تم تحديث حالة الحساب');
      fetchUsers();
    } catch (error: any) {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser && String(id) === String(currentUser.id)) {
      toast.error('لا يمكنك حذف حسابك الخاص');
      return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await userService.delete(id);
      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      toast.error('فشل في حذف المستخدم');
    }
  };

  const openEditModal = (user: User) => {
    if (currentUser && String(user.id) === String(currentUser.id)) {
      toast.error('لا يمكنك تعديل حسابك الخاص من هنا. يرجى استخدام صفحة الملف الشخصي');
      return;
    }
    
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      municipality_id: user.municipality_id,
      is_active: user.is_active,
      national_id: user.national_id,
      governorate: user.governorate
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      header: 'الموظف الرقمي',
      accessor: (user: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/5 shadow-inner">
            {user.name ? user.name[0] : '؟'}
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">{user.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'الدور الوظيفي',
      accessor: (user: any) => (
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
          user.role === 'municipality' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {user.role === 'admin' ? 'مدير نظام' : user.role === 'municipality' ? 'موظف بلدية' : 'مواطن'}
        </span>
      )
    },
    {
      header: 'الجهة المسندة',
      accessor: (user: any) => <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{user.municipality?.name || 'الإدارة العامة'}</span>
    },
    {
      header: 'الحالة الأمنية',
      accessor: (user: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
            {user.is_active ? 'نشط ومصرح' : 'معطل مؤقتاً'}
          </span>
        </div>
      )
    },
    {
      header: 'الإجراءات',
      accessor: (user: User) => {
        const isCurrentUser = currentUser && String(user.id) === String(currentUser.id);
        
        return (
          <div className="flex gap-2">
            {!isCurrentUser ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="!bg-blue-50 !text-primary hover:!bg-primary hover:!text-white" 
                  title="تعديل"
                  onClick={() => openEditModal(user)}
                >
                  ⚙️
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${user.is_active ? '!bg-red-50 !text-red-500 hover:!bg-red-500 hover:!text-white' : '!bg-green-50 !text-green-500 hover:!bg-green-500 hover:!text-white'}`}
                  title={user.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                  onClick={() => toggleStatus(user.id)}
                >
                  {user.is_active ? '🔒' : '🔓'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="!bg-gray-50 !text-gray-500 hover:!bg-gray-500 hover:!text-white" 
                  title="حذف"
                  onClick={() => handleDelete(user.id)}
                >
                  🗑️
                </Button>
              </>
            ) : (
              <span className="text-xs text-gray-400 font-medium px-3 py-1.5 bg-gray-50 rounded-lg">
                حسابك الحالي
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout role="admin">
      <DashboardHeader 
        title="إدارة الكوادر والصلاحيات 👥"
        subtitle="إضافة موظفين جدد، تعيين الأقسام السيادية، وإدارة أدوار النظام الموحد."
        actions={[
          { label: 'إضافة مستخدم جديد', onClick: () => setShowAddModal(true), primary: true, icon: '➕' }
        ]}
      />

      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="بحث"
            placeholder="البحث بالاسم، البريد، أو الهاتف..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            label="الدور"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
            options={[
              { value: '', label: 'الكل' },
              { value: 'citizen', label: 'مواطن' },
              { value: 'municipality', label: 'موظف بلدية' },
              { value: 'admin', label: 'مدير نظام' }
            ]}
          />
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => setFilters({ role: '', search: '' })}
              className="w-full"
            >
              إعادة تعيين
            </Button>
          </div>
        </div>
      </Card>

      <Card title="سجل المستخدمين والموظفين المعمدين" noPadding>
        <DataTable 
          columns={columns as any} 
          data={users} 
          isLoading={loading}
          emptyMessage="لا يوجد موظفين مسجلين في هذا القطاع حالياً"
        />
      </Card>

      
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'citizen',
            is_active: true
          });
        }}
        title="تسجيل مستخدم جديد"
        subtitle="إضافة مستخدم جديد للنظام"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="الاسم الكامل"
              placeholder="الاسم الكامل..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="البريد الإلكتروني"
              placeholder="email@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="رقم الهاتف"
              placeholder="0999999999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="كلمة المرور"
              placeholder="كلمة المرور..."
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          
          <Select
            label="الدور"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: 'citizen', label: 'مواطن' },
              { value: 'municipality', label: 'موظف بلدية' },
              { value: 'admin', label: 'مدير نظام' }
            ]}
            required
          />

          {formData.role === 'municipality' && (
            <Select
              label="البلدية"
              value={formData.municipality_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value ? parseInt(e.target.value) : undefined })}
              options={[
                { value: '', label: 'اختر البلدية' },
                ...municipalities.map(m => ({ value: m.id.toString(), label: m.name }))
              ]}
            />
          )}

          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">
              تأكيد التسجيل
            </Button>
          </div>
        </form>
      </Modal>

      
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="تعديل المستخدم"
        subtitle="تحديث معلومات المستخدم"
      >
        <form onSubmit={handleEditUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="الاسم الكامل"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="كلمة المرور (اتركه فارغاً للاحتفاظ بالقديمة)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <Select
            label="الدور"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: 'citizen', label: 'مواطن' },
              { value: 'municipality', label: 'موظف بلدية' },
              { value: 'admin', label: 'مدير نظام' }
            ]}
            required
          />

          {formData.role === 'municipality' && (
            <Select
              label="البلدية"
              value={formData.municipality_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value ? parseInt(e.target.value) : undefined })}
              options={[
                { value: '', label: 'اختر البلدية' },
                ...(() => {
                  const options: { value: string; label: string }[] = [];
                  Object.keys(municipalitiesByGovernorate).sort().forEach((governorate) => {
                    municipalitiesByGovernorate[governorate]
                      .sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .forEach((m: any) => {
                        options.push({ 
                          value: m.id.toString(), 
                          label: `${governorate} - ${m.name}` 
                        });
                      });
                  });
                  return options;
                })()
              ]}
            />
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <label className="text-sm font-bold">حالة الحساب</label>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
