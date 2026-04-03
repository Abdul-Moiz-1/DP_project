"use client"

import type React from "react"
import { Card, CardBody } from "@heroui/react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: number
  trend?: "up" | "down"
}

export default function MetricCard({ title, value, icon, change, trend }: MetricCardProps) {
  return (
    <Card className="bg-card border border-border">
      <CardBody className="gap-3 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          </div>
          {icon && <div className="text-primary/60">{icon}</div>}
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            {trend === "up" ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={trend === "up" ? "text-green-500 text-sm font-medium" : "text-red-500 text-sm font-medium"}
            >
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
