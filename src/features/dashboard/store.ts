import { create } from 'zustand';
import { ProductsApi } from '@/api/endpoints/products';
import { SaleInvoicesApi } from '@/api/endpoints/saleInvoices';
import { PurchaseInvoicesApi } from '@/api/endpoints/purchaseInvoices';
import type { SaleInvoice, PurchaseInvoice } from '@/types/models';

interface DashboardStore {
  totalProducts: number;
  totalSales: number;
  recentSales: SaleInvoice[];
  totalPurchases: number;
  recentPurchases: PurchaseInvoice[];
  pendingCreditCount: number;
  isLoading: boolean;

  fetch: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  totalProducts: 0,
  totalSales: 0,
  recentSales: [],
  totalPurchases: 0,
  recentPurchases: [],
  pendingCreditCount: 0,
  isLoading: false,

  async fetch() {
    set({ isLoading: true });
    try {
      const [products, recentSales, recentPurchases, pendingCredit] = await Promise.all([
        ProductsApi.list({ page: 1, pageSize: 1 }),
        SaleInvoicesApi.list({ page: 1, pageSize: 5 }),
        PurchaseInvoicesApi.list({ page: 1, pageSize: 5 }),
        SaleInvoicesApi.getPendingCredit({ page: 1, pageSize: 1 }),
      ]);
      set({
        totalProducts: products.totalCount,
        totalSales: recentSales.totalCount,
        recentSales: recentSales.items,
        totalPurchases: recentPurchases.totalCount,
        recentPurchases: recentPurchases.items,
        pendingCreditCount: pendingCredit.totalCount,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
