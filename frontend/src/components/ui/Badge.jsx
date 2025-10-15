import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"; // Or use relative path "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        approved: "border-transparent bg-green-100 text-green-800",
        pending: "border-transparent bg-yellow-100 text-yellow-800",
        rejected: "border-transparent bg-red-100 text-red-800",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    (<div className={cn(badgeVariants({ variant }), className)} {...props} />)
  )
}

export { Badge, badgeVariants }