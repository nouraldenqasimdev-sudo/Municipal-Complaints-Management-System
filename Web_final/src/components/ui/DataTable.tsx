import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = "لا توجد بيانات حالياً"
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-cairo font-bold">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 sm:mx-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <div className="min-w-full inline-block align-middle">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 text-gray-600 sm:text-gray-500 text-[12px] sm:text-[11px] font-cairo font-black uppercase tracking-wider sm:tracking-widest sticky top-0 z-10">
            <tr>
              {columns.map((column, idx) => (
                <th key={idx} className={`p-4 sm:p-5 lg:p-6 whitespace-nowrap ${column.className || ''}`}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-gray-50/80 active:bg-gray-100 transition-colors duration-200 group ${onRowClick ? 'cursor-pointer touch-manipulation' : ''}`}
              >
                {columns.map((column, idx) => (
                  <td key={idx} className={`p-4 sm:p-5 lg:p-6 font-cairo text-gray-700 ${column.className || ''}`}>
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as unknown as React.ReactNode)}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
              <td colSpan={columns.length} className="p-12 sm:p-16 lg:p-20 text-center">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-5 opacity-20">📥</div>
                <p className="font-cairo font-black text-base sm:text-lg text-gray-600">{emptyMessage}</p>
              </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

