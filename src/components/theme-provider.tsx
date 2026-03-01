/** @file src/components/theme-provider.tsx
 * Theme provider wrapper that connects app theme context.
 */
'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// Function ThemeProvider: handles a specific piece of application logic.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}



