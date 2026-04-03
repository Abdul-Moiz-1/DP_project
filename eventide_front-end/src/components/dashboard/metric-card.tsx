// src/components/dashboard/MetricCard.tsx
import React from "react";
import { Card, CardBody } from "@heroui/react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative";
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  icon,
}) => {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardBody className="p-5 flex flex-col gap-3">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-default-500 font-medium">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          </div>
          {icon && <div className="p-2 rounded-lg bg-default-100">{icon}</div>}
        </div>

        {/* Change Indicator */}
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              changeType === "positive"
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {changeType === "positive" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </CardBody>
    </Card>
  );
};

