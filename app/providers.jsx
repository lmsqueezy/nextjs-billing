"use client";

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Toaster richColors position="top-center" />
      {children}
    </SessionProvider>
  )
}