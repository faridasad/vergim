import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, suffix, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {/* Start Icon (e.g. Email envelope) */}
        {startIcon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none [&_svg]:h-5 [&_svg]:w-5">
            {startIcon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            "flex h-13 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            // Add padding if icon is present
            startIcon && "pl-10",
            endIcon && "pr-10",
            suffix && "rounded-r-none border-r-0", // Remove right rounded corners if suffix exists
            className
          )}
          ref={ref}
          {...props}
        />

        {/* End Icon (e.g. Generic icon) */}
        {endIcon && !suffix && (
          <div className="absolute right-3 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
            {endIcon}
          </div>
        )}

        {/* Suffix Add-on (e.g. .joinposter.com) */}
        {suffix && (
          <div className="flex h-13 items-center rounded-r-lg border border-l-0 border-input bg-muted px-4 text-sm text-muted-foreground whitespace-nowrap font-medium">
            {suffix}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"


const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <Input
        type={showPassword ? "text" : "password"}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center focus:outline-none hover:text-foreground transition-colors h-full w-full"
            tabIndex={-1} // Prevent tabbing to the eye icon if desired
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        }
        ref={ref}
        className={className}
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { Input, PasswordInput }