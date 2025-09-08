import * as React from "react"
import Image from "next/image"
import type { HTMLAttributes } from "react"

interface DeeplistAIIconProps extends HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
}

export function DeeplistAIIcon({ 
  width = 24, 
  height = 24, 
  className, 
  ...props 
}: DeeplistAIIconProps) {
  return (
    <div className={className} {...props}>
      <Image
        src="/deeplistai-logo.png"
        alt="Deeplist AI Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  )
}
