import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

export function Topbar() {
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
    <header className="flex items-center justify-between h-14 px-6 border-b border-gray-200 bg-white">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {user.name} <span className="text-gray-400">({user.role})</span>
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold select-none">
          {initials}
        </div>
        <Button variant="ghost" size="sm" onClick={() => { void logout(); }}>
          Logout
        </Button>
      </div>
    </header>
  );
}
