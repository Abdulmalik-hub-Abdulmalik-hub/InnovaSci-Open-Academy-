import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-green-500/20 text-green-400 hover:bg-green-500/30",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
        outline: "text-foreground",
        
        // InnovaSci Brand Color Variants
        // Primary Purple - Innovation
        purple: "border-transparent bg-[hsl(var(--brand-purple))] text-[hsl(var(--brand-purple-foreground))] hover:bg-[hsl(var(--brand-purple-dark))]",
        "purple-outline": "border border-[hsl(var(--brand-purple))] text-[hsl(var(--brand-purple))] bg-transparent hover:bg-[hsl(var(--brand-purple))/10]",
        "purple-subtle": "border-transparent bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))]",
        
        // Primary Blue - Intelligence
        blue: "border-transparent bg-[hsl(var(--brand-blue))] text-[hsl(var(--brand-blue-foreground))] hover:bg-[hsl(var(--brand-blue-dark))]",
        "blue-outline": "border border-[hsl(var(--brand-blue))] text-[hsl(var(--brand-blue))] bg-transparent hover:bg-[hsl(var(--brand-blue))/10]",
        "blue-subtle": "border-transparent bg-[hsl(var(--brand-blue))/10] text-[hsl(var(--brand-blue))]",
        
        // Teal - Science
        teal: "border-transparent bg-[hsl(var(--brand-teal))] text-[hsl(var(--brand-teal-foreground))] hover:bg-[hsl(var(--brand-teal-dark))]",
        "teal-outline": "border border-[hsl(var(--brand-teal))] text-[hsl(var(--brand-teal))] bg-transparent hover:bg-[hsl(var(--brand-teal))/10]",
        "teal-subtle": "border-transparent bg-[hsl(var(--brand-teal))/10] text-[hsl(var(--brand-teal))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
