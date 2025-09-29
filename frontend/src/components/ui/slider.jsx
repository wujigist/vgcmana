"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import clsx from "clsx"

export const Slider = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={clsx(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <SliderPrimitive.Range className="absolute h-full bg-blue-500 dark:bg-blue-400" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-blue-500 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = "Slider"
