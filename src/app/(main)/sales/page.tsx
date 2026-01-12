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
import { collection, doc, getDoc, runTransaction } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import type { InventoryItem, Sale, EnrichedSale } from '@/lib/data';
import { AddSaleDialog } from './_components/add-sale-dialog';
import { useMemoFirebase } from '@/firebase/provider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SalesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [saleToDelete, setSaleToDelete] = useState<EnrichedSale | null>(null);

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

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;

    try {
      await runTransaction(firestore, async (transaction) => {
        const saleRef = doc(firestore, 'sales_transactions', saleToDelete.id);
        const itemRef = doc(firestore, 'inventory_items', saleToDelete.item.id);

        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw new Error("Inventory item not found.");
        }

        // Add the quantity back to the inventory
        const newQuantity = itemDoc.data().quantity + saleToDelete.quantity;
        transaction.update(itemRef, { quantity: newQuantity });
        
        // Delete the sale document
        transaction.delete(saleRef);
      });

      toast({
        title: 'Sale deleted',
        description: 'The sale has been removed and inventory updated.',
      });
    } catch (e: any) {
      console.error("Delete transaction failed: ", e);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: e.message || 'Could not delete the sale.',
      });
    } finally {
      setSaleToDelete(null);
    }
  };

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(salesLoading || inventoryLoading) && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading sales...</TableCell>
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
                  <TableCell className="text-right">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => setSaleToDelete(sale)}>
                              <Trash className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        {saleToDelete && saleToDelete.id === sale.id && (
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the sale
                                    for <span className="font-semibold">{saleToDelete.item.name}</span> and
                                    add <span className="font-semibold">{saleToDelete.quantity}</span> back to your inventory.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel onClick={() => setSaleToDelete(null)}>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={handleDeleteSale} className={buttonVariants({variant: "destructive"})}>
                                    Delete
                                 </AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        )}
                     </AlertDialog>
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
