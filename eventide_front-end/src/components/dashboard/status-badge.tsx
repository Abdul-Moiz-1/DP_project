import { Chip } from "@heroui/react"

interface StatusBadgeProps {
  status: "selling-fast" | "on-sale" | "sold-out" | "pending" | "completed"
  variant?: "bordered" | "flat"
}

export function StatusBadge({ status, variant = "bordered" }: StatusBadgeProps) {
  const statusConfig = {
    "selling-fast": {
      color: "warning" as const,
      label: "Selling Fast",
    },
    "on-sale": {
      color: "success" as const,
      label: "On Sale",
    },
    "sold-out": {
      color: "danger" as const,
      label: "Sold Out",
    },
    pending: {
      color: "default" as const,
      label: "Pending",
    },
    completed: {
      color: "success" as const,
      label: "Completed",
    },
  }

  const config = statusConfig[status]

  return (
    <Chip color={config.color} variant={variant} size="sm" className="font-medium">
      {config.label}
    </Chip>
  )
}
