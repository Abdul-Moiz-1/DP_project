import { Spinner } from "@heroui/react";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

const LoadingState = ({ label = "Loading...", className = "" }: LoadingStateProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <Spinner size="lg" color="primary" label={label} />
    </div>
  );
};

export default LoadingState;
