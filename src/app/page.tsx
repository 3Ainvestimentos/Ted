
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/strategic-panel');
      } else {
        router.replace('/login');
      }
    }
  }, [router, isAuthenticated, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-foreground">Carregando Ted 1.0...</p>
    </div>
  );
}
