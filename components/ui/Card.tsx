import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'relative overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-white border border-cream-200',
          'shadow-soft rounded-3xl',
        ],
        warm: [
          'bg-gradient-card border border-cream-300',
          'shadow-warm rounded-3xl',
        ],
        forest: [
          'bg-gradient-forest text-white',
          'shadow-forest rounded-3xl',
        ],
        navy: [
          'bg-navy-800 text-white',
          'shadow-soft-lg rounded-3xl',
        ],
        glass: [
          'glass border border-white/60',
          'shadow-soft rounded-3xl',
        ],
        outline: [
          'bg-transparent border-2 border-cream-300',
          'rounded-3xl',
        ],
      },
      padding: {
        none: 'p-0',
        sm:   'p-4',
        md:   'p-6',
        lg:   'p-8',
        xl:   'p-10',
      },
      hover: {
        lift:  'hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer',
        glow:  'hover:shadow-glow-amber cursor-pointer',
        scale: 'hover:scale-[1.02] cursor-pointer',
        none:  '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover:   'none',
    },
  }
)

// ============================================================
// CARD ROOT
// ============================================================
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cardVariants({ variant, padding, hover, className })}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

// ============================================================
// CARD HEADER
// ============================================================
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col gap-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

// ============================================================
// CARD TITLE
// ============================================================
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-serif text-xl font-semibold leading-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

// ============================================================
// CARD DESCRIPTION
// ============================================================
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-navy-600 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  )
)
CardDescription.displayName = 'CardDescription'

// ============================================================
// CARD CONTENT
// ============================================================
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`${className}`} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

// ============================================================
// CARD FOOTER
// ============================================================
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center pt-4 mt-4 border-t border-cream-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)
CardFooter.displayName = 'CardFooter'

// ============================================================
// CARD IMAGE WRAPPER
// ============================================================
const CardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
}>(
  ({ className = '', aspectRatio = 'video', children, ...props }, ref) => {
    const ratioClass = {
      square:   'aspect-square',
      video:    'aspect-video',
      portrait: 'aspect-[3/4]',
      wide:     'aspect-[16/9]',
    }[aspectRatio]

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${ratioClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardImage.displayName = 'CardImage'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  cardVariants,
}
