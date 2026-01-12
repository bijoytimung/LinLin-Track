import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { AuthGate } from './_components/auth-gate';
import { HomeIcon } from '@/components/icons/home';
import { StockIcon } from '@/components/icons/stock';
import { ReportsIcon } from '@/components/icons/reports';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGate>
        <Sidebar variant="floating" collapsible="none" className="md:w-64">
          <SidebarHeader>
             {/* Header content can go here if needed */}
          </SidebarHeader>
          <SidebarContent className="p-0">
             {/* This can be a container for the main content if sidebar is persistent */}
          </SidebarContent>
        </Sidebar>
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-sidebar md:hidden">
            <nav className="flex justify-around">
                <Link href="/" className="flex flex-col items-center p-2 text-foreground hover:text-primary">
                    <HomeIcon className="h-6 w-6" />
                    <span className="text-xs">Home</span>
                </Link>
                <Link href="/inventory" className="flex flex-col items-center p-2 text-foreground hover:text-primary">
                    <StockIcon className="h-6 w-6" />
                    <span className="text-xs">Stock</span>
                </Link>
                <Link href="/sales" className="flex flex-col items-center p-2 text-foreground hover:text-primary">
                    <ReportsIcon className="h-6 w-6" />
                    <span className="text-xs">Reports</span>
                </Link>
            </nav>
        </div>
        <SidebarInset>
          <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6">{children}</main>
        </SidebarInset>
      </AuthGate>
    </>
  );
}
