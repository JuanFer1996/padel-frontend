import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getToken, setToken } from './api';

type AuthContextValue = {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // El frontend ahora llama a la ruta "me" que acabamos de crear
    fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .catch(() => setToken('')) // Si el token expiró, lo borra
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Credenciales inválidas');
        const data = await res.json();
        
        // ¡Guardamos el token y el usuario en el sistema de Cursor!
        setToken(data.access_token);
        setUser(data.user);
      },
      logout() {
        setToken('');
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}