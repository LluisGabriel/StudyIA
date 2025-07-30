'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateImage } from '@/ai/flows/image-generator';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
});

export default function ImageGeneratorPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setImageUrl(null);
    try {
      const result = await generateImage({ prompt: values.prompt });
      setImageUrl(result.imageUrl);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al generar la imagen',
        description: 'Hubo un problema con el servicio de IA. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error(error);
    }
    setIsLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Generador de Imágenes</CardTitle>
          </div>
          <CardDescription>Describe la imagen, ilustración o diagrama que necesitas y la IA lo creará.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Imagen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Un astronauta montando a caballo en marte, estilo fotorrealista."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Imagen
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Resultado</CardTitle>
          <CardDescription>Aquí aparecerá tu imagen generada.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {isLoading && <Skeleton className="w-full h-64 rounded-lg" />}
          {imageUrl && (
            <div className="relative w-full aspect-square">
               <Image src={imageUrl} alt="Imagen generada" className="rounded-lg object-cover" fill data-ai-hint="abstract art" />
            </div>
          )}
          {!imageUrl && !isLoading && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-center p-4">
              La imagen generada se mostrará aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
