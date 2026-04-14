import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Badge } from '@heroui/react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { CalendarIcon, LocationIcon, TicketIcon, HeartIcon } from '../Icons';
import { formatDistance } from '@/lib/distance';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  price: number;
  highlights?: string[];
  isSaved?: boolean;
  onSaveToggle?: (id: string, currentlySaved: boolean) => void;
  distance?: number; // Distance in kilometers
  distanceColor?: 'success' | 'warning' | 'default' | 'danger';
}

const EventCard = ({
  id,
  title,
  date,
  location,
  imageUrl,
  price,
  highlights = [],
  isSaved = false,
  onSaveToggle,
  distance,
  distanceColor = 'default',
}: EventCardProps) => {
  const dateParts = date ? date.split(' ') : [];
  const month = dateParts[0] ? dateParts[0].slice(0, 3).toUpperCase() : 'TBD';
  const day = dateParts[1] ? dateParts[1].replace(',', '') : '--';
  const isFree = price === 0;

  const handleHeartClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveToggle?.(id, isSaved);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className="group relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-2xl border-none bg-background/60 backdrop-blur-md"
        isPressable
        as={Link}
        to={`/events/${id}`}
      >
        <div className="relative h-56 overflow-hidden bg-default-100">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Save/Favorite Button */}
          <div
            role="button"
            tabIndex={0}
            aria-label={isSaved ? 'Remove from saved' : 'Save event'}
            onClick={handleHeartClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHeartClick(e); }}
            className="absolute top-3 right-3 p-2.5 bg-white/30 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-danger hover:shadow-lg transition-all cursor-pointer z-10"
          >
            <HeartIcon className={isSaved ? 'fill-danger text-danger' : ''} />
          </div>

          {/* Date Badge */}
          <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-md rounded-xl p-2 text-center min-w-[55px] shadow-lg border border-default-200/50">
            <div className="text-primary font-bold text-xs uppercase tracking-wider">{month}</div>
            <div className="text-2xl font-bold text-foreground leading-none mt-1">{day}</div>
          </div>
        </div>

        <CardBody className="p-5">
          <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="space-y-2.5 mb-2">
            <div className="flex items-center gap-3 text-sm text-default-600">
              <CalendarIcon className="text-primary/70" />
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-sm text-default-600 flex-1">
                <LocationIcon className="text-primary/70 flex-shrink-0" />
                <span className="line-clamp-1 font-medium">{location}</span>
              </div>
              {distance !== undefined && (
                <Badge
                  color={distanceColor}
                  size="sm"
                  variant="shadow"
                  className="flex-shrink-0 text-xs font-semibold"
                  content={
                    <div className="flex items-center gap-1">
                      <Zap size={12} />
                      {formatDistance(distance)}
                    </div>
                  }
                />
              )}
            </div>
          </div>
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {highlights.slice(0, 2).map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center rounded-full bg-primary-50 text-primary text-xs font-medium px-2.5 py-1"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </CardBody>

        <div className="px-5 pb-5 pt-0 flex justify-between items-end">
          <div>
            {isFree ? (
              <p className="text-xl font-bold text-success">Free</p>
            ) : price != null ? (
              <div>
                <p className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-1">Starting from</p>
                <p className="text-xl font-bold text-foreground">${price}</p>
              </div>
            ) : (
              <p className="text-sm font-medium text-default-400">Price TBD</p>
            )}
          </div>

          <Button
            color="primary"
            variant="flat"
            size="sm"
            className="font-semibold group-hover:bg-primary group-hover:text-white transition-colors"
            startContent={<TicketIcon />}
          >
            Get Tickets
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default EventCard;
