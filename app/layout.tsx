import { Providers } from "./providers"

import './globals.css'

export const metadata = {
  title: 'Lemon Squeezy Demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      </head>
      
      <body className="flex flex-col h-full">
        <Providers>

          <header className="bg-amber-200 p-3 mb-5 text-center">
            <h1 className="text-lg text-gray-800">Lemonstand</h1>
          </header>

          <main className="p-3 grow text-gray-900">
          {children}
          </main>

          <footer className="p-3 text-sm text-gray-400 md:flex md:justify-between">
            <div>
              <span className="text-gray-500">Lemonsqueezy Demo App</span> &middot;&nbsp;
              <a href="https://github.com/lmsqueezy/nextjs-billing" target="_blank">View on GitHub ↗</a> &middot;&nbsp;
              <a href="https://docs.lemonsqueezy.com" target="_blank">Lemon Squeezy Docs ↗</a>
            </div>
            <div className="mt-2 md:mt-0">
              <a href="https://lemonsqueezy.com" target="_blank">lemonsqueezy.com ↗</a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
