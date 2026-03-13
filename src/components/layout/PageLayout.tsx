import type { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, action, children }: PageLayoutProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
