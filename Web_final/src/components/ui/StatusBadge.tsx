import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '@/types';

interface StatusBadgeProps {
  type: 'status' | 'priority';
  value: ComplaintStatus | ComplaintPriority | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-amber-100 text-amber-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const translateValue = (v: string) => {
    const map: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'processing': 'قيد المعالجة',
      'resolved': 'تم الحل',
      'rejected': 'مرفوض',
      'high': 'عالية',
      'urgent': 'عاجلة',
      'medium': 'متوسطة',
      'low': 'منخفضة',
    };
    return map[v] || v;
  };

  const styles = type === 'status' ? getStatusStyles(value) : getPriorityStyles(value);

  return (
    <span className={`inline-flex items-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-[12px] sm:text-[11px] font-cairo font-bold uppercase tracking-wider sm:tracking-widest whitespace-nowrap ${styles}`}>
      {translateValue(value)}
    </span>
  );
};

