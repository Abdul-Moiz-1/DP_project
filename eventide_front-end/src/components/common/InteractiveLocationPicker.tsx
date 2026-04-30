import React, { useState, useCallback } from 'react';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { Crosshair, MapPin, Sparkles } from 'lucide-react';
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
    <Card className="overflow-hidden border border-divider bg-content1 shadow-card">
      <CardBody className="gap-5 px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Pin Your Venue</h3>
              <p className="text-sm text-default-500">Click the map or use your current position for precise placement.</p>
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            onPress={handleGetCurrentLocation}
            isLoading={loading}
            startContent={<Crosshair size={14} />}
          >
            My Location
          </Button>
        </div>

        <div className="rounded-3xl border border-divider bg-default-50/70 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles size={14} className="text-primary" />
              Live map preview
            </div>
            <div className="rounded-full bg-background/80 px-3 py-1 text-xs text-default-500 backdrop-blur">
              Click to reposition
            </div>
          </div>

        <MapComponent
          center={[latitude || 51.505, longitude || -0.09]}
          zoom={14}
          height="340px"
          markers={[
            {
              position: [latitude || 51.505, longitude || -0.09],
              label: 'Event Location',
              color: 'red',
              popup: addressLabel || 'Click the map to place your event marker',
            },
          ]}
          onMapClick={handleMapClick}
          interactive
        />
        </div>

        {/* Current Location Display */}
        {addressLabel && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary/80">Selected Location</p>
            <p className="mt-1 text-sm text-foreground">{addressLabel}</p>
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
            classNames={{
              inputWrapper: 'border border-divider bg-content1 shadow-none',
            }}
          />
          <Input
            type="number"
            label="Longitude"
            value={longitude?.toString() || '0'}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            step="0.0001"
            size="sm"
            variant="bordered"
            classNames={{
              inputWrapper: 'border border-divider bg-content1 shadow-none',
            }}
          />
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-divider bg-default-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-default-500">
            Use the map for precise placement, then fine-tune the written address fields above if needed.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
