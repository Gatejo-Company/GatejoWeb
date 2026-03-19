import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { usePagination } from '@/hooks/usePagination';
import { CheckCircleIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/20/solid';
import { useAuth } from '@/features/auth/AuthContext';
import { useSaleInvoiceStore } from '@/features/sale-invoices/store';
import { useToast } from '@/components/ui/Toast';
import { SaleInvoiceForm } from '@/features/sale-invoices/SaleInvoiceForm';
import { SaleInvoiceDetailModal } from '@/features/sale-invoices/SaleInvoiceDetailModal';
import type { SaleInvoice } from '@/types/models';

function formatDate(s: string) { return new Date(s).toLocaleDateString(); }
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function SaleInvoicesPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [reversingInvoice, setReversingInvoice] = useState<SaleInvoice | null>(null);
  const [filterOnCredit, setFilterOnCredit] = useState('');
  const [filterPaid, setFilterPaid] = useState('');

  const { data, isLoading, isPaying, isReversing, fetch, pay, reverse } = useSaleInvoiceStore();

  useEffect(() => {
    void fetch({
      page: pagination.page,
      pageSize: pagination.pageSize,
      onCredit: filterOnCredit === '' ? undefined : filterOnCredit === 'true',
      paid: filterPaid === '' ? undefined : filterPaid === 'true',
    });
  }, [pagination.page, pagination.pageSize, filterOnCredit, filterPaid]);

  const handleReverse = (inv: SaleInvoice) => setReversingInvoice(inv);

  const handlePay = async (id: number) => {
    try {
      await pay(id);
      toast.success('Invoice marked as paid');
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  const handleReverseConfirm = async (id: number) => {
    try {
      await reverse(id);
      toast.success('Factura de anulación generada');
    } catch {
      toast.error('Error al anular la factura');
    }
  };

  const columns: Column<SaleInvoice>[] = [
    { key: 'id', header: 'ID', render: (inv) => <span className="font-mono text-xs text-gray-400">#{inv.id}</span> },
    { key: 'date', header: 'Fecha', render: (inv) => formatDate(inv.date) },
    {
      key: 'items',
      header: 'Artículos',
      render: (inv) => <span className="text-gray-500">{inv.items?.length ?? 0} artículo(s)</span>,
    },
    { key: 'total', header: 'Total', render: (inv) => <span className="font-mono font-medium">{formatCurrency(inv.total)}</span> },
    {
      key: 'status',
      header: 'Estado',
      render: (inv) => {
        if (!inv.onCredit) return <Tooltip label="Contado"><Badge variant="green"><BanknotesIcon className="w-4 h-4 inline" /></Badge></Tooltip>;
        return inv.paidAt
          ? <Tooltip label="Pagado"><Badge variant="green"><CheckCircleIcon className="w-4 h-4 inline" /></Badge></Tooltip>
          : <Tooltip label="Crédito Pendiente"><Badge variant="yellow"><ClockIcon className="w-4 h-4 inline" /></Badge></Tooltip>;
      },
    },
    {
      key: '_detail',
      header: '',
      render: (inv: SaleInvoice) => (
        <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(inv)}>
          Ver detalle
        </Button>
      ),
    } satisfies Column<SaleInvoice>,
    ...(isAdmin()
      ? [
          {
            key: '_actions',
            header: 'Acciones',
            render: (inv: SaleInvoice) => (
              <div className="flex gap-2">
                {inv.onCredit && !inv.paidAt && (
                  <Button size="sm" variant="secondary" onClick={() => void handlePay(inv.id)} isLoading={isPaying}>
                    Marcar Pagado
                  </Button>
                )}
                {!inv.reversed && (
                  <Button size="sm" variant="danger" onClick={() => handleReverse(inv)} isLoading={isReversing}>
                    Anular
                  </Button>
                )}
              </div>
            ),
          } satisfies Column<SaleInvoice>,
        ]
      : []),
  ];

  return (
    <PageLayout
      title="Facturas de Venta"
      action={isAdmin() ? <Button onClick={() => setIsFormOpen(true)}>+ Nueva Factura</Button> : undefined}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterOnCredit}
          onChange={(e) => { setFilterOnCredit(e.target.value); pagination.reset(); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Todos los tipos</option>
          <option value="false">Contado</option>
          <option value="true">Crédito</option>
        </select>
        <select
          value={filterPaid}
          onChange={(e) => { setFilterPaid(e.target.value); pagination.reset(); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Todos los estados de pago</option>
          <option value="true">Pagado</option>
          <option value="false">Sin pagar</option>
        </select>
        {(filterOnCredit || filterPaid) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterOnCredit(''); setFilterPaid(''); pagination.reset(); }}>
            Limpiar
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(inv) => inv.id}
        emptyMessage="No se encontraron facturas de venta."
      />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={data?.totalPages ?? 0}
        totalCount={data?.totalCount ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={(size) => { pagination.setPageSize(size); pagination.reset(); }}
      />

      {isFormOpen && <SaleInvoiceForm onClose={() => setIsFormOpen(false)} />}
      {selectedInvoice && (
        <SaleInvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
      <ConfirmModal
        isOpen={reversingInvoice !== null}
        title="Anular factura"
        message={`¿Generar factura de anulación para la factura #${reversingInvoice?.id}?`}
        confirmLabel="Anular"
        onConfirm={async () => {
          if (reversingInvoice) await handleReverseConfirm(reversingInvoice.id);
          setReversingInvoice(null);
        }}
        onCancel={() => setReversingInvoice(null)}
      />
    </PageLayout>
  );
}
