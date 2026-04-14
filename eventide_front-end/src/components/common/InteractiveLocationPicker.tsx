import React, { useState, useCallback } from 'react';
import { Button, Input, Spinner, Card, CardBody } from '@heroui/react';
import { Crosshair, MapPin, Search } from 'lucide-react';
import { MapComponent } from './MapComponent';

interface InteractiveLocationPickerProps {
  addressLabel: string;
  latitude?: number;
  longitude?: number;
  onChange: (coords: { latitude: number; longitude: number; address?: string }) => void;
}

/**
 * Interactive location picker with visual map
 * Allows users to:
 * 1. See current location on map
 * 2. Click map to pick new location
 * 3. Use geolocation API to get current position
 * 4. Enter coordinates manually
 */
export const InteractiveLocationPicker: React.FC<InteractiveLocationPickerProps> = ({
  addressLabel,
  latitude = 51.505,
  longitude = -0.09,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle getting current location from browser geolocation
  const handleGetCurrentLocation = useCallback(() => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          console.error('Geolocation error');
          setLoading(false);
        },
      );
    }
  }, [onChange]);

  // Handle map click to pick location
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onChange({
        latitude: lat,
        longitude: lng,
      });
    },
    [onChange],
  );

  // Handle manual coordinate input
  const handleLatitudeChange = useCallback(
    (value: string) => {
      const lat = parseFloat(value) || 0;
      onChange({
        latitude: lat,
        longitude: longitude || 0,
      });
    },
    [longitude, onChange],
  );

  const handleLongitudeChange = useCallback(
    (value: string) => {
      const lng = parseFloat(value) || 0;
      onChange({
        latitude: latitude || 0,
        longitude: lng,
      });
    },
    [latitude, onChange],
  );

  return (
    <Card className="border border-default-200 bg-content2">
      <CardBody className="gap-4 px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">Pick Location</h3>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={handleGetCurrentLocation}
            isLoading={loading}
            startContent={<Crosshair size={14} />}
          >
            My Location
          </Button>
        </div>

        {/* Map */}
        <MapComponent
          center={[latitude || 51.505, longitude || -0.09]}
          zoom={13}
          height="300px"
          markers={[
            {
              position: [latitude || 51.505, longitude || -0.09],
              label: 'Event Location',
              color: 'red',
              popup: 'Click map to move marker',
            },
          ]}
          onMapClick={handleMapClick}
          interactive
        />

        {/* Current Location Display */}
        {addressLabel && (
          <div className="rounded-lg border border-default-200 bg-background px-3 py-2">
            <p className="text-xs font-medium text-default-400">Selected Location:</p>
            <p className="text-sm text-foreground">{addressLabel}</p>
          </div>
        )}

        {/* Coordinate Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Latitude"
            value={latitude?.toString() || '0'}
            onChange={(e) => handleLatitudeChange(e.target.value)}
            step="0.0001"
            size="sm"
            variant="bordered"
          />
          <Input
            type="number"
            label="Longitude"
            value={longitude?.toString() || '0'}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            step="0.0001"
            size="sm"
            variant="bordered"
          />
        </div>

        {/* Info */}
        <div className="rounded-lg border border-default-100 bg-default-50 px-3 py-2">
          <p className="text-xs text-default-500">
            💡 Click anywhere on the map to set the location, or use the "My Location" button to get your current
            position
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
