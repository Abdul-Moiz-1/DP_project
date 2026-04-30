import { Spinner } from '@heroui/react';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

const LoadingState = ({ label = 'Loading...', className = '' }: LoadingStateProps) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <Spinner size="lg" color="primary" label={label} />
    </div>
  );
};

export default LoadingState;

export function PageLoader() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner color="primary" size="lg" />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="card-base overflow-hidden animate-pulse">
      <div className="h-44 bg-default-200 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-3.5 bg-default-200 rounded-full w-1/3" />
        <div className="h-5 bg-default-200 rounded-full w-3/4" />
        <div className="h-3.5 bg-default-200 rounded-full w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 w-6 bg-default-200 rounded-full" />
          <div className="h-3.5 bg-default-200 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
