import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

type ValueAlign = 'left' | 'center' | 'right';

const alignClasses: Record<ValueAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  isLoading?: boolean;
  align?: ValueAlign;
}

export function StatCard({ label, value, icon, isLoading = false, align = 'left' }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span>{icon}</span>}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      {isLoading ? (
        <div className={`h-8 w-24 bg-gray-100 rounded animate-pulse ${align === 'right' ? 'ml-auto' : align === 'center' ? 'mx-auto' : ''}`} />
      ) : (
        <p className={`text-3xl font-bold text-gray-900 ${alignClasses[align]}`}>{value}</p>
      )}
    </Card>
  );
}
