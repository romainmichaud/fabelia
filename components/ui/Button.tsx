'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ============================================================
// VARIANTS
// ============================================================
const buttonVariants = cva(
  // Base
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-sans font-semibold',
    'rounded-full',
    'transition-all duration-200 ease-out',
    'cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-4',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-amber text-white',
          'shadow-warm',
          'hover:shadow-warm-lg hover:-translate-y-0.5',
          'focus-visible:ring-amber-400/30',
        ],
        forest: [
          'bg-gradient-forest text-white',
          'shadow-forest',
          'hover:shadow-lg hover:-translate-y-0.5',
          'focus-visible:ring-forest-400/30',
        ],
        outline: [
          'bg-transparent border-2 border-amber-400 text-amber-500',
          'hover:bg-amber-400/10 hover:border-amber-500',
          'focus-visible:ring-amber-400/20',
        ],
        ghost: [
          'bg-transparent text-navy-700',
          'hover:bg-cream-200',
          'focus-visible:ring-navy-400/20',
        ],
        white: [
          'bg-white text-navy-800',
          'shadow-soft',
          'hover:shadow-soft-lg hover:-translate-y-0.5',
          'focus-visible:ring-amber-400/20',
        ],
        navy: [
          'bg-navy-800 text-white',
          'shadow-soft',
          'hover:bg-navy-900 hover:-translate-y-0.5',
          'focus-visible:ring-navy-400/30',
        ],
        danger: [
          'bg-terra-500 text-white',
          'hover:bg-terra-600 hover:-translate-y-0.5',
          'focus-visible:ring-terra-400/30',
        ],
      },
      size: {
        xs: 'h-8  px-4  text-xs',
        sm: 'h-10 px-5  text-sm',
        md: 'h-12 px-6  text-base',
        lg: 'h-14 px-8  text-lg',
        xl: 'h-16 px-10 text-xl',
      },
      fullWidth: {
        true:  'w-full',
        false: 'w-auto',
      },
      rounded: {
        full: 'rounded-full',
        xl:   'rounded-2xl',
        lg:   'rounded-xl',
      },
    },
    defaultVariants: {
      variant:   'primary',
      size:      'md',
      fullWidth: false,
      rounded:   'full',
    },
  }
)

// ============================================================
// LOADING SPINNER
// ============================================================
function LoadingSpinner() {
  return (
    <span className="flex items-center justify-center" aria-hidden="true">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  )
}

// ============================================================
// COMPONENT
// ============================================================
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buttonVariants({ variant, size, fullWidth, rounded, className })}
        {...props}
      >
        {/* Shine effect overlay */}
        <span
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <span className="absolute inset-0 translate-x-full rotate-12 translate-y-full opacity-0 group-hover:opacity-30 bg-white transition-opacity duration-500" />
        </span>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 -ml-1">{leftIcon}</span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className="shrink-0 -mr-1">{rightIcon}</span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
