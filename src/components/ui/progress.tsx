"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { orientation?: 'horizontal' | 'vertical' }
>(({ className, value, orientation = "horizontal", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative w-full overflow-hidden rounded-full bg-secondary",
      orientation === "horizontal" ? "h-4" : "h-full w-full flex-col-reverse",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all",
        orientation === 'vertical' && 'h-auto w-full'
      )}
      style={
        orientation === 'horizontal'
          ? { transform: `translateX(-${100 - (value || 0)}%)` }
          : { transform: `translateY(${100 - (value || 0)}%)` }
      }
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
