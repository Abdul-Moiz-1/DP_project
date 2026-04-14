import { MapPin } from 'lucide-react';

interface EventMapProps {
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    googleMapsLink?: string;
  };
}

export function EventMap({ location }: EventMapProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-large border-default-200 bg-content2">
      <div className="flex items-center gap-2">
        <MapPin size={24} className="text-primary" />
        <div>
          <h3 className="text-md font-semibold">{location.address}</h3>
          <p className="text-sm text-default-500">
            {location.city}, {location.state} {location.postalCode}, {location.country}
          </p>
        </div>
      </div>
      {location.googleMapsLink && (
        <a
          href={location.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm hover:underline"
        >
          View on Google Maps
        </a>
      )}
    </div>
  );
}
