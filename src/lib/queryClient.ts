import { QueryClient } from '@tanstack/react-query';
import type { AppError } from '@/api/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: (count, error) => {
        const appError = error as unknown as AppError;
        if (appError?.status === 401 || appError?.status === 403) return false;
        if (appError?.status === 404) return false;
        return count < 2;
      },
    },
  },
});
