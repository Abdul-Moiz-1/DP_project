import { Button } from '@heroui/react';
import { Inbox } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-default-500 max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button color="primary" variant="flat" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
