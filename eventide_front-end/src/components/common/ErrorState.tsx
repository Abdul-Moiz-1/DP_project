import { Button } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-danger/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
        Something went wrong
      </h3>
      <p className="text-sm text-default-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button color="primary" variant="flat" onPress={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
