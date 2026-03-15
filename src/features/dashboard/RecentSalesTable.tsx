import { Link } from 'react-router';
import type { SaleInvoice } from '@/types/models';
import { Badge } from '@/components/ui/Badge';

interface RecentSalesTableProps {
  invoices: SaleInvoice[];
  isLoading: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function RecentSalesTable({ invoices, isLoading }: RecentSalesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return <p className="text-sm text-gray-400 mt-4">Sin ventas aún.</p>;
  }

  return (
    <table className="w-full mt-4 text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
          <th className="pb-2 font-medium">ID</th>
          <th className="pb-2 font-medium">Fecha</th>
          <th className="pb-2 font-medium">Total</th>
          <th className="pb-2 font-medium">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {invoices.map((inv) => (
          <tr key={inv.id} className="hover:bg-gray-50">
            <td className="py-2">
              <Link
                to={`/sale-invoices`}
                className="text-indigo-600 hover:underline font-mono text-xs"
              >
                #{inv.id}
              </Link>
            </td>
            <td className="py-2 text-gray-600">{formatDate(inv.date)}</td>
            <td className="py-2 font-medium">{formatCurrency(inv.total)}</td>
            <td className="py-2">
              {inv.onCredit ? (
                inv.paidAt ? (
                  <Badge variant="green">Pagado</Badge>
                ) : (
                  <Badge variant="yellow">Crédito</Badge>
                )
              ) : (
                <Badge variant="green">Contado</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
