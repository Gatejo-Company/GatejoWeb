import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useSaleInvoices, useDeleteSaleInvoice, usePaySaleInvoice } from '@/features/sale-invoices/queries';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [filterOnCredit, setFilterOnCredit] = useState('');
  const [filterPaid, setFilterPaid] = useState('');

  const { data, isLoading } = useSaleInvoices({
    page: pagination.page,
    pageSize: pagination.pageSize,
    onCredit: filterOnCredit === '' ? undefined : filterOnCredit === 'true',
    paid: filterPaid === '' ? undefined : filterPaid === 'true',
  });

  const deleteMutation = useDeleteSaleInvoice();
  const payMutation = usePaySaleInvoice();

  const handleDelete = (id: number) => {
    if (confirm('Delete this invoice?')) deleteMutation.mutate(id);
  };

  const columns: Column<SaleInvoice>[] = [
    { key: 'id', header: 'ID', render: (inv) => <span className="font-mono text-xs text-gray-400">#{inv.id}</span> },
    { key: 'date', header: 'Date', render: (inv) => formatDate(inv.date) },
    {
      key: 'items',
      header: 'Items',
      render: (inv) => <span className="text-gray-500">{inv.items?.length ?? 0} item(s)</span>,
    },
    { key: 'total', header: 'Total', render: (inv) => <span className="font-mono font-medium">{formatCurrency(inv.total)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => {
        if (!inv.onCredit) return <Badge variant="green">Cash</Badge>;
        return inv.paidAt ? <Badge variant="green">Paid</Badge> : <Badge variant="yellow">Credit Pending</Badge>;
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
            header: 'Actions',
            render: (inv: SaleInvoice) => (
              <div className="flex gap-2">
                {inv.onCredit && !inv.paidAt && (
                  <Button size="sm" variant="secondary" onClick={() => payMutation.mutate(inv.id)} isLoading={payMutation.isPending}>
                    Mark Paid
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => handleDelete(inv.id)} isLoading={deleteMutation.isPending}>
                  Delete
                </Button>
              </div>
            ),
          } satisfies Column<SaleInvoice>,
        ]
      : []),
  ];

  return (
    <PageLayout
      title="Sale Invoices"
      action={isAdmin() ? <Button onClick={() => setIsFormOpen(true)}>+ New Invoice</Button> : undefined}
    >
      <div className="flex gap-3 mb-4">
        <select
          value={filterOnCredit}
          onChange={(e) => { setFilterOnCredit(e.target.value); pagination.reset(); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All types</option>
          <option value="false">Cash</option>
          <option value="true">Credit</option>
        </select>
        <select
          value={filterPaid}
          onChange={(e) => { setFilterPaid(e.target.value); pagination.reset(); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All payment statuses</option>
          <option value="true">Paid</option>
          <option value="false">Unpaid</option>
        </select>
        {(filterOnCredit || filterPaid) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterOnCredit(''); setFilterPaid(''); pagination.reset(); }}>
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(inv) => inv.id}
        emptyMessage="No sale invoices found."
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
    </PageLayout>
  );
}
