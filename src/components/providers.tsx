import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

export function Providers({ children, ...props }: ThemeProviderProps) {
    return (
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    )
  }