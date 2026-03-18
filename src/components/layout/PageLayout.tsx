import type { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, action, children }: PageLayoutProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
