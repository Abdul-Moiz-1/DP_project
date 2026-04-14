import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Event } from "@/api/types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EventsResultsMapProps {
  events: Event[];
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [24, 24] });
    }
  }, [map, points]);

  return null;
}

export default function EventsResultsMap({ events }: EventsResultsMapProps) {
  const points = useMemo(() => {
    return events
      .filter(
        (event) =>
          typeof event.location?.latitude === "number" &&
          typeof event.location?.longitude === "number",
      )
      .map((event) => ({
        event,
        point: [event.location.latitude as number, event.location.longitude as number] as [number, number],
      }));
  }, [events]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-default-200 bg-background">
      <div className="px-4 py-3 border-b border-default-200">
        <h2 className="text-lg font-semibold text-foreground">Map View</h2>
        <p className="text-sm text-default-500">
          Explore matching events geographically and open any pin for details.
        </p>
      </div>
      <div style={{ height: 360 }}>
        <MapContainer
          center={points[0].point}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points.map((item) => item.point)} />
          {points.map(({ event, point }) => (
            <Marker key={event.id} position={point}>
              <Popup>
                <div className="space-y-2 min-w-[180px]">
                  <div>
                    <div className="font-semibold text-foreground">{event.name}</div>
                    <div className="text-xs text-default-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-default-600">
                    {event.location.address}, {event.location.city}, {event.location.country}
                  </div>
                  <Link to={`/events/${event.id}`} className="text-sm font-medium text-primary">
                    Open event
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
