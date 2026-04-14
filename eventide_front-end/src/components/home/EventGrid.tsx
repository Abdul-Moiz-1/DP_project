import { Spinner } from '@heroui/react';
import EventCard, { EventCardProps } from '../events/EventCard';

interface EventGridProps {
  events: EventCardProps[];
  isLoading?: boolean;
}

const EventGrid = ({ events, isLoading = false }: EventGridProps) => {
  return (
    <section>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No events found</h3>
          <p className="text-default-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventGrid;