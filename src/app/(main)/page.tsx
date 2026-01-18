'use client';
import type { Sale, EnrichedSale, InventoryItem } from '@/lib/data';
import { RecentSales } from './_components/recent-sales';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';
import { Heart, Star } from 'lucide-react';
import { Overview } from './_components/overview';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  const enrichedSales = useMemo((): EnrichedSale[] => {
    if (!sales || !inventory) return [];
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    return sales.map(sale => ({
      ...sale,
      item: inventoryMap.get(sale.inventoryItemId),
      date: (sale.transactionDate as any).toDate(),
    })).filter(sale => sale.item);
  }, [sales, inventory]);

  const today = new Date();
  const todaySales = enrichedSales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getDate() === today.getDate() &&
           saleDate.getMonth() === today.getMonth() &&
           saleDate.getFullYear() === today.getFullYear();
  });

  const todayRevenue = todaySales.reduce((acc, sale) => {
    return acc + sale.sellingPrice * sale.quantity;
  }, 0);

  const todayProfit = todaySales.reduce((acc, sale) => {
    const cost = sale.item.originalValue * sale.quantity;
    const revenue = sale.sellingPrice * sale.quantity;
    return acc + (revenue - cost);
  }, 0);
  
  const todayCapital = todayRevenue - todayProfit;

  const itemsSoldCount = todaySales.reduce((acc, sale) => acc + sale.quantity, 0);
  
  const recentSalesToday = todaySales.sort((a,b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col gap-4">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-500 flex items-center justify-center gap-2">
                Good Morning, <Heart className="inline text-pink-400 fill-current" /> LinLin <Star className="inline text-yellow-400 fill-current" />
            </h1>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayCapital.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{itemsSoldCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={enrichedSales} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Sales</CardTitle>
            <CardDescription>
              You've made {todaySales.length} sales today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSalesToday} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
