
"use client";

import React, { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { InitiativesProvider } from '@/contexts/initiatives-context';
import { MeetingsProvider } from '@/contexts/meetings-context';
import { StrategicPanelProvider } from '@/contexts/strategic-panel-context';
import { CollaboratorsProvider } from '@/contexts/collaborators-context';
import { UserNav } from '@/components/layout/user-nav';
import { useAuth } from '@/contexts/auth-context';
import { useSettings } from '@/contexts/settings-context';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function AppContent({ children }: { children: React.ReactNode }) {
    const { maintenanceSettings, isLoading: isSettingsLoading } = useSettings();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoading = isSettingsLoading || isAuthLoading;

    useEffect(() => {
        if (isLoading) return;

        // Redirect to maintenance if enabled and user is not an admin
        if (maintenanceSettings?.isEnabled && !maintenanceSettings.adminEmails.includes(user?.email || '')) {
            if (pathname !== '/maintenance') {
                router.replace('/maintenance');
            }
            return;
        }

        // Redirect to login if user is not authenticated and not on a public page
        if (!isAuthenticated && pathname !== '/login') {
            router.replace('/login');
            return;
        }

    }, [isLoading, isAuthenticated, maintenanceSettings, user, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner className="h-12 w-12" />
            </div>
        );
    }
    
    // Only show sidebar layout if authenticated and not in maintenance for the current user
    if (!isAuthenticated || (maintenanceSettings?.isEnabled && !maintenanceSettings.adminEmails.includes(user?.email || ''))) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner className="h-12 w-12" />
            </div>
        );
    }
    
  return (
            <SidebarProvider>
              <div className="flex h-screen bg-background">
                <Sidebar>
                  <SidebarContent>
                    <SidebarNav />
                  </SidebarContent>
                  <SidebarFooter>
                    <UserNav />
                  </SidebarFooter>
                </Sidebar>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <SidebarTrigger className="sm:hidden" />
                    <div className="ml-auto flex items-center gap-2">
                      {/* Additional header items can go here */}
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CollaboratorsProvider>
      <InitiativesProvider>
        <MeetingsProvider>
          <StrategicPanelProvider>
              <AppContent>{children}</AppContent>
          </StrategicPanelProvider>
        </MeetingsProvider>
      </InitiativesProvider>
    </CollaboratorsProvider>
  );
}
