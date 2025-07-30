'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  StickyNote,
  FileText,
  Type,
  BarChart3,
  ImageIcon,
  ArrowRight,
} from 'lucide-react';
import type { SVGProps } from 'react';
import { useLocale } from '@/hooks/use-locale';

function IconChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="#D6E4FF"
        stroke="#4285F4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStickyNote(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"
        fill="#FFF8E1"
        stroke="#FBBC04"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15 3v6h6"
        stroke="#FBBC04"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFileText(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        fill="#E8E2F9"
        stroke="#9333EA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke="#9333EA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconType(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 20h10"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4v16"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12h4"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12h4"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 4h6"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20h6"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill="#FCE8E6"
        stroke="#EA4335"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function IconBarChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 20V10M18 20V4M6 20v-4"
        stroke="#34A853"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill="#E6F4EA"
        stroke="#34A853"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function IconImage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#E8EAF6" stroke="#5C6BC0" strokeWidth="2" />
            <circle cx="9.5" cy="9.5" r="1.5" fill="#5C6BC0" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" fill="#E8EAF6" stroke="#5C6BC0" strokeWidth="2" />
        </svg>
    );
}

export default function DashboardPage() {
  const { t } = useLocale();

  const features = [
    {
      title: t('sidebar.chat'),
      description: t('home.featureChatDesc'),
      href: '/dashboard/chat',
      icon: <IconChat className="h-8 w-8" />,
    },
    {
      title: t('sidebar.notes'),
      description: t('home.featureNotesDesc'),
      href: '/dashboard/sticky-notes',
      icon: <IconStickyNote className="h-8 w-8" />,
    },
    {
      title: t('sidebar.summarizer'),
      description: t('home.featureSummarizerDesc'),
      href: '/dashboard/summarizer',
      icon: <IconFileText className="h-8 w-8" />,
    },
    {
      title: t('sidebar.grammar'),
      description: t('home.featureGrammarDesc'),
      href: '/dashboard/grammar-checker',
      icon: <IconType className="h-8 w-8" />,
    },
     {
      title: t('sidebar.image'),
      description: t('home.featureImageDesc'),
      href: '/dashboard/image-generator',
      icon: <IconImage className="h-8 w-8" />,
    },
    {
      title: t('sidebar.mindMap'),
      description: t('home.featureMindMapDesc'),
      href: '/dashboard/mind-map',
      icon: <IconBarChart className="h-8 w-8" />, // Re-using for visual variety
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('home.title')}</h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader className='pb-4'>
              <div className="flex justify-between items-start">
                 <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                 <div className="p-2 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 h-10">{feature.description}</p>
              <Link href={feature.href}>
                <Button variant="link" className="p-0 h-auto text-sm font-semibold text-primary group-hover:text-accent-foreground">
                  {t('home.openTool')} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-lg mt-4 text-center">
        <h2 className="text-2xl font-bold mb-2 font-headline">{t('home.promoTitle')}</h2>
        <p className="max-w-2xl mx-auto">
          {t('home.promoDesc')}
        </p>
      </div>
    </div>
  );
}
