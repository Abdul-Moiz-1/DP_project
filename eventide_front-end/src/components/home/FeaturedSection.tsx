import { Link } from 'react-router-dom';
import EventCard, { EventCardProps } from '../events/EventCard';
import { EventCardSkeleton } from '../common/LoadingState';

const CATEGORY_CHIPS = [
  { emoji: '🎵', label: 'Music', query: 'Music' },
  { emoji: '💻', label: 'Tech', query: 'Technology' },
  { emoji: '🎨', label: 'Arts', query: 'Arts+%26+Culture' },
  { emoji: '🍕', label: 'Food', query: 'Food+%26+Drink' },
  { emoji: '⚽', label: 'Sports', query: 'Sports+%26+Fitness' },
  { emoji: '😂', label: 'Comedy', query: 'Comedy+%26+Entertainment' },
  { emoji: '🏕️', label: 'Outdoors', query: 'Travel+%26+Outdoor' },
  { emoji: '🎮', label: 'Gaming', query: 'Gaming+%26+Esports' },
  { emoji: '💼', label: 'Business', query: 'Business+%26+Networking' },
  { emoji: '🧘', label: 'Wellness', query: 'Health+%26+Wellness' },
];

interface FeaturedSectionProps {
  events: EventCardProps[];
  isLoading?: boolean;
}

const FeaturedSection = ({ events, isLoading = false }: FeaturedSectionProps) => {
  if (events.length === 0 && !isLoading) return null;

  return (
    <div>
      {/* Category quick-filter strip */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8" style={{ scrollbarWidth: 'none' }}>
        {CATEGORY_CHIPS.map((cat) => (
          <Link
            key={cat.label}
            to={`/events?category=${cat.query}`}
            className="flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-default-100 text-default-600 hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap"
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Trending Events</h2>
          <p className="text-sm text-default-500 mt-1">Most popular events right now</p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
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

export default FeaturedSection;
