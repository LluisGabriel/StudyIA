'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowRight, BrainCircuit, FileText, Languages, MessageSquare, BookOpen, BarChart3, FileCheck, ImageIcon, Folder, AlertTriangle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/hooks/use-locale';

export default function LandingPage() {
  const { t } = useLocale();

  const features = [
    { icon: <MessageSquare className="w-10 h-10 text-blue-500" />, title: t('landing.feature1Title'), description: t('landing.feature1Desc') },
    { icon: <FileText className="w-10 h-10 text-purple-500" />, title: t('landing.feature2Title'), description: t('landing.feature2Desc') },
    { icon: <FileCheck className="w-10 h-10 text-red-500" />, title: t('landing.feature3Title'), description: t('landing.feature3Desc') },
    { icon: <ImageIcon className="w-10 h-10 text-indigo-500" />, title: t('landing.feature4Title'), description: t('landing.feature4Desc') },
    { icon: <BrainCircuit className="w-10 h-10 text-green-500" />, title: t('landing.feature5Title'), description: t('landing.feature5Desc') },
    { icon: <BookOpen className="w-10 h-10 text-orange-500" />, title: t('landing.feature6Title'), description: t('landing.feature6Desc') },
    { icon: <Languages className="w-10 h-10 text-sky-500" />, title: t('landing.feature7Title'), description: t('landing.feature7Desc') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2 mr-auto">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-lg sm:inline-block">StudyAI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
                <Link href="/login">{t('auth.loginButton')}</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">{t('auth.signupButton')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-28 lg:py-36 flex items-center justify-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="container px-4 md:px-6 flex flex-col items-center justify-center gap-12">
                <div className="flex flex-col items-center gap-6">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    {t('landing.title1')} <br className="hidden md:block" />
                    <span className="text-primary">{t('landing.title2')}</span>
                    </h1>
                    <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                    {t('landing.subtitle')}
                    </p>
                    <div className="flex w-full justify-center gap-4">
                        <Button asChild size="lg">
                            <Link href="/signup">{t('landing.cta')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                    </div>
                </div>
            
                <Carousel 
                    className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl"
                    plugins={[Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]}
                    opts={{
                        loop: true,
                    }}
                >
                    <CarouselContent>
                        {features.map((feature, index) => (
                        <CarouselItem key={index}>
                            <Card className="w-full">
                               <CardContent className="flex flex-col items-center justify-center p-8 gap-4 min-h-[300px]">
                                 <div className="bg-muted p-4 rounded-full">
                                    {feature.icon}
                                </div>
                                <p className="text-2xl font-bold font-headline">{feature.title}</p>
                                <p className="text-base text-muted-foreground mt-2 px-4 max-w-md">{feature.description}</p>
                               </CardContent>
                            </Card>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-[-50px]" />
                    <CarouselNext className="right-[-50px]" />
                </Carousel>
            </div>
        </section>

        <section id="features" className="container mx-auto py-16 md:py-24 lg:py-32">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">{t('landing.featuresTitle')}</h2>
                <p className="max-w-2xl leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    {t('landing.featuresDesc')}
                </p>
            </div>
            <div className="grid justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:max-w-6xl lg:mx-auto">
                {features.slice(0,6).map((feature) => (
                    <Card key={feature.title} className="text-center overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl">
                        <CardContent className="flex flex-col gap-4 p-6 items-center">
                            {feature.icon}
                            <h3 className="font-bold text-lg">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                {t('landing.footer', { year: new Date().getFullYear() })}
            </p>
        </div>
      </footer>
    </div>
  );
}