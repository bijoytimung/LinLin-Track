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
import { useCollection, useFirestore } from '@/firebase';
import type { InventoryItem } from '@/lib/data';
import { collection } from 'firebase/firestore';
import { AddItemDialog } from './_components/add-item-dialog';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function InventoryPage() {
  const firestore = useFirestore();
  const inventoryCollectionRef = useMemoFirebase(
    () => collection(firestore, 'inventory_items'),
    [firestore]
  );
  const { data: items, isLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your store's products and stock levels.
          </p>
        </div>
        <AddItemDialog />
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
      </div>
    </div>
  );
}
