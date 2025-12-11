
"use client";

import type { UserRole, UserType } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useSettings } from './settings-context';
import { MOCK_COLLABORATORS } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  userType?: UserType;
  permissions?: Record<string, boolean>;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  hasPermission: (page: string) => boolean;
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          // Buscar colaborador no Firestore pelo email
          const collaboratorsRef = collection(db, 'collaborators');
          const q = query(collaboratorsRef, where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);
          
          let collaboratorData = null;
          if (!querySnapshot.empty) {
            // Colaborador encontrado no Firestore
            collaboratorData = querySnapshot.docs[0].data();
          } else if (ALLOWED_EMAILS.includes(firebaseUser.email)) {
            // Fallback para mock data se não encontrar no Firestore mas estiver na lista de emails permitidos
            collaboratorData = MAPPED_USERS.get(firebaseUser.email);
          } else {
            // Email não encontrado nem no Firestore nem na lista permitida
            console.log("Email não autorizado:", firebaseUser.email);
            setUser(null);
            if (firebaseUser) {
              signOut(auth);
            }
            setIsLoading(false);
            return;
          }
          
          const userProfile: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || collaboratorData?.name || null,
            email: firebaseUser.email,
            role: collaboratorData?.cargo as UserRole || 'Colaborador',
            userType: collaboratorData?.userType || 'Usuário padrão',
            permissions: collaboratorData?.permissions || {},
          };
          setUser(userProfile);
        } catch (error: any) {
          console.error("Error fetching collaborator data: ", error);
          // Em caso de erro (ex: permissão negada), verificar se está na lista de emails permitidos como fallback
          if (ALLOWED_EMAILS.includes(firebaseUser.email)) {
            const collaboratorData = MAPPED_USERS.get(firebaseUser.email);
            const userProfile: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              role: collaboratorData?.cargo as UserRole || 'Colaborador',
              userType: collaboratorData?.userType || 'Usuário padrão',
              permissions: collaboratorData?.permissions || {},
            };
            setUser(userProfile);
          } else {
            // Se não estiver na lista permitida e deu erro, verificar se é erro de permissão
            // Se for erro de permissão, pode ser que o usuário esteja no Firestore mas não consegue ler
            // Nesse caso, tentar usar dados básicos do Firebase Auth
            if (error?.code === 'permission-denied') {
              console.warn("Permissão negada ao buscar colaborador, mas usuário autenticado. Usando dados básicos.");
              // Criar perfil básico com dados do Firebase Auth
              const userProfile: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                role: 'Colaborador' as UserRole,
                userType: 'Usuário padrão',
                permissions: {},
              };
              setUser(userProfile);
            } else {
              // Se não estiver na lista permitida e não for erro de permissão, fazer logout
              console.log("Email não autorizado e erro não é de permissão:", firebaseUser.email);
              setUser(null);
              if (firebaseUser) {
                signOut(auth);
              }
            }
          }
        }
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
  const userType = user?.userType || 'Usuário padrão';
  const isAdmin = userType === 'Administrador';
  const isUnderMaintenance = !!maintenanceSettings?.isEnabled && !maintenanceSettings?.adminEmails.includes(user?.email || '');

  const hasPermission = useCallback((page: string): boolean => {
    if (!user) return false;
    
    const currentUserType = user.userType || 'Usuário padrão';
    
    // Administradores têm acesso a todas as páginas
    if (currentUserType === 'Administrador') {
      return true;
    }
    
    // Para usuários padrão, verificar permissão específica
    // Remove leading slash se existir
    const key = page.startsWith('/') ? page.substring(1) : page;
    return user.permissions?.[key] === true;
  }, [user]);

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
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, hasPermission, login, logout, isLoading: (isLoading || isLoadingSettings), isUnderMaintenance }}>
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
