// src/components/home/EventGrid.tsx
import {Spinner} from '@heroui/react';
import EventCard, { EventCardProps } from '../events/EventCard';
import { Event } from '@/api/types';

interface EventGridProps {
  events: EventCardProps[];
  // events: Event[];
  isLoading?: boolean;
}

const EventGrid = ({
  events,
  isLoading = false,
}: EventGridProps) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
       

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-default-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          /* Event Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventGrid;