/** @file src/layout.tsx
 * Layout wrapper that returns child content.
 */
import type { ReactNode } from 'react'

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <>{children}</>
}



