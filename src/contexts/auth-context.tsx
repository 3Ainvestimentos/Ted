
"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Lista de e-mails com permissão de administrador
const ADMIN_EMAILS = ['matheus@3ainvestimentos.com.br'];

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('tedAppUser');
      if (storedAuth) {
        const storedUser = JSON.parse(storedAuth);
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Falha ao analisar o estado de autenticação do localStorage", error);
      localStorage.removeItem('tedAppUser');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('tedAppUser', JSON.stringify(userData));
    } catch (error) {
      console.error("Falha ao definir o estado de autenticação no localStorage", error);
    }
    router.push('/strategic-panel');
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('tedAppUser');
    } catch (error) {
      console.error("Falha ao remover o estado de autenticação do localStorage", error);
    }
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, isLoading }}>
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
