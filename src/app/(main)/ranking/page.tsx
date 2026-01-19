'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import type { InventoryItem, Sale } from '@/lib/data';
import { useMemoFirebase } from '@/firebase/provider';
import Image from 'next/image';

type RankedItem = {
  id: string;
  item: InventoryItem;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function RankingPage() {
  const firestore = useFirestore();
  const [rankingBy, setRankingBy] = useState<'quantity' | 'profit'>('quantity');

  const salesCollectionRef = useMemoFirebase(() => collection(firestore, 'sales_transactions'), [firestore]);
  const inventoryCollectionRef = useMemoFirebase(() => collection(firestore, 'inventory_items'), [firestore]);
  
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollectionRef);
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  const rankedItems = useMemo((): RankedItem[] => {
    if (!sales || !inventory) return [];
    
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    const itemStats: Record<string, { quantitySold: number; totalRevenue: number; totalProfit: number }> = {};

    sales.forEach(sale => {
      const item = inventoryMap.get(sale.inventoryItemId);
      if (!item) return;

      if (!itemStats[item.id]) {
        itemStats[item.id] = { quantitySold: 0, totalRevenue: 0, totalProfit: 0 };
      }

      const revenue = sale.sellingPrice * sale.quantity;
      const profit = (sale.sellingPrice - item.originalValue) * sale.quantity;

      itemStats[item.id].quantitySold += sale.quantity;
      itemStats[item.id].totalRevenue += revenue;
      itemStats[item.id].totalProfit += profit;
    });

    const ranked: RankedItem[] = Object.keys(itemStats).map(itemId => ({
      id: itemId,
      item: inventoryMap.get(itemId)!,
      ...itemStats[itemId],
    }));

    ranked.sort((a, b) => {
      if (rankingBy === 'profit') {
        return b.totalProfit - a.totalProfit;
      }
      // Default to quantity
      return b.quantitySold - a.quantitySold;
    });

    return ranked;
  }, [sales, inventory, rankingBy]);

  const isLoading = salesLoading || inventoryLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Item Ranking</h1>
          <p className="text-muted-foreground">
            Discover your most popular and profitable items.
          </p>
        </div>
        <Tabs value={rankingBy} onValueChange={(value) => setRankingBy(value as any)} className="w-[250px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quantity">By Quantity</TabsTrigger>
            <TabsTrigger value="profit">By Profit</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="rounded-lg border bg-white/80 dark:bg-black/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Quantity Sold</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
              <TableHead className="text-right">Total Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Loading ranking data...</TableCell>
                </TableRow>
            )}
            {!isLoading && rankedItems.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No sales data available to generate rankings.</TableCell>
                </TableRow>
            )}
            {!isLoading && rankedItems.map((rankedItem, index) => {
              return (
                <TableRow key={rankedItem.id}>
                  <TableCell>
                    <Badge variant="secondary" className="text-lg">
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={rankedItem.item.imageUrl}
                          alt={rankedItem.item.name}
                          fill
                          className="object-cover"
                          data-ai-hint={rankedItem.item.imageHint}
                        />
                      </div>
                      <div className="font-medium">{rankedItem.item.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{rankedItem.quantitySold}</TableCell>
                  <TableCell className="text-right">
                    ₹{rankedItem.totalRevenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={rankedItem.totalProfit >= 0 ? 'default' : 'destructive'} className={`${rankedItem.totalProfit >=0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}>
                      ₹{rankedItem.totalProfit.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
