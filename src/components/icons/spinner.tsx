'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
export function IconSpinner({ className, ...props }: React.ComponentProps<'svg'>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" viewBox="0 0 18 18" 
        fill="currentColor"
        className={cn('size-4 animate-spin', className)}
        {...props}
      >
        <path d="M232 128a104 104 0 0 1-208 0c0-41 23.81-78.36 60.66-95.27a8 8 0 0 1 6.68 14.54C60.15 61.59 40 93.27 40 128a88 88 0 0 0 176 0c0-34.73-20.15-66.41-51.34-80.73a8 8 0 0 1 6.68-14.54C208.19 49.64 232 87 232 128Z" />
      </svg>
    )
  }