
"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isUnderMaintenance: boolean;
  setIsUnderMaintenance: (isUnder: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for simple auth
const ALLOWED_USERS: User[] = [
    {
        uid: 'mock-matheus-uid',
        name: 'Matheus',
        email: 'matheus@3ainvestimentos.com.br',
        role: 'PMO'
    },
    {
        uid: 'mock-thiago-uid',
        name: 'Thiago',
        email: 'thiago@3ainvestimentos.com.br',
        role: 'PMO'
    }
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'PMO';

  useEffect(() => {
    // This effect runs only once on mount to check for an existing session.
    try {
        const session = sessionStorage.getItem('user-session');
        if (session) {
            const sessionUser = JSON.parse(session);
            setUser(sessionUser);
        }
    } catch (error) {
        console.error("Failed to parse user session", error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase();
    const userToLogin = ALLOWED_USERS.find(u => u.email === normalizedEmail);

    if (userToLogin && pass === 'ted@2024') {
        sessionStorage.setItem('user-session', JSON.stringify(userToLogin));
        setUser(userToLogin);
        // Let the layout handle the redirect, just update the state here.
    } else {
        throw new Error('Credenciais inválidas.');
    }
  };

  const logout = async () => {
    setUser(null);
    sessionStorage.removeItem('user-session');
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, isLoading, isUnderMaintenance, setIsUnderMaintenance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
