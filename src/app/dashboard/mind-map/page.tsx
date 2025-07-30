'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateMindMap } from '@/ai/flows/mind-map-generator';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'El tema debe tener al menos 3 caracteres.' }),
});

export default function MindMapPage() {
  const [mindMap, setMindMap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMindMap(null);
    try {
      const result = await generateMindMap({ topic: values.topic });
      setMindMap(result.mindMap);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al generar el mapa mental',
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
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Generador de Mapas Mentales</CardTitle>
          </div>
          <CardDescription>Introduce un tema y la IA creará un mapa mental estructurado para ti.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Fotosíntesis, Revolución Industrial..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Mapa Mental
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Resultado</CardTitle>
          <CardDescription>Aquí aparecerá tu mapa mental.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {mindMap && (
            <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-md">{mindMap}</pre>
          )}
          {!mindMap && !isLoading && (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              El mapa mental generado se mostrará aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
