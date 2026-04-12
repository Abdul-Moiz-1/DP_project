import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-danger mb-4">
        <AlertCircle size={48} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Error</h3>
      <p className="text-default-500 text-sm max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button color="primary" variant="flat" onPress={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
