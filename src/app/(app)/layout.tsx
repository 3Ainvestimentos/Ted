
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { UserNav } from '@/components/layout/user-nav';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, ChevronsLeftRight } from 'lucide-react'; 
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
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
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-3 flex items-center justify-between">
           <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <Logo className="w-7 h-7 text-sidebar-primary" />
            <h1 className="text-xl font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">Ted 1.0</h1>
          </div>
           <SidebarTrigger className="h-7 w-7 text-sidebar-primary group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{content: "Adicionar Quadro", hidden: false}} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <PlusCircle className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">Adicionar Quadro</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton tooltip={{content: "Configurações", hidden: false}} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Settings className="h-5 w-5" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">Configurações</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* SidebarTrigger below is for mobile view, let the one in SidebarHeader handle desktop */}
          <SidebarTrigger className="md:hidden h-7 w-7 text-foreground" /> 
          <div className="ml-auto flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
