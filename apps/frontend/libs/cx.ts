import { ClassArray, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cx(...inputs: ClassArray) {
  return twMerge(clsx(inputs))
}
