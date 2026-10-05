import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ETB') {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function truncate(value: string, max = 40) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}
