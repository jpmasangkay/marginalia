/** @file src/lib/utils.ts
 * Shared utility helpers (class name merging and common helpers).
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



