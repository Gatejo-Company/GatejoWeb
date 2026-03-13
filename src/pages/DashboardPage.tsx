import { StatCard, Card } from '@/components/ui/Card';
import { useDashboardStats } from '@/features/dashboard/useQueries';
import { RecentSalesTable } from '@/features/dashboard/RecentSalesTable';
import { RecentPurchasesTable } from '@/features/dashboard/RecentPurchasesTable';

export function DashboardPage() {
  const { products, recentSales, recentPurchases, pendingCredit } = useDashboardStats();

  const totalProducts = products.data?.totalCount ?? 0;
  const totalSales = recentSales.data?.totalCount ?? 0;
  const totalPurchases = recentPurchases.data?.totalCount ?? 0;
  const pendingCreditCount = pendingCredit.data?.totalCount ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon="📦"
          isLoading={products.isLoading}
        />
        <StatCard
          label="Sale Invoices"
          value={totalSales}
          icon="🧾"
          isLoading={recentSales.isLoading}
        />
        <StatCard
          label="Purchase Invoices"
          value={totalPurchases}
          icon="🛒"
          isLoading={recentPurchases.isLoading}
        />
        <StatCard
          label="Pending Credit"
          value={pendingCreditCount}
          icon="⏳"
          isLoading={pendingCredit.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900">Recent Sales</h2>
          <RecentSalesTable
            invoices={recentSales.data?.items ?? []}
            isLoading={recentSales.isLoading}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900">Recent Purchases</h2>
          <RecentPurchasesTable
            invoices={recentPurchases.data?.items ?? []}
            isLoading={recentPurchases.isLoading}
          />
        </Card>
      </div>
    </div>
  );
}
