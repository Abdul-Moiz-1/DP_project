import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { Crosshair, MapPin } from "lucide-react";

interface LocationPickerMapProps {
  addressLabel: string;
  latitude?: number;
  longitude?: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

export default function LocationPickerMap({
  addressLabel,
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
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
        }
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-large border-default-200 bg-content2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MapPin size={16} /> Location Coordinates
        </h3>
        <Button
          size="sm"
          variant="flat"
          color="primary"
          onPress={handleGetCurrentLocation}
          isLoading={loading}
          startContent={<Crosshair size={14} />}
        >
          Use My Location
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Latitude"
          value={latitude?.toString() || "0"}
          onChange={(e) =>
            onChange({
              latitude: parseFloat(e.target.value) || 0,
              longitude: longitude || 0,
            })
          }
        />
        <Input
          type="number"
          label="Longitude"
          value={longitude?.toString() || "0"}
          onChange={(e) =>
            onChange({
              latitude: latitude || 0,
              longitude: parseFloat(e.target.value) || 0,
            })
          }
        />
      </div>
      {addressLabel && (
        <p className="text-xs text-default-500">
          Selected location: {addressLabel}
        </p>
      )}
    </div>
  );
}
