'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { InventoryItem } from '@/lib/data';
import { collection, doc } from 'firebase/firestore';
import { AddItemDialog } from './_components/add-item-dialog';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { seedData } from '@/lib/seed-data';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Trash, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditItemDialog } from './_components/edit-item-dialog';


export default function InventoryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const inventoryCollectionRef = useMemoFirebase(
    () => collection(firestore, 'inventory_items'),
    [firestore]
  );
  const { data: items, isLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  const handleSeedData = async () => {
    if (!firestore || isSeeding || (items && items.length > 0)) {
        toast({
            variant: "destructive",
            title: "Inventory Not Empty",
            description: "Seeding is only allowed on an empty inventory.",
        });
        return;
    }
    setIsSeeding(true);
    toast({
        title: "Seeding Data...",
        description: "Please wait while we populate your inventory and sales records.",
    });

    const inventoryCollection = collection(firestore, 'inventory_items');
    const salesCollection = collection(firestore, 'sales_transactions');

    try {
        for (const [index, itemData] of seedData.entries()) {
            const quantitySold = itemData.initialQuantity - itemData.currentQuantity;

            const newItem = {
                name: itemData.name,
                originalValue: itemData.originalValue,
                quantity: itemData.currentQuantity,
                imageUrl: `https://picsum.photos/seed/${index + 100}/400/400`,
                imageHint: itemData.name.toLowerCase().split(' ').slice(0, 2).join(' '),
                createdAt: new Date()
            };

            const docRefPromise = addDocumentNonBlocking(inventoryCollection, newItem);

            if (docRefPromise) {
                const docRef = await docRefPromise;

                if (docRef && quantitySold > 0) {
                    const sale = {
                        inventoryItemId: docRef.id,
                        quantity: quantitySold,
                        sellingPrice: itemData.sellingPrice,
                        transactionDate: new Date() 
                    };
                    addDocumentNonBlocking(salesCollection, sale);
                }
            }
        }
        toast({
            title: "Seeding Complete!",
            description: "Your inventory and sales have been populated.",
        });
    } catch (error) {
        console.error("Seeding failed:", error);
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: "An error occurred while seeding data. Please check the console.",
        });
    } finally {
        setIsSeeding(false);
    }
  };

  const handleDeleteItem = () => {
    if (!itemToDelete || !firestore) return;

    deleteDocumentNonBlocking(doc(firestore, 'inventory_items', itemToDelete.id));

    toast({
      title: 'Item deleted',
      description: `"${itemToDelete.name}" has been removed from your inventory.`,
    });

    setItemToDelete(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your store's products and stock levels.
          </p>
        </div>
        <div className="flex gap-2">
            {!isLoading && items?.length === 0 && (
                <Button onClick={handleSeedData} disabled={isSeeding}>
                    {isSeeding ? 'Seeding...' : 'Seed Initial Data'}
                </Button>
            )}
            <AddItemDialog />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-32 w-full rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-5 w-1/4" />
            </CardFooter>
          </Card>
        ))}
        {items?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="relative h-32 w-full overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                />
                 <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 opacity-80 hover:opacity-100"
                        onClick={() => setItemToEdit(item)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 opacity-80 hover:opacity-100"
                        onClick={() => setItemToDelete(item)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription className="mt-1">
                Original Value: ${item.originalValue.toFixed(2)}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <p className="text-sm font-medium text-muted-foreground">
                In Stock: <span className="text-foreground">{item.quantity}</span>
              </p>
            </CardFooter>
          </Card>
        ))}
        {!isLoading && items?.length === 0 && (
             <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Your inventory is empty.</p>
                <p className="text-muted-foreground text-sm">Click "Seed Initial Data" to get started with some sample products.</p>
            </div>
        )}
      </div>
      
      {itemToEdit && (
        <EditItemDialog
          item={itemToEdit}
          open={!!itemToEdit}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setItemToEdit(null);
            }
          }}
        />
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        {itemToDelete && (
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item
                    "{itemToDelete.name}". Associated sales records will remain but may no longer display correctly.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                    onClick={handleDeleteItem}
                    className={buttonVariants({ variant: 'destructive' })}
                    >
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
