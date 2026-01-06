import * as React from "react"
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

type SelectVariant = "default" | "ghost"

interface SharedSelectProps {
  label?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
  disabled?: boolean
  variant?: SelectVariant
}

export function Select({
  label,
  options,
  placeholder = "Select an option",
  value,
  onChange,
  error,
  className,
  disabled,
  variant = "default",
}: SharedSelectProps) {
  
  // Define styles for each variant
  const variantStyles: Record<SelectVariant, string> = {
    // Default: Keeps the standard border and background from shadcn
    default: "",
    
    // Ghost: Removes border/shadow, makes background transparent, uses Primary text color
    // We use '!border-none' and '!bg-transparent' to forcefully override shadcn defaults if necessary
    ghost: "border-none shadow-none bg-transparent text-primary hover:bg-primary/5 hover:text-primary focus:ring-0 px-0 h-auto"
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", variant === "ghost" ? "w-auto" : "")}>
      {label && (
        <label className="text-sm font-medium leading-none text-foreground peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <SelectRoot value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          className={cn(
            "w-full transition-colors",
            // Apply the variant styles
            variantStyles[variant],
            // Error state (only applies border if not ghost, or red text if ghost)
            error && (variant === "default" ? "border-destructive focus:ring-destructive" : "text-destructive"),
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent>
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No options available
            </div>
          )}
        </SelectContent>
      </SelectRoot>

      {error && (
        <span className="text-xs font-medium text-destructive">
          {error}
        </span>
      )}
    </div>
  )
}