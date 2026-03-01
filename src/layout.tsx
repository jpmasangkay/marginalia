/** @file src/layout.tsx
 * Layout wrapper that returns child content.
 */
import type { ReactNode } from 'react'

type RootLayoutProps = {
  children: ReactNode
}

// Function RootLayout: handles a specific piece of application logic.
export default function RootLayout({ children }: RootLayoutProps) {
  return <>{children}</>
}



