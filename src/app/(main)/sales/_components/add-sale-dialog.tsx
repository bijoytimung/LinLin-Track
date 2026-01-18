'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InventoryItem } from '@/lib/data';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

const formSchema = z.object({
  inventoryItemId: z.string().min(1, 'Please select an item.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a positive number.'),
  transactionDate: z.date({
    required_error: "A date of sale is required.",
  }),
});

interface AddSaleDialogProps {
  inventory: InventoryItem[];
  selectedDate?: Date;
}

export function AddSaleDialog({ inventory, selectedDate }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inventoryItemId: '',
      quantity: 1,
      sellingPrice: 0,
      transactionDate: selectedDate || new Date(),
    },
  });

  const selectedItemId = form.watch('inventoryItemId');
  const selectedItem = useMemo(
    () => inventory.find((item) => item.id === selectedItemId),
    [inventory, selectedItemId]
  );

  useEffect(() => {
    if (open) {
      form.reset({
        inventoryItemId: '',
        quantity: 1,
        sellingPrice: 0,
        transactionDate: selectedDate || new Date(),
      });
    }
  }, [open, selectedDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const itemSold = inventory.find(item => item.id === values.inventoryItemId);
    if (!itemSold) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected item not found.',
      });
      return;
    }
    if (itemSold.quantity < values.quantity) {
      form.setError('quantity', {
        type: 'manual',
        message: `Not enough stock. Only ${itemSold.quantity} available.`,
      });
      return;
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        const itemRef = doc(firestore, 'inventory_items', values.inventoryItemId);
        const salesCollRef = collection(firestore, 'sales_transactions');

        // This read is part of the transaction
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw new Error('Item does not exist!');
        }

        const newQuantity = itemDoc.data().quantity - values.quantity;
        if (newQuantity < 0) {
          throw new Error('Not enough items in stock.');
        }

        transaction.update(itemRef, { quantity: newQuantity });

        const saleData = {
            inventoryItemId: values.inventoryItemId,
            quantity: values.quantity,
            sellingPrice: values.sellingPrice,
            transactionDate: values.transactionDate,
        };
        // Firestore will generate an ID for the new document
        transaction.set(doc(salesCollRef), saleData);
      });
      
      toast({
        title: 'Sale recorded',
        description: 'The new sale has been successfully saved.',
      });
      setOpen(false);

    } catch (e: any) {
      console.error("Transaction failed: ", e);
      toast({
        variant: 'destructive',
        title: 'Transaction failed',
        description: e.message || 'Could not record the sale.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
              <DialogDescription>
                Enter the details for the new sale transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedItem && (
                <div className="flex items-center justify-center">
                  <div className="relative h-24 w-24 rounded-lg border border-dashed">
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      fill
                      className="object-cover rounded-lg"
                      data-ai-hint={selectedItem.imageHint}
                    />
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="inventoryItemId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Item</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Selling Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20.00" step="0.01" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Date of Sale</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "col-span-3 justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Sale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
