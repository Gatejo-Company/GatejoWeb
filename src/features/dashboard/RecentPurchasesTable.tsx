import type { PurchaseInvoice } from '@/types/models';
import { Badge } from '@/components/ui/Badge';

interface RecentPurchasesTableProps {
  invoices: PurchaseInvoice[];
  isLoading: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function RecentPurchasesTable({ invoices, isLoading }: RecentPurchasesTableProps) {
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
    return <p className="text-sm text-gray-400 mt-4">Sin compras aún.</p>;
  }

  return (
    <div className="overflow-x-auto mt-4"><table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
          <th className="pb-2 font-medium">ID</th>
          <th className="pb-2 font-medium">Proveedor</th>
          <th className="pb-2 font-medium">Fecha</th>
          <th className="pb-2 font-medium">Total</th>
          <th className="pb-2 font-medium">Pagado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {invoices.map((inv) => (
          <tr key={inv.id} className="hover:bg-gray-50">
            <td className="py-2 font-mono text-xs text-gray-500">#{inv.id}</td>
            <td className="py-2 text-gray-700">{inv.supplierName ?? `Supplier ${inv.supplierId}`}</td>
            <td className="py-2 text-gray-600">{formatDate(inv.date)}</td>
            <td className="py-2 font-medium">{formatCurrency(inv.total)}</td>
            <td className="py-2">
              {inv.paid >= inv.total ? (
                <Badge variant="green">$$$ Pagado</Badge>
              ) : inv.paid > 0 ? (
                <Badge variant="yellow">$$ Parcial</Badge>
              ) : (
                <Badge variant="red">$ Sin pagar</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}
