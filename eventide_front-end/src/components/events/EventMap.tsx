import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Button, Spinner } from "@heroui/react";
import { Navigation, MapPin } from "lucide-react";
import { api } from "@/api/api";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface EventMapProps {
  latitude: number;
  longitude: number;
  eventName: string;
  address: string;
  eventId: number;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

const EventMap = ({ latitude, longitude, eventName, address, eventId }: EventMapProps) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center: [number, number] = [latitude, longitude];

  const handleGetDirections = () => {
    setError(null);
    setLoadingRoute(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoadingRoute(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const fromLat = position.coords.latitude;
        const fromLng = position.coords.longitude;
        setUserPos([fromLat, fromLng]);

        try {
          const res = await api.get(`/events/${eventId}/directions`, {
            params: { fromLat, fromLng },
          });
          const data = res.data;

          if (data.geometry?.coordinates) {
            const coords: [number, number][] = data.geometry.coordinates.map(
              (c: number[]) => [c[1], c[0]] as [number, number]
            );
            setRouteCoords(coords);
          }

          const distKm = (data.distance / 1000).toFixed(1);
          const durMin = Math.round(data.duration / 60);
          setRouteInfo({ distance: `${distKm} km`, duration: `${durMin} min` });
        } catch {
          setError("Could not calculate directions. Try again later.");
        } finally {
          setLoadingRoute(false);
        }
      },
      () => {
        setError("Location permission denied. Please enable location access.");
        setLoadingRoute(false);
      }
    );
  };

  const bounds: L.LatLngBoundsExpression | null = userPos
    ? [userPos, center]
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-default-200" style={{ height: 400 }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              <strong>{eventName}</strong>
              <br />
              {address}
            </Popup>
          </Marker>
          {userPos && (
            <Marker position={userPos}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          {routeCoords && (
            <Polyline positions={routeCoords} color="#006FEE" weight={4} opacity={0.8} />
          )}
          {bounds && <FitBounds bounds={bounds} />}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          color="primary"
          variant="flat"
          startContent={loadingRoute ? <Spinner size="sm" /> : <Navigation size={16} />}
          onPress={handleGetDirections}
          isDisabled={loadingRoute}
        >
          {loadingRoute ? "Getting Directions..." : "Get Directions"}
        </Button>

        {routeInfo && (
          <div className="flex gap-4 text-sm">
            <span className="text-default-600">
              <MapPin size={14} className="inline mr-1" />
              {routeInfo.distance}
            </span>
            <span className="text-default-600">
              ~{routeInfo.duration} drive
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
};

export default EventMap;
