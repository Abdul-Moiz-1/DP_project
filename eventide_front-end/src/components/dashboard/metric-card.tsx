import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_MAP = {
  primary:   { bg: 'bg-primary/10',   text: 'text-primary'   },
  success:   { bg: 'bg-success/10',   text: 'text-success'   },
  warning:   { bg: 'bg-warning/10',   text: 'text-warning'   },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  danger:    { bg: 'bg-danger/10',    text: 'text-danger'    },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: keyof typeof COLOR_MAP;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: MetricCardProps) => {
  const colors = COLOR_MAP[color];

  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-default-500 uppercase tracking-wide">{title}</p>
          <p className="font-display text-3xl font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-default-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5 flex-none', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 mt-3 text-xs font-medium',
            trend.value >= 0 ? 'text-success' : 'text-danger',
          )}
        >
          {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
};
