import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { SaleInvoice } from '@/types/models';

interface Props {
  invoice: SaleInvoice;
  onClose: () => void;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString();
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function SaleInvoiceDetailModal({ invoice, onClose }: Props) {
  return (
    <Modal isOpen onClose={onClose} title={`Invoice #${invoice.id}`} maxWidth="lg">
      <div className="space-y-5">
        {/* Header info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Date</span>
            <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
          </div>
          <div>
            <span className="text-gray-500">Type</span>
            <p className="mt-0.5">
              {!invoice.onCredit ? (
                <Badge variant="green">Cash</Badge>
              ) : invoice.paidAt ? (
                <Badge variant="green">Credit — Paid</Badge>
              ) : (
                <Badge variant="yellow">Credit — Pending</Badge>
              )}
            </p>
          </div>
          {invoice.paidAt && (
            <div>
              <span className="text-gray-500">Paid at</span>
              <p className="font-medium text-gray-900">{formatDate(invoice.paidAt)}</p>
            </div>
          )}
          {invoice.notes && (
            <div className="col-span-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Line items */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-gray-900">{item.productName ?? `Product #${item.productId}`}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-gray-900">{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
