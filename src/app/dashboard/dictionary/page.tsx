'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getDefinition } from '@/ai/flows/dictionary';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Book, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  word: z.string().min(1, { message: 'Por favor, introduce una palabra.' }),
  language: z.string().optional(),
});

const languages = [
    { value: "English", label: "Inglés" },
    { value: "Spanish", label: "Español" },
    { value: "French", label: "Francés" },
    { value: "German", label: "Alemán" },
    { value: "Portuguese", label: "Portugués" },
    { value: "Italian", label: "Italiano" },
    { value: "Japanese", label: "Japonés" },
    { value: "Chinese", label: "Chino" },
];

type DictionaryOutput = {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
};

export default function DictionaryPage() {
  const [result, setResult] = useState<DictionaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      language: 'English',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getDefinition(values);
      setResult(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al buscar la definición',
        description: 'Hubo un problema con el servicio de IA. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error(error);
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Book className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">Diccionario Multilingüe</CardTitle>
        </div>
        <CardDescription>Busca definiciones, sinónimos, antónimos y ejemplos de uso.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
                <div>
                    <FormField
                    control={form.control}
                    name="word"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Palabra</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Serendipity" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div>
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Idioma</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un idioma" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buscar
            </Button>
          </CardFooter>
        </form>
      </Form>
        <Separator className="my-6"/>
        <CardContent>
             {isLoading && (
                <div className="space-y-6">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                <Separator />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                </div>
            )}
            {result && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold font-headline text-primary">{form.getValues('word')}</h3>
                        <p className="text-foreground">{result.definition}</p>
                    </div>
                    <Separator />
                    {result.examples && result.examples.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Ejemplos de uso</h4>
                            <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                                {result.examples.map((ex, i) => <li key={i}>"{ex}"</li>)}
                            </ul>
                        </div>
                    )}
                    {result.synonyms && result.synonyms.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Sinónimos</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.synonyms.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                            </div>
                        </div>
                    )}
                    {result.antonyms && result.antonyms.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Antónimos</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.antonyms.map((a, i) => <Badge key={i} variant="outline">{a}</Badge>)}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {!result && !isLoading && (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-center">
                    Busca una palabra para ver su significado.
                </div>
            )}
        </CardContent>
    </Card>
  );
}