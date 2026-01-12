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
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import type { InventoryItem, Sale, EnrichedSale } from '@/lib/data';
import { AddSaleDialog } from './_components/add-sale-dialog';
import { useMemoFirebase } from '@/firebase/provider';

export default function SalesPage() {
  const firestore = useFirestore();

  const salesCollectionRef = useMemoFirebase(() => collection(firestore, 'sales_transactions'), [firestore]);
  const inventoryCollectionRef = useMemoFirebase(() => collection(firestore, 'inventory_items'), [firestore]);
  
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollectionRef);
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  const enrichedSales = useMemo((): EnrichedSale[] => {
    if (!sales || !inventory) return [];
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    return sales.map(sale => ({
      ...sale,
      item: inventoryMap.get(sale.inventoryItemId),
      date: (sale.transactionDate as any).toDate(),
    })).filter(sale => sale.item).sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [sales, inventory]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and manage all your recorded sales.
          </p>
        </div>
        <AddSaleDialog inventory={inventory || []} />
      </div>
      <div className="rounded-lg border bg-white/80 dark:bg-black/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Original Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(salesLoading || inventoryLoading) && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading sales...</TableCell>
                </TableRow>
            )}
            {enrichedSales.map((sale) => {
              const profit =
                sale.sellingPrice * sale.quantity -
                sale.item.originalValue * sale.quantity;
              return (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.item.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {sale.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    ${sale.item.originalValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${sale.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={profit >= 0 ? 'default' : 'destructive'} className={`${profit >=0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}>
                      ${profit.toFixed(2)}
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
