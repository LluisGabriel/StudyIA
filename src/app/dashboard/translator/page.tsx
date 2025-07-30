'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { translateText } from '@/ai/flows/multilingual-translator';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Languages, Loader2, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  text: z.string().min(1, { message: 'Por favor, introduce texto para traducir.' }),
  targetLanguage: z.string({
    required_error: "Por favor, selecciona un idioma."
  }),
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

export default function TranslatorPage() {
  const [translation, setTranslation] = useState<string | null>(null);
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
    setTranslation(null);
    try {
      const result = await translateText(values);
      setTranslation(result.translatedText);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al traducir',
        description: 'Hubo un problema con el servicio de IA. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error(error);
    }
    setIsLoading(false);
  }
  
  const handleSwap = () => {
    const currentText = form.getValues('text');
    if (translation && translation !== currentText) {
        form.setValue('text', translation);
        setTranslation(currentText);
        // The target language becomes the 'source' language, but since we don't
        // detect the source language, the user needs to select a new target.
        // We will just swap the text and the result.
        // For a full implementation, we would need source language detection.
    }
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
            <Languages className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold">Traductor Multilingüe</h1>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Texto a traducir</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Escribe aquí el texto..." className="min-h-[200px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col items-center gap-4">
                        <Button type="button" variant="ghost" size="icon" onClick={handleSwap} aria-label="Intercambiar texto y traducción">
                            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="targetLanguage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Traducir a</FormLabel>
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

                        <Card className="flex-grow">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Traducción</CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[140px]">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ) : translation ? (
                                <p className="text-sm">{translation}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">La traducción aparecerá aquí.</p>
                            )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                    Traducir Texto
                </Button>
            </form>
        </Form>
    </div>
  );
}
