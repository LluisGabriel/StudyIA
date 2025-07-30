import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LoadingProvider } from '@/hooks/use-loading.tsx';
import { GlobalLoadingSpinner } from '@/components/global-loading-spinner';
import { LocaleProvider } from '@/hooks/use-locale';

export const metadata: Metadata = {
  title: 'StudyAI',
  description: 'Your all-in-one academic assistant powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <LocaleProvider>
            <LoadingProvider>
                {children}
                <Toaster />
                <GlobalLoadingSpinner />
            </LoadingProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}