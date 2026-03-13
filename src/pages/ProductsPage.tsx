import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useProducts, useDeleteProduct, usePatchProductActive } from '@/features/products/queries';
import { ProductForm } from '@/features/products/ProductForm';
import type { Product } from '@/types/models';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const [activeFilter, setActiveFilter] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, isLoading } = useProducts({
    page: pagination.page,
    pageSize: pagination.pageSize,
    active: activeFilter === '' ? undefined : activeFilter === 'true',
  });

  const deleteMutation = useDeleteProduct();
  const patchActiveMutation = usePatchProductActive();

  const handleDelete = (id: number) => {
    if (confirm('Delete this product?')) {
      void deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (product: Product) => {
    void patchActiveMutation.mutate({ id: product.id, active: !product.active });
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (p) => <span className="font-medium text-gray-900">{p.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => <span className="text-gray-600">{p.categoryName ?? '—'}</span>,
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (p) => <span className="text-gray-600">{p.brandName ?? '—'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => <span className="font-mono">{formatCurrency(p.price)}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <span className={p.currentStock <= p.minStock ? 'text-red-600 font-medium' : ''}>
          {p.currentStock}
          {p.currentStock <= p.minStock && ' ⚠'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) =>
        p.active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
    },
    ...(isAdmin()
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (p: Product) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(p.id)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleActive(p)}
                  isLoading={patchActiveMutation.isPending}
                >
                  {p.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(p.id)}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            ),
          } satisfies Column<Product>,
        ]
      : []),
  ];

  return (
    <PageLayout
      title="Products"
      action={
        isAdmin() ? (
          <Button onClick={handleCreate}>+ New Product</Button>
        ) : undefined
      }
    >
      <div className="flex gap-3 mb-4">
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            pagination.reset();
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveFilter('');
              pagination.reset();
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyMessage="No products found."
      />

      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={data?.totalPages ?? 0}
        totalCount={data?.totalCount ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={(size) => { pagination.setPageSize(size); pagination.reset(); }}
      />

      {isFormOpen && (
        <ProductForm editId={editingId} onClose={handleCloseForm} />
      )}
    </PageLayout>
  );
}
