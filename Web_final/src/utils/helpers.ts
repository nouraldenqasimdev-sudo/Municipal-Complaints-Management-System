export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const generateTrackingNumber = () => {
  const prefix = "CM25";
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${random}`;
};

export const translateStatus = (status: string) => {
  const statuses: Record<string, string> = {
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'on-hold': 'معلقة',
    'resolved': 'تم الحل',
    'rejected': 'مرفوضة',
    'new': 'جديدة'
  };
  return statuses[status] || status;
};

