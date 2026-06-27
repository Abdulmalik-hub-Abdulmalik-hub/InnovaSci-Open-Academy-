"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={(e) => {
          props.onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <Select ref={ref} className={className} {...props}>
      {children}
    </Select>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("relative", className)}>{children}</div>
)
SelectContent.displayName = "SelectContent"

const SelectItem = ({ children, value, className, ...props }: { 
  children?: React.ReactNode
  value?: string
  className?: string
}) => (
  <option value={value} className={cn("bg-[#1a1a2e] text-white", className)} {...props}>
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

const SelectValue = ({ children, placeholder }: { 
  children?: React.ReactNode
  placeholder?: string 
}) => <>{children || placeholder}</>
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }