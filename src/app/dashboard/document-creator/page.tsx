'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDocument } from '@/ai/flows/document-creator';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileEdit, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  documentType: z.string({ required_error: 'Por favor, selecciona un tipo de documento.' }),
  topic: z.string().min(10, { message: 'El tema debe tener al menos 10 caracteres.' }),
  tone: z.enum(['formal', 'informal', 'academico', 'creativo']),
});

export default function DocumentCreatorPage() {
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: '',
      topic: '',
      tone: 'academico',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDocumentContent(null);
    try {
      const response = await createDocument(values);
      setDocumentContent(`${response.title}\n\n${response.content}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al crear el documento',
        description: 'Hubo un problema con el servicio de IA. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error(error);
    }
    setIsLoading(false);
  }
  
  const handleCopy = () => {
    if (documentContent) {
      navigator.clipboard.writeText(documentContent);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileEdit className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Creador de Documentos</CardTitle>
          </div>
          <CardDescription>Genera borradores para ensayos, informes y más, con la ayuda de la IA.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ensayo">Ensayo</SelectItem>
                        <SelectItem value="Informe">Informe</SelectItem>
                        <SelectItem value="Artículo">Artículo</SelectItem>
                        <SelectItem value="Resumen">Resumen</SelectItem>
                        <SelectItem value="Guion">Guion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Principal</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe el tema central del documento. Sé lo más específico posible." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tono de Escritura</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academico">Académico</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="creativo">Creativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Documento
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
          <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Documento Generado</CardTitle>
                  <CardDescription>El borrador de tu documento aparecerá aquí.</CardDescription>
              </div>
              {documentContent && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                      {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-2">{hasCopied ? 'Copiado' : 'Copiar'}</span>
                  </Button>
              )}
          </div>
          </CardHeader>
          <CardContent>
          {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
          )}
          {documentContent && (
              <div className="prose prose-sm text-foreground whitespace-pre-wrap">
                  {documentContent}
              </div>
          )}
          {!documentContent && !isLoading && (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-center">
                 Completa el formulario para generar un documento.
              </div>
          )}
          </CardContent>
      </Card>
    </div>
  );
}
