import React, { useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Spinner,
  Badge,
  Chip,
} from '@heroui/react';
import { MapPin, Clock, Route, AlertCircle, Loader } from 'lucide-react';
import { api } from '@/api/api';

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: any; // GeoJSON geometry
}

interface DirectionsPanelProps {
  eventId: number;
  eventLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onRouteLoaded?: (route: RouteInfo) => void;
}

/**
 * Panel for getting and displaying directions to an event
 * Shows distance, duration, and provides option to open full directions
 */
export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  eventId,
  eventLocation,
  userLocation,
  onRouteLoaded,
}) => {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocationNeeded, setUserLocationNeeded] = useState(!userLocation);

  // Handle getting directions
  const handleGetDirections = useCallback(() => {
    if (!userLocation) {
      setUserLocationNeeded(true);
      // Try to get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchDirections(position.coords.latitude, position.coords.longitude);
            setUserLocationNeeded(false);
          },
          () => {
            setError('Please enable location access to get directions');
          },
        );
      }
      return;
    }

    fetchDirections(userLocation.latitude, userLocation.longitude);
  }, [userLocation, eventId, eventLocation]);

  // Fetch directions from backend
  const fetchDirections = useCallback(
    async (fromLat: number, fromLng: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<RouteInfo>(`/events/${eventId}/directions`, {
          params: {
            fromLat,
            fromLng,
          },
        });

        if (response.data) {
          setRoute(response.data);
          onRouteLoaded?.(response.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to calculate directions');
      } finally {
        setLoading(false);
      }
    },
    [eventId, onRouteLoaded],
  );

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Calculate distance from coordinates (Haversine formula for display)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get straight-line distance if route not loaded
  const straightLineDistance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        eventLocation.latitude,
        eventLocation.longitude,
      )
    : null;

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex gap-3">
        <Route size={20} className="text-primary" />
        <div className="flex flex-col">
          <p className="font-semibold text-foreground">Directions</p>
          <p className="text-sm text-default-500">Get route to this event</p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* Location Info */}
        <div className="flex items-start gap-3 rounded-lg border border-default-100 bg-default-50 p-3">
          <MapPin size={16} className="mt-1 flex-shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-default-600">Event Location</p>
            <p className="text-sm text-foreground">{eventLocation.address}</p>
            <p className="text-xs text-default-500">{eventLocation.city}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Route Info */}
        {route ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-default-200 bg-background p-3">
                <Route size={18} className="text-success" />
                <div>
                  <p className="text-xs text-default-500">Distance</p>
                  <p className="font-semibold text-foreground">{formatDistance(route.distance)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-default-200 bg-background p-3">
                <Clock size={18} className="text-warning" />
                <div>
                  <p className="text-xs text-default-500">Duration</p>
                  <p className="font-semibold text-foreground">{formatDuration(route.duration)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary-200 bg-primary-50 p-3">
              <p className="text-xs font-semibold text-primary-700">✓ Route calculated successfully</p>
              <p className="text-xs text-primary-600">Open in your preferred maps app for turn-by-turn navigation</p>
            </div>

            {/* Open in Maps Buttons */}
            <div className="flex gap-2">
              <Button
                as="a"
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.latitude},${userLocation?.longitude}&destination=${eventLocation.latitude},${eventLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                color="primary"
                variant="flat"
                className="flex-1"
              >
                Google Maps
              </Button>
              <Button
                as="a"
                href={`https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLocation?.latitude},${userLocation?.longitude};${eventLocation.latitude},${eventLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                color="secondary"
                variant="light"
                className="flex-1"
              >
                OSM
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Straight-line distance estimate */}
            {straightLineDistance && (
              <div className="flex items-center gap-2 rounded-lg border border-default-100 bg-default-50 p-3">
                <MapPin size={16} className="text-default-500" />
                <div>
                  <p className="text-xs text-default-500">Approximate Distance</p>
                  <p className="font-semibold text-foreground">{straightLineDistance.toFixed(1)} km</p>
                </div>
              </div>
            )}

            {/* Get Directions Button */}
            <Button
              color="primary"
              onPress={handleGetDirections}
              isLoading={loading}
              fullWidth
              startContent={loading ? <Loader size={16} /> : <Route size={16} />}
            >
              {loading ? 'Calculating...' : 'Get Directions'}
            </Button>

            {userLocationNeeded && !loading && (
              <p className="text-xs text-default-500">
                ℹ️ Enable location access or click the button to get precise directions
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};
