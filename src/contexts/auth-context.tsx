
"use client";

import type { UserRole } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useSettings } from './settings-context';
import { MOCK_COLLABORATORS } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isUnderMaintenance: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAILS = ['matheus@3ainvestimentos.com.br', 'thiago@3ainvestimentos.com.br'];
const MAPPED_USERS = new Map(MOCK_COLLABORATORS.map(c => [c.email, c]));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { maintenanceSettings, isLoading: isLoadingSettings } = useSettings();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email && ALLOWED_EMAILS.includes(firebaseUser.email)) {
        const collaboratorData = MAPPED_USERS.get(firebaseUser.email);
        const userProfile: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role: collaboratorData?.cargo as UserRole || 'Colaborador',
          permissions: collaboratorData?.permissions || {},
        };
        setUser(userProfile);
      } else {
        setUser(null);
        if (firebaseUser) {
           signOut(auth);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // On successful login, the onAuthStateChanged listener will handle setting the user
        // and the layout/page will handle the redirect.
    } catch (error) {
        console.error("Popup login error:", error);
        // Re-throw the error to be caught by the login page component
        throw error;
    }
  };

  const logout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null); // Explicitly clear user state
    router.push('/login'); // Redirect to login after logout
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'PMO';
  const isUnderMaintenance = !!maintenanceSettings?.isEnabled && !maintenanceSettings?.adminEmails.includes(user?.email || '');

  // This is a guard for the entire authenticated part of the app.
  // It handles the initial loading state.
  if (isLoading || isLoadingSettings) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <LoadingSpinner className="h-12 w-12" />
        </div>
      );
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, isLoading: (isLoading || isLoadingSettings), isUnderMaintenance }}>
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
