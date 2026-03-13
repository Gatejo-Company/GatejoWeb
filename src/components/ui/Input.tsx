import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm outline-none transition-colors ${
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
      } disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
      {...props}
    />
  );
}
