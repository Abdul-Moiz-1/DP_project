import React from "react";
import { Progress } from "@heroui/react";

interface Props {
  step: number;
  totalSteps: number;
}

const ProgressHeader: React.FC<Props> = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Step {step} of {totalSteps}</span>
        <span>{progress.toFixed(0)}%</span>
      </div>
      <Progress value={progress} color="primary" size="sm" />
    </div>
  );
};

export default ProgressHeader;
