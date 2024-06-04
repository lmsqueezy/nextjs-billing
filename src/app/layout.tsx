// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from '@/components/providers';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: "Lemon Squeezy Next.js Billing App Template",
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" className="h-full touch-manipulation">
      <body className="min-h-screen bg-background">
        <SessionProvider>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
