'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const userFromCookie = Cookies.get('user');
    if (userFromCookie) {
      try {
        setUser(JSON.parse(userFromCookie));
      } catch (error) {
        console.error('Erreur lors de la lecture du cookie:', error);
        Cookies.remove('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      setUser(data);
      Cookies.set('user', JSON.stringify(data), { expires: 7 });
      router.push('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error instanceof Error ? error : new Error('Erreur de connexion');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }

      setUser(data);
      Cookies.set('user', JSON.stringify(data), { expires: 7 });
      router.push('/');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error instanceof Error ? error : new Error('Erreur d\'inscription');
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
} 