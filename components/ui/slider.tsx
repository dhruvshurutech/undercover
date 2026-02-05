"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )
  const stepCount =
    typeof step === "number" && step > 0 ? Math.floor((max - min) / step) : 0
  const showPips = stepCount > 1 && stepCount <= 12

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted/70 rounded-full data-horizontal:h-2 data-vertical:w-2 relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
      >
        {showPips && (
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            {Array.from({ length: stepCount + 1 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-border"
              />
            ))}
          </div>
        )}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-ring ring-ring/50 relative size-5 rounded-full border-2 border-primary/60 bg-card shadow-sm transition-[color,box-shadow,transform] after:absolute after:-inset-3 hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:scale-105 active:ring-2 block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
