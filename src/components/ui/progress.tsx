import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentProps<"div"> & {
  value?: number
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export { Progress }