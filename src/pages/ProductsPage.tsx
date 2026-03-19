import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Pagination } from '@/components/data/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/features/auth/AuthContext';
import { useProductStore } from '@/features/products/store';
import { useToast } from '@/components/ui/Toast';
import { ProductForm } from '@/features/products/ProductForm';
import type { Product } from '@/types/models';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const pagination = usePagination();
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isDeleting, isPatching, fetch, delete: deleteProduct, patchActive } = useProductStore();

  useEffect(() => {
    void fetch({
      page: pagination.page,
      pageSize: pagination.pageSize,
      active: activeFilter === '' ? undefined : activeFilter === 'true',
    });
  }, [pagination.page, pagination.pageSize, activeFilter]);

  const handleDelete = (id: number) => setDeletingId(id);

  const handleToggleActive = async (product: Product) => {
    try {
      await patchActive(product.id, !product.active);
      toast.success(`Product ${product.active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update status');
    }
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
      header: 'Nombre',
      render: (p) => <span className="font-medium text-gray-900">{p.name}</span>,
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (p) => <span className="text-gray-600">{p.categoryName ?? '—'}</span>,
    },
    {
      key: 'brand',
      header: 'Marca',
      render: (p) => <span className="text-gray-600">{p.brandName ?? '—'}</span>,
    },
    {
      key: 'price',
      header: 'Precio',
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
      header: 'Estado',
      render: (p) =>
        p.active ? <Badge variant="green">Activo</Badge> : <Badge variant="gray">Inactivo</Badge>,
    },
    ...(isAdmin()
      ? [
          {
            key: 'actions',
            header: 'Acciones',
            render: (p: Product) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(p.id)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleToggleActive(p)}
                  isLoading={isPatching}
                >
                  {p.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(p.id)}
                  isLoading={isDeleting}
                >
                  Eliminar
                </Button>
              </div>
            ),
          } satisfies Column<Product>,
        ]
      : []),
  ];

  return (
    <PageLayout
      title="Productos"
      action={
        isAdmin() ? (
          <Button onClick={handleCreate}>+ Nuevo Producto</Button>
        ) : undefined
      }
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            pagination.reset();
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
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
            Limpiar filtros
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyMessage="No se encontraron productos."
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

      <ConfirmModal
        isOpen={deletingId !== null}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (deletingId !== null) {
            try {
              await deleteProduct(deletingId);
              toast.success('Product deleted');
            } catch {
              toast.error('Failed to delete product');
            }
          }
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </PageLayout>
  );
}
