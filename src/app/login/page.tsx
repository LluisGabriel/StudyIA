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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/hooks/use-loading';
import { useLocale } from '@/hooks/use-locale';


const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'Por favor, introduce tu contraseña.' }),
});

const recoverySchema = z.object({
    recoveryEmail: z.string().email({ message: 'Por favor, introduce un correo electrónico válido para recuperar tu contraseña.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { withLoading } = useLoading();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLocale();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
        recoveryEmail: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await withLoading(new Promise(resolve => setTimeout(resolve, 500)));
    
    try {
        const storedEmail = localStorage.getItem('userEmail');
        if (values.email !== storedEmail) {
            toast({
                variant: "destructive",
                title: t('toast.error'),
                description: t('toast.loginError'),
            });
        } else {
            toast({
                title: t('toast.success'),
                description: t('toast.loginSuccess'),
            });
            router.push('/dashboard');
        }
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

  function onRecoverySubmit(values: z.infer<typeof recoverySchema>) {
      console.log('Recovery for:', values.recoveryEmail);
      toast({
          title: t('toast.success'),
          description: t('toast.passwordRecoverySent'),
      });
      setIsRecoveryOpen(false);
      recoveryForm.reset();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">{t('auth.loginTitle')}</CardTitle>
          <CardDescription className="text-center">{t('auth.loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center">
                        <FormLabel>{t('auth.passwordLabel')}</FormLabel>
                        <AlertDialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="link" type="button" className="ml-auto inline-block text-sm underline p-0 h-auto">
                                {t('auth.forgotPassword')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('auth.passwordRecoveryTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('auth.passwordRecoveryDesc')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Form {...recoveryForm}>
                                    <form onSubmit={recoveryForm.handleSubmit(onRecoverySubmit)} id="recovery-form" className="space-y-4">
                                        <FormField
                                            control={recoveryForm.control}
                                            name="recoveryEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('auth.emailLabel')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="nombre@ejemplo.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('auth.cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction type="submit" form="recovery-form">{t('auth.sendButton')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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
                {t('auth.loginButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('auth.noAccount')}{' '}
            <Link href="/signup" className="underline">
              {t('auth.signUpLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}