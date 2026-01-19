import Link from 'next/link';
import { Home, Package, BarChart2, TrendingUp } from 'lucide-react';
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
import { RankingIcon } from '@/components/icons/ranking';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGate>
        <Sidebar variant="floating" collapsible="icon">
          <SidebarHeader>
            <Logo className="h-8 w-8 text-primary" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Dashboard' }}>
                  <Link href="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Inventory' }}>
                  <Link href="/inventory">
                    <Package />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Sales Reports' }}>
                  <Link href="/sales">
                    <BarChart2 />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Ranking' }}>
                  <Link href="/ranking">
                    <TrendingUp />
                    <span>Ranking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
                <Link href="/ranking" className="flex flex-col items-center p-2 text-foreground hover:text-primary">
                    <RankingIcon className="h-6 w-6" />
                    <span className="text-xs">Ranking</span>
                </Link>
            </nav>
        </div>
        <SidebarInset>
          <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6 relative">
            <div 
              className="absolute inset-0 bg-repeat bg-center -z-10 opacity-20" 
              style={{backgroundImage: "url('https://storage.googleapis.com/project-spark-3c35f.appspot.com/users%2FwY4p70S4sIdS1tDQw2r3rOKg1GH3%2Fuploads%2Fb504353d-2101-4467-8547-4f40026e6c43.png')"}}
            ></div>
            {children}
          </main>
        </SidebarInset>
      </AuthGate>
    </>
  );
}
