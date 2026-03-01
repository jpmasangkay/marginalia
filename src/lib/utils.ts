/** @file src/lib/utils.ts
 * Shared utility helpers (class name merging and common helpers).
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Function cn: handles a specific piece of application logic.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



