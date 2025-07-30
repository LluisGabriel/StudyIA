'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { checkGrammarAndStyle, GrammarAndStyleOutput } from '@/ai/flows/grammar-and-style-checker';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  text: z.string().min(10, { message: 'El texto debe tener al menos 10 caracteres.' }),
});

type Diff = GrammarAndStyleOutput['diff'];

export default function GrammarCheckerPage() {
  const [result, setResult] = useState<GrammarAndStyleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await checkGrammarAndStyle({ text: values.text });
      setResult(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al revisar el texto',
        description: 'Hubo un problema con el servicio de IA. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error(error);
    }
    setIsLoading(false);
  }

  const renderDiff = (diff: Diff) => (
    <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap leading-relaxed">
      {diff.map((part, index) => {
        if (part.type === 'add') {
          return <span key={index} className="bg-green-100 text-green-800 rounded px-1">{part.value}</span>;
        }
        if (part.type === 'del') {
          return <span key={index} className="bg-red-100 text-red-800 rounded px-1 line-through">{part.value}</span>;
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Corrector Gramatical</CardTitle>
          </div>
          <CardDescription>Escribe o pega tu texto para recibir correcciones y sugerencias de estilo.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Texto</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe aquí para que la IA revise tu gramática y estilo..."
                        className="min-h-[200px]"
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
                Revisar Texto
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Texto Corregido</CardTitle>
          <CardDescription>Los cambios se muestran resaltados: <span className="bg-green-100 text-green-800 rounded px-1">adiciones</span> y <span className="bg-red-100 text-red-800 rounded px-1 line-through">eliminaciones</span>.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4 p-4 border rounded-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
          {result && (
             renderDiff(result.diff)
          )}
          {!result && !isLoading && (
            <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md">
              Las correcciones se mostrarán aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
