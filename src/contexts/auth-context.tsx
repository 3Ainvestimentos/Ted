
"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';


// Lista de e-mails com permissão de administrador
const ADMIN_EMAILS = ['matheus@3ainvestimentos.com.br'];

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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const isAuthenticated = !!user;
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role: ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'PMO' : 'Colaborador',
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);
  
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
        router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);


  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
       if (firebaseUser) {
          const appUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            role: ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'PMO' : 'Colaborador',
          };
          setUser(appUser);
          router.push('/strategic-panel');
       }
    } catch (error) {
      console.error("Falha na autenticação com o Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Falha ao fazer logout", error);
    }
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
