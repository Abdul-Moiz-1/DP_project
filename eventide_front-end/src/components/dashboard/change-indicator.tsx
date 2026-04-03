import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface ChangeIndicatorProps {
  value: number
  type: "positive" | "negative"
  showIcon?: boolean
  showLabel?: string
}

export function ChangeIndicator({ value, type, showIcon = true, showLabel }: ChangeIndicatorProps) {
  const isPositive = type === "positive"
  const color = isPositive ? "text-green-600" : "text-red-600"

  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${color}`}>
      {showIcon && <>{isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}</>}
      <span>
        {value}%{showLabel && ` ${showLabel}`}
      </span>
    </div>
  )
}
