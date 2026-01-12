'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Sale, EnrichedSale } from '@/lib/data';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { Overview } from './_components/overview';
import { RecentSales } from './_components/recent-sales';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const salesCollectionRef = useMemoFirebase(
    () => collection(firestore, 'sales_transactions'),
    [firestore]
  );
  
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollectionRef);

  const inventoryCollectionRef = useMemoFirebase(
    () => collection(firestore, 'inventory_items'),
    [firestore]
  );
  const { data: inventory, isLoading: inventoryLoading } = useCollection(inventoryCollectionRef);

  const enrichedSales = useMemo((): EnrichedSale[] => {
    if (!sales || !inventory) return [];
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    return sales.map(sale => ({
      ...sale,
      item: inventoryMap.get(sale.inventoryItemId),
      date: (sale.transactionDate as any).toDate(),
    })).filter(sale => sale.item);
  }, [sales, inventory]);

  const totalRevenue = enrichedSales.reduce((acc, sale) => {
    return acc + sale.sellingPrice * sale.quantity;
  }, 0);

  const totalProfit = enrichedSales.reduce((acc, sale) => {
    const cost = sale.item.originalValue * sale.quantity;
    const revenue = sale.sellingPrice * sale.quantity;
    return acc + (revenue - cost);
  }, 0);

  const itemsSoldCount = enrichedSales.reduce((acc, sale) => acc + sale.quantity, 0);
  
  const recentSales = enrichedSales.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0,5);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on all sales recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalProfit.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              After cost of goods
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{itemsSoldCount.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total items sold across all transactions
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly revenue from sales.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={enrichedSales} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made {recentSales.length} sales recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
