'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from '../app-sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-2 lg:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">AI 翻译助手</h1>
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}