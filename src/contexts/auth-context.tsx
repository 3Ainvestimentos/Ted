
"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { app } from '@/lib/firebase';
import { MOCK_COLLABORATORS } from '@/lib/constants';

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
  isUnderMaintenance: boolean; // Assuming this might be needed later
  setIsUnderMaintenance: (isUnder: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

// Define allowed users from the mock collaborators constant
const ALLOWED_USERS_MAP = new Map(MOCK_COLLABORATORS.map(c => [c.email.toLowerCase(), c]));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const collaboratorData = ALLOWED_USERS_MAP.get(firebaseUser.email?.toLowerCase() || '');
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: collaboratorData?.name || 'Usuário',
          role: collaboratorData?.cargo as UserRole || 'Colaborador'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const lowerCaseEmail = email.toLowerCase();

    if (!ALLOWED_USERS_MAP.has(lowerCaseEmail)) {
      throw new Error("Usuário não autorizado.");
    }
    
    if (pass !== 'ted@2024') {
        throw new Error('Credenciais inválidas.');
    }

    try {
      await signInWithEmailAndPassword(auth, lowerCaseEmail, pass);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user does not exist, create them
        try {
          await createUserWithEmailAndPassword(auth, lowerCaseEmail, pass);
        } catch (createError: any) {
          throw new Error(`Falha ao criar usuário: ${createError.message}`);
        }
      } else if (error.code === 'auth/wrong-password') {
          throw new Error('Credenciais inválidas.');
      } else {
        throw new Error(`Erro de login: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'PMO';

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
