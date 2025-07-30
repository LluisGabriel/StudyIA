'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/hooks/use-loading';
import { useLocale } from '@/hooks/use-locale';

const formSchema = z.object({
  fullName: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { withLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLocale();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await withLoading(new Promise(resolve => setTimeout(resolve, 500)));
    
    try {
        const existingEmail = localStorage.getItem('userEmail');
        if (existingEmail === values.email) {
            toast({
                variant: "destructive",
                title: t('toast.error'),
                description: t('toast.signupError'),
            });
            setIsSubmitting(false);
            return;
        }

        localStorage.setItem('userName', values.fullName);
        localStorage.setItem('userEmail', values.email);
        localStorage.removeItem('userAvatar');

        window.dispatchEvent(new CustomEvent('user-data-updated'));
        
        toast({
            title: t('toast.success'),
            description: t('toast.signupSuccess'),
        });

        router.push('/dashboard');
    } catch (error) {
         toast({
            variant: "destructive",
            title: t('toast.error'),
            description: t('toast.saveError'),
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">{t('auth.signupTitle')}</CardTitle>
          <CardDescription className="text-center">{t('auth.signupDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.fullNameLabel')}</FormLabel>
                    <FormControl>
                        <div className="focus-within-gradient-border">
                            <Input placeholder="Tu Nombre" {...field} disabled={isSubmitting} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.emailLabel')}</FormLabel>
                    <FormControl>
                        <div className="focus-within-gradient-border">
                            <Input placeholder="nombre@ejemplo.com" {...field} disabled={isSubmitting} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.passwordLabel')}</FormLabel>
                    <FormControl>
                        <div className="focus-within-gradient-border">
                            <Input type="password" {...field} disabled={isSubmitting} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                        <div className="focus-within-gradient-border">
                            <Input type="password" {...field} disabled={isSubmitting} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.signupButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="underline">
              {t('auth.loginLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}