import { Chip } from '@heroui/react';
import { Calendar, Clock, Users } from 'lucide-react';
import type { ReactNode } from 'react';

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-1.5 text-default-400 mb-1">
        <Icon size={13} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-semibold text-sm text-foreground leading-snug">{value}</p>
    </div>
  );
}

interface EventInfoCardProps {
  event: {
    startDate: string | Date;
    endDate: string | Date;
    capacity: number;
    bookings?: number | null;
    description: string;
    categories: { id: number; name: string }[];
  };
}

export default function EventInfoCard({ event }: EventInfoCardProps) {
  const start = new Date(event.startDate);
  const end   = new Date(event.endDate);
  const sold  = event.bookings ?? 0;

  const dateStr  = start.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const endTime   = end.toLocaleTimeString(undefined,   { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Quick-facts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoPill icon={Calendar} label="Date"     value={dateStr} />
        <InfoPill icon={Clock}    label="Time"     value={`${startTime} – ${endTime}`} />
        <InfoPill icon={Users}    label="Capacity" value={`${sold.toLocaleString()} / ${event.capacity.toLocaleString()}`} />
      </div>

      {/* About */}
      <section>
        <h2 className="font-display text-xl font-semibold mb-3">About this event</h2>
        <p className="text-default-600 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </section>

      {/* Categories */}
      {event.categories.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-default-400 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {event.categories.map((c) => (
              <Chip key={c.id} variant="flat" color="primary" size="sm">
                {c.name}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
