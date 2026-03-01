/** @file src/components/ui/skeleton.tsx
 * Reusable UI component: skeleton.
 */
import { cn } from '@/lib/utils'

// Function Skeleton: handles a specific piece of application logic.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }



