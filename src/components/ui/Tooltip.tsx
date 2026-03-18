import { useState, type ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ label, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = position === 'top'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2';

  const arrowClasses = position === 'top'
    ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent'
    : 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`absolute z-50 ${positionClasses} pointer-events-none`}>
          <span className="block whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white shadow-lg">
            {label}
          </span>
          <span className={`absolute border-4 ${arrowClasses}`} />
        </span>
      )}
    </span>
  );
}
