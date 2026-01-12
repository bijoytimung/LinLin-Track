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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Camera, Upload, X } from 'lucide-react';
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
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef, useEffect, useCallback } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  originalValue: z.coerce.number().min(0, 'Original value must be a positive number.'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a positive integer.'),
  image: z.object({
    dataUrl: z.string().optional(),
    hint: z.string().optional(),
  }),
});

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const { toast } = useToast();
  const firestore = useFirestore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      originalValue: 0,
      quantity: 0,
      image: {},
    },
  });

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
      }
      setCameraOpen(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    let imageData;
    if (values.image?.dataUrl) {
      imageData = { imageUrl: values.image.dataUrl, imageHint: values.image.hint };
    } else {
      const placeholder = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      imageData = { imageUrl: placeholder.imageUrl, imageHint: placeholder.imageHint };
    }

    addDocumentNonBlocking(collection(firestore, 'inventory_items'), {
      name: values.name,
      originalValue: values.originalValue,
      quantity: values.quantity,
      createdAt: new Date(),
      ...imageData,
    });

    toast({
      title: 'Item added',
      description: `"${values.name}" has been added to your inventory.`,
    });
    setOpen(false);
    form.reset();
  };

  const imagePreview = form.watch('image.dataUrl');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) form.reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Enter the details for the new inventory item and add a photo.
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
                        onClick={() => form.setValue('image', { dataUrl: undefined, hint: undefined })}
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
                    <FormMessage className="col-span-4" />
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
                      <Input type="number" placeholder="50" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Item</Button>
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
              <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}