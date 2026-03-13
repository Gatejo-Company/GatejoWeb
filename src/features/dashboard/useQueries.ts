import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/endpoints/products';
import { saleInvoicesApi } from '@/api/endpoints/saleInvoices';
import { purchaseInvoicesApi } from '@/api/endpoints/purchaseInvoices';

export function useDashboardStats() {
  const products = useQuery({
    queryKey: ['products', 'count'],
    queryFn: () => productsApi.list({ page: 1, pageSize: 1 }),
  });

  const recentSales = useQuery({
    queryKey: ['sale-invoices', 'recent'],
    queryFn: () => saleInvoicesApi.list({ page: 1, pageSize: 5 }),
  });

  const recentPurchases = useQuery({
    queryKey: ['purchase-invoices', 'recent'],
    queryFn: () => purchaseInvoicesApi.list({ page: 1, pageSize: 5 }),
  });

  const pendingCredit = useQuery({
    queryKey: ['sale-invoices', 'pending-credit', 'count'],
    queryFn: () => saleInvoicesApi.getPendingCredit({ page: 1, pageSize: 1 }),
  });

  return { products, recentSales, recentPurchases, pendingCredit };
}
