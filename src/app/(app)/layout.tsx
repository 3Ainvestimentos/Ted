

"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { UserNav } from '@/components/layout/user-nav';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Logo } from '@/components/icons/logo';
import { NAV_ITEMS_FOOTER } from '@/lib/constants';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-lg text-foreground">Carregando...</div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
           <UserNav />
           <SidebarMenu>
            {NAV_ITEMS_FOOTER.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton
                            onClick={item.title === 'Sair' ? logout : undefined}
                            tooltip={{content: item.title}}
                            aria-label={item.title}
                            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="p-2 -ml-2 text-foreground" /> 
          {/* Header content can go here if needed, e.g. breadcrumbs or global search */}
          <div className="ml-auto flex items-center gap-2">
            {/* Additional header items */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

