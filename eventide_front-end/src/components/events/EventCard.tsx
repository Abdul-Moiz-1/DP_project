import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, Chip, Button } from '@heroui/react';
import { CalendarIcon, LocationIcon, TicketIcon, HeartIcon } from '../Icons';
import React from 'react';

export interface EventCardProps {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  organizer: {
    id: number;
    name: string;
    email: string;
    organizerProfile?: {
      organizationName: string;
      city: string;
      state: string;
      country: string;
    };
  };
  location: {
    id: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    googleMapsLink?: string;
  };
  images: { id: number; imageUrl: string }[];
  tickets: { id: number; name: string; price: number; salesStartDate: string; salesEndDate: string }[];
  categories: { id: number; name: string }[];
  createdAt: string;
}

const EventCard = ({
  id,
  name,
  description,
  startDate,
  location,
  categories,
  tickets,
  images,
}: EventCardProps) => {
  const [liked, setLiked] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      time: date.toLocaleString('default', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  const eventDate = formatDate(startDate);

  const minPrice = tickets?.length
    ? Math.min(...tickets.map((t) => t.price))
    : null;
  const isFree = minPrice === 0;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      isPressable
      as={Link}
      to={`/events/${id}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0]?.imageUrl || '/placeholder-event.jpg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Favorite Button - positioned outside link flow */}
        <div
          role="button"
          tabIndex={0}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked(!liked);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
            }
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 rounded-full hover:bg-white dark:hover:bg-black transition-colors cursor-pointer z-10"
        >
          <HeartIcon />
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-3 left-3 bg-content1 rounded-lg p-2 text-center min-w-[60px] shadow-lg">
          <div className="text-primary font-bold text-xs">{eventDate.month}</div>
          <div className="text-2xl font-bold text-foreground">{eventDate.day}</div>
        </div>

        {/* Category */}
        {categories[0] && (
          <Chip
            size="sm"
            variant="flat"
            className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/90"
          >
            {categories[0].name}
          </Chip>
        )}
      </div>

      <CardBody className="p-4">
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-default-500 line-clamp-2 mb-3">
          {description}
        </p>
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-default-600">
            <CalendarIcon />
            <span>{eventDate.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-default-600">
            <LocationIcon />
            <span className="line-clamp-1">{location.city}, {location.country}</span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          {isFree ? (
            <p className="text-xl font-bold text-success">Free</p>
          ) : minPrice != null ? (
            <div>
              <p className="text-xs text-default-500">Starting from</p>
              <p className="text-xl font-bold text-primary">${minPrice}</p>
            </div>
          ) : (
            <p className="text-sm text-default-400">Price TBD</p>
          )}
        </div>

        <Button
          color="primary"
          variant="solid"
          size="sm"
          startContent={<TicketIcon />}
        >
          Get Tickets
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
