import React, { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, Divider, Tabs, Tab } from '@heroui/react';
import { MapPin } from 'lucide-react';
import { MapComponent } from '../common/MapComponent';
import { DirectionsPanel } from '../common/DirectionsPanel';

interface EventLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
}

interface EventLocationMapProps {
  eventId: number;
  location: EventLocation;
  userLocation?: { latitude: number; longitude: number };
  onDirectionsLoaded?: (route: any) => void;
}

/**
 * Enhanced location map component for event details
 * Displays:
 * 1. Interactive map with event location marker
 * 2. Directions panel to get route
 * 3. Location information card
 */
export const EventLocationMap: React.FC<EventLocationMapProps> = ({
  eventId,
  location,
  userLocation,
  onDirectionsLoaded,
}) => {
  const [polylineCoords, setPolylineCoords] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  // Prepare markers
  const markers: Array<{
    position: [number, number];
    label?: string;
    color?: 'blue' | 'red' | 'green';
    popup?: string;
  }> = [];

  // Add event marker
  if (location.latitude && location.longitude) {
    markers.push({
      position: [location.latitude, location.longitude],
      label: 'Event Location',
      color: 'red' as const,
      popup: `${location.address}, ${location.city}, ${location.country}`,
    });
  }

  // Add user location marker if available
  if (userLocation) {
    markers.push({
      position: [userLocation.latitude, userLocation.longitude],
      label: 'Your Location',
      color: 'blue' as const,
      popup: 'Your Location',
    });
  }

  // Handle route loaded from directions panel
  const handleDirectionsLoaded = useCallback(
    (route: any) => {
      setRouteInfo(route);

      // Extract polyline coordinates from route geometry
      if (route.geometry && route.geometry.coordinates) {
        const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        setPolylineCoords(coords);
      }

      onDirectionsLoaded?.(route);
    },
    [onDirectionsLoaded],
  );

  const mapCenter: [number, number] = location.latitude && location.longitude
    ? [location.latitude, location.longitude]
    : [51.505, -0.09];

  return (
    <div className="space-y-4">
      {/* Map Card */}
      <Card className="border border-default-200">
        <CardHeader className="flex gap-3">
          <MapPin size={20} className="text-primary" />
          <div className="flex flex-col">
            <p className="font-semibold text-foreground">Event Location</p>
            <p className="text-sm text-default-500">Map & directions</p>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="gap-4">
          <Tabs
            defaultSelectedKey="map"
            className="w-full"
            variant="bordered"
            color="primary"
            classNames={{
              tabList: "gap-2 rounded-2xl bg-default-100/80 p-1.5",
              cursor: "rounded-xl bg-content1 shadow-sm ring-1 ring-default-200",
              tab: "h-11 rounded-xl px-5 text-default-500 data-[hover-unselected=true]:text-default-700",
              tabContent: "font-medium group-data-[selected=true]:text-primary",
              panel: "pt-4",
            }}
          >
            <Tab key="map" title="Map">
              <div>
                <MapComponent
                  center={mapCenter}
                  zoom={14}
                  height="400px"
                  markers={markers}
                  polyline={polylineCoords || undefined}
                  polylineColor="#3b82f6"
                />
              </div>
            </Tab>

            <Tab key="details" title="Information">
              <div className="space-y-4">
                {/* Address Section */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Address</p>
                  <p className="mt-1 text-foreground">{location.address}</p>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-default-400">City</p>
                    <p className="mt-1 text-foreground">{location.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-default-400">State</p>
                    <p className="mt-1 text-foreground">{location.state}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Country</p>
                    <p className="mt-1 text-foreground">{location.country}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Postal Code</p>
                    <p className="mt-1 text-foreground">{location.postalCode}</p>
                  </div>
                </div>

                {/* Coordinates */}
                {location.latitude && location.longitude && (
                  <div className="rounded-lg border border-default-200 bg-default-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Coordinates</p>
                    <p className="mt-1 font-mono text-sm text-foreground">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                )}

                {/* Google Maps Link */}
                {location.googleMapsLink && (
                  <a
                    href={location.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-primary hover:underline"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Directions Panel */}
      {location.latitude && location.longitude && (
        <DirectionsPanel
          eventId={eventId}
          eventLocation={{
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            city: location.city,
          }}
          userLocation={userLocation}
          onRouteLoaded={handleDirectionsLoaded}
        />
      )}

      {/* Route Summary */}
      {routeInfo && (
        <Card className="border border-success-200 bg-success-50">
          <CardBody className="gap-2 text-success p-4">
            <p className="text-sm font-semibold">✓ Route calculated successfully</p>
            <p className="text-xs">
              Distance: {(routeInfo.distance / 1000).toFixed(1)}km • Duration:{' '}
              {Math.round(routeInfo.duration / 60)}min
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
