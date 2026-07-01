import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default uses Primary Purple - Innovation
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // InnovaSci Brand Color Variants
        // Primary Purple - Innovation: Main buttons, active states, primary accents
        purple: "bg-[hsl(var(--brand-purple))] text-[hsl(var(--brand-purple-foreground))] hover:bg-[hsl(var(--brand-purple-dark))] shadow-sm hover:shadow-md transition-all",
        "purple-outline": "border-2 border-[hsl(var(--brand-purple))] text-[hsl(var(--brand-purple))] hover:bg-[hsl(var(--brand-purple))] hover:text-[hsl(var(--brand-purple-foreground))]",
        "purple-ghost": "text-[hsl(var(--brand-purple))] hover:bg-[hsl(var(--brand-purple))/10]",
        
        // Primary Blue - Intelligence: Overlays, AI features, structural elements
        blue: "bg-[hsl(var(--brand-blue))] text-[hsl(var(--brand-blue-foreground))] hover:bg-[hsl(var(--brand-blue-dark))] shadow-sm hover:shadow-md transition-all",
        "blue-outline": "border-2 border-[hsl(var(--brand-blue))] text-[hsl(var(--brand-blue))] hover:bg-[hsl(var(--brand-blue))] hover:text-[hsl(var(--brand-blue-foreground))]",
        "blue-ghost": "text-[hsl(var(--brand-blue))] hover:bg-[hsl(var(--brand-blue))/10]",
        
        // Teal - Science: CTAs, success states, research badges
        teal: "bg-[hsl(var(--brand-teal))] text-[hsl(var(--brand-teal-foreground))] hover:bg-[hsl(var(--brand-teal-dark))] shadow-sm hover:shadow-md transition-all",
        "teal-outline": "border-2 border-[hsl(var(--brand-teal))] text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal))] hover:text-[hsl(var(--brand-teal-foreground))]",
        "teal-ghost": "text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal))/10]",
        
        // Gradient variants - Combining brand colors for impact
        "gradient-purple-blue": "bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all",
        "gradient-all": "bg-gradient-to-r from-[hsl(var(--brand-purple))] via-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))] text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
