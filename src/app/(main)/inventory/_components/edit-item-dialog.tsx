'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, PlusCircle } from 'lucide-react';
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
import { useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { InventoryItem, Category } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemoFirebase } from '@/firebase/provider';
import { AddCategoryDialog } from './add-category-dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  category: z.string().min(1, 'Category is required.'),
  originalValue: z.coerce.number().min(0, 'Original value must be a positive number.'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a positive integer.'),
  image: z.object({
    dataUrl: z.string().optional(),
    hint: z.string().optional(),
  }),
  imageUrl: z.string().optional(), // Keep track of existing URL
});

interface EditItemDialogProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ item, open, onOpenChange }: EditItemDialogProps) {
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const { toast } = useToast();
  const firestore = useFirestore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);

  const categoriesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories } = useCollection<Category>(categoriesCollectionRef);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      category: item.category,
      originalValue: item.originalValue,
      quantity: item.quantity,
      image: {
        dataUrl: item.imageUrl,
        hint: item.imageHint,
      },
      imageUrl: item.imageUrl,
    },
  });

  useEffect(() => {
    if (open) {
        form.reset({
          name: item.name,
          category: item.category,
          originalValue: item.originalValue,
          quantity: item.quantity,
          image: {
            dataUrl: item.imageUrl,
            hint: item.imageHint,
          },
          imageUrl: item.imageUrl,
        });
    }
  }, [item, open, form]);

  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [stopCamera, toast]);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [isCameraOpen, startCamera, stopCamera]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('image.dataUrl', reader.result as string);
        form.setValue('image.hint', file.name.split('.').slice(0, -1).join(' '));
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        form.setValue('image.dataUrl', dataUrl);
        form.setValue('image.hint', 'captured image');
        form.setValue('imageUrl', dataUrl);
      }
      setCameraOpen(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    const itemRef = doc(firestore, 'inventory_items', item.id);
    
    updateDocumentNonBlocking(itemRef, {
      name: values.name,
      category: values.category,
      originalValue: values.originalValue,
      quantity: values.quantity,
      imageUrl: values.imageUrl || values.image.dataUrl,
      imageHint: values.image.hint,
    });

    toast({
      title: 'Item updated',
      description: `"${values.name}" has been updated.`,
    });
    onOpenChange(false);
  };

  const imagePreview = form.watch('image.dataUrl');

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update the details for your inventory item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="Item preview" fill className="object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white hover:text-white"
                        onClick={() => {
                          form.setValue('image', { dataUrl: undefined, hint: undefined });
                          form.setValue('imageUrl', undefined);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <span>Image Preview</span>
                  )}
                </div>
              </div>

              <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
                  <TabsTrigger value="camera" onClick={() => setCameraOpen(true)}><Camera className="mr-2 h-4 w-4" /> Camera</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                   <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-2"/>
                </TabsContent>
              </Tabs>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Blue T-Shirt" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Category</FormLabel>
                      <div className="col-span-3 flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setAddCategoryOpen(true)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage className="col-start-2 col-span-3" />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="originalValue"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Original Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="15.00" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
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
                      <Input type="number" placeholder="50" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use Camera</DialogTitle>
            </DialogHeader>
            {hasCameraPermission === false ? (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            ) : (
                <div className="flex flex-col items-center gap-4">
                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                  <Button type="button" onClick={handleCapture}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                </div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCameraOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
    <AddCategoryDialog open={isAddCategoryOpen} onOpenChange={setAddCategoryOpen} />
    </>
  );
}
