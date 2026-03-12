import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute, AdminRoute } from './guards';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { BrandsPage } from '@/pages/BrandsPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { SaleInvoicesPage } from '@/pages/SaleInvoicesPage';
import { PurchaseInvoicesPage } from '@/pages/PurchaseInvoicesPage';
import { StockMovementsPage } from '@/pages/StockMovementsPage';
import { UsersPage } from '@/pages/UsersPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'brands', element: <BrandsPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'sale-invoices', element: <SaleInvoicesPage /> },
          { path: 'purchase-invoices', element: <PurchaseInvoicesPage /> },
          { path: 'stock-movements', element: <StockMovementsPage /> },
          {
            element: <AdminRoute />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
