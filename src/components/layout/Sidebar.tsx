import { NavLink } from 'react-router';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '◻' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/categories', label: 'Categories', icon: '🏷' },
  { to: '/brands', label: 'Brands', icon: '🔖' },
  { to: '/suppliers', label: 'Suppliers', icon: '🏭' },
  { to: '/sale-invoices', label: 'Sale Invoices', icon: '🧾' },
  { to: '/purchase-invoices', label: 'Purchase Invoices', icon: '🛒' },
  { to: '/stock-movements', label: 'Stock Movements', icon: '📊' },
  { to: '/users', label: 'Users', icon: '👤' },
];

export function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-gray-100">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold tracking-tight text-white">Gatejo</span>
        <span className="text-xs text-gray-400 mt-1">Inventory</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
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
