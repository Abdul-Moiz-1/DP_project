// src/components/home/FeaturedSection.tsx
import { Spinner } from '@heroui/react';
import EventCard, { EventCardProps } from '../events/EventCard';

interface FeaturedSectionProps {
  events: EventCardProps[];
  isLoading?: boolean;
}

const FeaturedSection = ({ events, isLoading = false }: FeaturedSectionProps) => {
  if (events.length === 0 && !isLoading) {
    return null; // Don't show section if no featured events
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-primary-50/50 to-background dark:from-primary-900/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            Featured Events ⭐
          </h2>
          <p className="text-default-500">
            Hand-picked events you won't want to miss
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" color="primary" />
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

export default FeaturedSection;