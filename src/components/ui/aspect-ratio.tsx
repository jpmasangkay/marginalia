/** @file src/components/ui/aspect-ratio.tsx
 * Reusable UI component: aspect ratio.
 */
'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

// Function AspectRatio: handles a specific piece of application logic.
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }



