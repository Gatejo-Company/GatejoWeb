import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { CheckCircleIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/20/solid';
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
    <Modal isOpen onClose={onClose} title={`Factura #${invoice.id}`} maxWidth="lg">
      <div className="space-y-5">
        {/* Header info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Fecha</span>
            <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipo</span>
            <p className="mt-0.5">
              {!invoice.onCredit ? (
                <Tooltip label="Contado"><Badge variant="green"><BanknotesIcon className="w-4 h-4 inline" /></Badge></Tooltip>
              ) : invoice.paidAt ? (
                <Tooltip label="Crédito — Pagado"><Badge variant="green"><CheckCircleIcon className="w-4 h-4 inline" /></Badge></Tooltip>
              ) : (
                <Tooltip label="Crédito — Pendiente"><Badge variant="yellow"><ClockIcon className="w-4 h-4 inline" /></Badge></Tooltip>
              )}
            </p>
          </div>
          {invoice.paidAt && (
            <div>
              <span className="text-gray-500">Pagado el</span>
              <p className="font-medium text-gray-900">{formatDate(invoice.paidAt)}</p>
            </div>
          )}
          {invoice.notes && (
            <div className="col-span-2">
              <span className="text-gray-500">Notas</span>
              <p className="font-medium text-gray-900">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Line items */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Artículos</h3>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-right">Cant.</th>
                  <th className="px-4 py-2 text-right">Precio Unitario</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-gray-900">{item.productName ?? `Producto #${item.productId}`}</td>
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
