import { useEffect } from 'react';
import { StatCard, Card } from '@/components/ui/Card';
import { useDashboardStore } from '@/features/dashboard/store';
import { RecentSalesTable } from '@/features/dashboard/RecentSalesTable';
import { RecentPurchasesTable } from '@/features/dashboard/RecentPurchasesTable';
import { CubeIcon, DocumentTextIcon, ShoppingCartIcon, ClockIcon } from '@heroicons/react/24/outline';

export function DashboardPage() {
  const {
    totalProducts, totalSales, totalPurchases, pendingCreditCount,
    recentSales, recentPurchases, isLoading, fetch,
  } = useDashboardStore();

  useEffect(() => {
    void fetch();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de Productos"
          value={totalProducts}
          icon={<CubeIcon className="w-6 h-6 text-amber-500" />}
          isLoading={isLoading}
          align='center'
        />
        <StatCard
          label="Facturas de Venta"
          value={totalSales}
          icon={<DocumentTextIcon className="w-6 h-6 text-teal-500" />}
          isLoading={isLoading}
          align='center'
        />
        <StatCard
          label="Facturas de Compra"
          value={totalPurchases}
          icon={<ShoppingCartIcon className="w-6 h-6 text-orange-500" />}
          isLoading={isLoading}
          align='center'
        />
        <StatCard
          label="Crédito Pendiente"
          value={pendingCreditCount}
          icon={<ClockIcon className="w-6 h-6 text-rose-500" />}
          isLoading={isLoading}
          align='center'
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900">Ventas Recientes</h2>
          <RecentSalesTable
            invoices={recentSales}
            isLoading={isLoading}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900">Compras Recientes</h2>
          <RecentPurchasesTable
            invoices={recentPurchases}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  );
}
