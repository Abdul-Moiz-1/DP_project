import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Heart, Users } from 'lucide-react';
import { formatDistance } from '@/lib/distance';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  price: number;
  category?: string;
  attendeeCount?: number;
  highlights?: string[];
  isSaved?: boolean;
  onSaveToggle?: (id: string, currentlySaved: boolean) => void;
  distance?: number;
  distanceColor?: 'success' | 'warning' | 'default' | 'danger';
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600';

const EventCard = ({
  id,
  title,
  date,
  location,
  imageUrl,
  price,
  category,
  attendeeCount,
  highlights = [],
  isSaved = false,
  onSaveToggle,
  distance,
}: EventCardProps) => {
  const isFree = price === 0;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveToggle?.(id, isSaved);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/events/${id}`}
        className="card-base overflow-hidden group block transition-all duration-200 hover:-translate-y-0.5"
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-default-100">
          <img
            src={imageUrl || FALLBACK_IMG}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          />

          {/* Category badge */}
          {category && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              {category}
            </div>
          )}

          {/* Save button */}
          <button
            aria-label={isSaved ? 'Remove from saved' : 'Save event'}
            onClick={handleHeartClick}
            className={cn(
              'absolute top-3 right-3 p-1.5 rounded-full transition-all',
              isSaved
                ? 'bg-white/90 text-danger'
                : 'bg-white/90 backdrop-blur-sm text-default-500 hover:text-danger hover:bg-white'
            )}
          >
            <Heart size={16} className={isSaved ? 'fill-danger' : ''} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-default-500 mb-1.5">
            <Calendar size={13} className="flex-none" />
            <span>{date}</span>
            {distance !== undefined && (
              <span className="ml-auto text-xs text-default-400">{formatDistance(distance)}</span>
            )}
          </div>

          <h3 className="font-display font-semibold text-base leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-default-500">
            <MapPin size={12} className="flex-none" />
            <span className="truncate">{location}</span>
          </div>

          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {highlights.slice(0, 2).map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-medium"
                >
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-3 flex items-center justify-between border-t border-divider">
          {attendeeCount !== undefined && attendeeCount > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-default-500">
              <Users size={13} />
              <span>+{attendeeCount} attending</span>
            </div>
          ) : (
            <span />
          )}

          {isFree ? (
            <span className="text-sm font-medium text-success">Free</span>
          ) : price != null ? (
            <span className="text-sm font-semibold text-primary">From ${price}</span>
          ) : (
            <span className="text-xs text-default-400">Price TBD</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
