import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { INPUT_SHELL_CLASS } from "@/lib/design/classes"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 border transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        INPUT_SHELL_CLASS,
        className
      )}
      {...props}
    />
  )
}

export { Input }
