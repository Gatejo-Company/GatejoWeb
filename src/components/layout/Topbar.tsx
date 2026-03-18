import { Link } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-gray-200 bg-white">
      <button
        onClick={onMenuToggle}
        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 lg:hidden"
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {user.name} <span className="text-gray-400">({user.role})</span>
          </span>
        )}
        <Link to="/profile" className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold select-none hover:bg-indigo-700 transition-colors" title="Mi Perfil">
          {initials}
        </Link>
        <Button variant="ghost" size="sm" onClick={() => { void logout(); }}>
          <span className="hidden sm:inline">Cerrar sesión</span>
          <span className="sm:hidden">Salir</span>
        </Button>
      </div>
    </header>
  );
}
