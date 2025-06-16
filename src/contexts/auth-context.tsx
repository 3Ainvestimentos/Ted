"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRoleState] = useState<UserRole>('Contributor');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('tedAppAuthState');
      if (storedAuth) {
        const { auth, role } = JSON.parse(storedAuth);
        setIsAuthenticated(auth);
        setUserRoleState(role || 'Contributor');
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem('tedAppAuthState');
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRoleState(role);
    try {
      localStorage.setItem('tedAppAuthState', JSON.stringify({ auth: true, role }));
    } catch (error) {
      console.error("Failed to set auth state in localStorage", error);
    }
    router.push('/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRoleState('Contributor');
    try {
      localStorage.removeItem('tedAppAuthState');
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/login');
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (isAuthenticated) {
      try {
        localStorage.setItem('tedAppAuthState', JSON.stringify({ auth: true, role }));
      } catch (error) {
        console.error("Failed to update role in localStorage", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, setUserRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
