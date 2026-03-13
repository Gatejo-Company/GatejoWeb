import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { AuthUser, Role } from '@/types';
import {
  setAccessToken,
  clearAuth,
  setRefreshToken,
  getRefreshToken,
  getAccessToken,
} from '@/api/client';
import { authApi, type LoginPayload } from '@/api/endpoints/auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.payload, isLoading: false };
    case 'CLEAR_USER':
      return { user: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: () => boolean;
  login: (credentials: LoginPayload, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtUser(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;

    const id =
      Number(decoded['sub']) ||
      Number(decoded['nameid']) ||
      Number(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) ||
      0;

    const name =
      (decoded['name'] as string) ||
      (decoded['unique_name'] as string) ||
      (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
      '';

    const email =
      (decoded['email'] as string) ||
      (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string) ||
      '';

    const roleRaw =
      (decoded['role'] as string) ||
      (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ||
      'User';

    const role: Role = roleRaw === 'Admin' ? 'Admin' : 'User';

    return { id, name, email, role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
  });

  // On mount: restore session instantly from sessionStorage, then refresh in background
  useEffect(() => {
    const storedAccessToken = getAccessToken();
    const storedRefreshToken = getRefreshToken();

    // Instant restore from stored access token (no API call needed)
    let restoredFromToken = false;
    if (storedAccessToken) {
      const user = decodeJwtUser(storedAccessToken);
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        restoredFromToken = true;
      }
    }

    if (storedRefreshToken) {
      // Refresh in background to get fresh tokens
      const inLocalStorage = !!localStorage.getItem('refreshToken');
      authApi
        .refresh(storedRefreshToken)
        .then((data) => {
          setAccessToken(data.token);
          setRefreshToken(data.refreshToken, inLocalStorage);
          const user = decodeJwtUser(data.token);
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            dispatch({ type: 'CLEAR_USER' });
          }
        })
        .catch(() => {
          // Only clear auth if we couldn't restore the user from the stored access token.
          // If we already have a user, let them stay logged in; the 401 interceptor will
          // handle re-auth when the access token actually expires.
          if (!restoredFromToken) {
            clearAuth();
            dispatch({ type: 'CLEAR_USER' });
          }
        });
    } else if (!restoredFromToken) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials: LoginPayload, rememberMe: boolean) => {
    const data = await authApi.login(credentials);
    setAccessToken(data.token);
    setRefreshToken(data.refreshToken, rememberMe);
    const user = decodeJwtUser(data.token);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      dispatch({ type: 'CLEAR_USER' });
    }
  };

  const isAdmin = () => state.user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{ user: state.user, isLoading: state.isLoading, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}