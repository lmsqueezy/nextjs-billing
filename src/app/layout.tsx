import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemon Squeezy Next.js Billing App Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full touch-manipulation">
      <body
        className={`min-h-full font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
