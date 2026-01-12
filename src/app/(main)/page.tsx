'use client';
import type { Sale, EnrichedSale } from '@/lib/data';
import { RecentSales } from './_components/recent-sales';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';
import { Heart, Star } from 'lucide-react';

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

  const today = new Date();
  const todaySales = enrichedSales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getDate() === today.getDate() &&
           saleDate.getMonth() === today.getMonth() &&
           saleDate.getFullYear() === today.getFullYear();
  });

  const totalRevenue = todaySales.reduce((acc, sale) => {
    return acc + sale.sellingPrice * sale.quantity;
  }, 0);

  const totalProfit = todaySales.reduce((acc, sale) => {
    const cost = sale.item.originalValue * sale.quantity;
    const revenue = sale.sellingPrice * sale.quantity;
    return acc + (revenue - cost);
  }, 0);

  const itemsSoldCount = todaySales.reduce((acc, sale) => acc + sale.quantity, 0);
  
  const recentSales = enrichedSales.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0,3);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-500 flex items-center justify-center gap-2">
                Good Morning, <Heart className="inline text-pink-400 fill-current" /> Owner <Star className="inline text-yellow-400 fill-current" />
            </h1>
        </div>

      <div className="relative p-6 text-center rounded-lg scroll-bg">
        <h2 className="text-lg font-bold">Today's Profit:</h2>
        <p className="text-5xl font-bold text-pink-600">${totalProfit.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative p-4 text-center rounded-lg scroll-bg-secondary">
          <h3 className="text-md font-bold">Revenue:</h3>
          <p className="text-3xl font-bold text-yellow-700">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="relative p-4 text-center rounded-lg bg-pink-100 dark:bg-pink-900/50">
          <h3 className="text-md font-bold">Items Sold:</h3>
          <p className="text-3xl font-bold text-pink-600">{itemsSoldCount}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-center mb-4">Recent Sales</h2>
        <div className="bg-white/80 dark:bg-black/50 p-4 rounded-lg shadow-inner">
            <RecentSales sales={recentSales} />
        </div>
      </div>

    </div>
  );
}
