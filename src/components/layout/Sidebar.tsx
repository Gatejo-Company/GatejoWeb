import { NavLink } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '◻' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/categories', label: 'Categorías', icon: '🏷' },
  { to: '/brands', label: 'Marcas', icon: '🔖' },
  { to: '/suppliers', label: 'Proveedores', icon: '🏭' },
  { to: '/sale-invoices', label: 'Facturas de Venta', icon: '🧾' },
  { to: '/purchase-invoices', label: 'Facturas de Compra', icon: '🛒' },
  { to: '/stock-movements', label: 'Movimientos de Stock', icon: '📊' },
  { to: '/users', label: 'Usuarios', icon: '👤', adminOnly: true },
];

export function Sidebar() {
  const { isAdmin } = useAuth();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin());

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-gray-100 shrink-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold tracking-tight text-white">Gatejo</span>
        <span className="text-xs text-gray-400 mt-1">Inventario</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
