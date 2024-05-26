
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from '@/components/providers'
import Navbar from '@/components/navbar'
// import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Lemon Squeezy Next.js Billing App Template",
};


export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" className="h-full touch-manipulation">
      <body
        className={`min-h-screen bg-background `}
      >
         <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
        {children}
        </Providers>
      </body>
    </html>
  );
}
