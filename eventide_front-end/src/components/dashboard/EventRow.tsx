import { Link } from 'react-router-dom';
import { Button, Chip } from '@heroui/react';
import { BarChart2, Edit2, Trash2, Calendar } from 'lucide-react';
import type { Event } from '@/api/types';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PUBLISHED: 'success',
  DRAFT:     'warning',
  CANCELLED: 'danger',
  COMPLETED: 'default',
};

export function EventStatusChip({ status }: { status?: string }) {
  const color = STATUS_COLORS[status ?? ''] ?? 'default';
  return (
    <Chip size="sm" color={color} variant="flat">
      {status ?? 'DRAFT'}
    </Chip>
  );
}

interface EventRowProps {
  event: Event;
  onDeleteClick?: (id: number) => void;
}

const FALLBACK = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300';

const EventRow = ({ event, onDeleteClick }: EventRowProps) => {
  const dateStr = new Date(event.startDate).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-4 p-4 card-base hover:shadow-card-hover transition-shadow">
      {event.images?.[0]?.imageUrl ? (
        <img
          src={event.images[0].imageUrl}
          alt={event.name}
          className="h-14 w-20 rounded-lg object-cover flex-none"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />
      ) : (
        <div className="h-14 w-20 rounded-lg bg-default-100 flex items-center justify-center flex-none">
          <Calendar size={18} className="text-default-300" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{event.name}</p>
        <p className="text-xs text-default-400 mt-0.5">
          {dateStr} · {event.location?.city ?? '—'}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <EventStatusChip status={event.status} />
          <span className="text-xs text-default-400">
            {(event as any).bookings ?? 0} bookings
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-none">
        <Button
          as={Link}
          to={`/dashboard/event/${event.id}/analytics`}
          isIconOnly
          size="sm"
          variant="light"
          color="secondary"
          title="Analytics"
        >
          <BarChart2 size={15} />
        </Button>
        <Button
          as={Link}
          to={`/dashboard/event/${event.id}`}
          isIconOnly
          size="sm"
          variant="light"
          title="Edit"
        >
          <Edit2 size={15} />
        </Button>
        {onDeleteClick && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            title="Delete"
            onPress={() => onDeleteClick(event.id)}
          >
            <Trash2 size={15} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventRow;
