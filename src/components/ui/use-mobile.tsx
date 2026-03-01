/** @file src/components/ui/use-mobile.tsx
 * UI-local hook that exposes mobile detection behavior.
 */
import * as React from 'react'

const MOBILE_BREAKPOINT = 768

// Function useIsMobile: handles a specific piece of application logic.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(  // Function: implements scoped behavior for this module.
() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange =     // Function onChange: implements reusable behavior.
() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return     // Function: implements scoped behavior for this module.
() => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}



