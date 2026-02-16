'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  noPadding?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, noPadding = false, children, ...props }, ref) => {
    const Component = hover ? motion.div : 'div'
    const motionProps = hover
      ? {
          whileHover: { scale: 1.02, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' },
          transition: { duration: 0.2 },
        }
      : {}

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-xl border border-gray-200 bg-white shadow-card',
          !noPadding && 'p-6',
          className
        )}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'
