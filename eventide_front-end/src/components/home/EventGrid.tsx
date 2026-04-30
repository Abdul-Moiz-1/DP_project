import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import EventCard, { EventCardProps } from '../events/EventCard';
import { EventCardSkeleton } from '../common/LoadingState';

interface EventGridProps {
  events: EventCardProps[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

const EventGrid = ({
  events,
  isLoading = false,
  title,
  subtitle,
  showViewAll = true,
}: EventGridProps) => {
  return (
    <div>
      {title && (
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-default-500 mt-1">{subtitle}</p>}
          </div>
          {showViewAll && (
            <Button
              as={Link}
              to="/events"
              variant="flat"
              size="sm"
              endContent={<ArrowRight size={14} />}
              className="flex-none"
            >
              View all
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="font-display text-lg font-semibold mb-1">No events found</h3>
          <p className="text-sm text-default-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventGrid;
