import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';
import { AuthProvider } from '@/components/provider/auth-provider';
import { QueryProvider } from '@/components/provider/query-provider';
import LoadingPage from '@/components/shared/loading';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Next.js TS Shadcn Starter',
  description:
    'A starter template for Next.js with TypeScript, Shadcn UI, and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryProvider>
            <Suspense fallback={<LoadingPage />}>
              <AuthProvider>{children}</AuthProvider>
            </Suspense>
            <Toaster position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
