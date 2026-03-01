/** @file src/components/ui/spinner.tsx
 * Reusable UI component: spinner.
 */
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

// Function Spinner: handles a specific piece of application logic.
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }



