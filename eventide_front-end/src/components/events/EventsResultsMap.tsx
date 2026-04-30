import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/api/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface PopupInfo {
  longitude: number;
  latitude: number;
  id: number;
  name: string;
  startDate: string;
  city: string;
  country: string;
}

interface EventsResultsMapProps {
  events: Event[];
  className?: string;
}

export default function EventsResultsMap({ events, className }: EventsResultsMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [cursor, setCursor] = useState("auto");

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: events
        .filter(
          (e) =>
            typeof e.location?.latitude === "number" &&
            typeof e.location?.longitude === "number",
        )
        .map((e) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [
              e.location.longitude as number,
              e.location.latitude as number,
            ],
          },
          properties: {
            id: e.id,
            name: e.name,
            startDate: e.startDate,
            city: e.location.city,
            country: e.location.country,
          },
        })),
    }),
    [events],
  );

  // Fit map to all visible event points whenever they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || geojson.features.length === 0) return;

    if (geojson.features.length === 1) {
      const [lng, lat] = geojson.features[0].geometry.coordinates;
      map.flyTo({ center: [lng, lat], zoom: 13, duration: 800 });
      return;
    }

    const lngs = geojson.features.map((f) => f.geometry.coordinates[0]);
    const lats = geojson.features.map((f) => f.geometry.coordinates[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 14, duration: 800 },
    );
  }, [geojson]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current;
    if (!map || !e.features || e.features.length === 0) return;

    const feature = e.features[0];

    if (feature.layer.id === "clusters") {
      if (feature.geometry.type === "Point") {
        map.flyTo({
          center: feature.geometry.coordinates as [number, number],
          zoom: (map.getZoom() || 10) + 2,
        });
      }
      return;
    }

    if (feature.layer.id === "unclustered-point") {
      if (feature.geometry.type !== "Point") return;
      const [longitude, latitude] = feature.geometry.coordinates as [number, number];
      const p = feature.properties as Record<string, any>;
      setPopupInfo({
        longitude,
        latitude,
        id: p.id,
        name: p.name,
        startDate: p.startDate,
        city: p.city,
        country: p.country,
      });
    }
  }, []);

  if (geojson.features.length === 0) return null;

  const defaultCenter = geojson.features[0].geometry.coordinates as [number, number];

  return (
    <div className={`overflow-hidden rounded-xl border border-divider ${className ?? "h-[480px]"}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: defaultCenter[0],
          latitude: defaultCenter[1],
          zoom: 10,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        cursor={cursor}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("auto")}
        onClick={handleClick}
        attributionControl={false}
      >
        <Source
          id="events"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            source="events"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#8b5cf6",
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20, 10,
                28, 50,
                36,
              ] as any,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.9,
            }}
          />

          {/* Cluster event count */}
          <Layer
            id="cluster-count"
            type="symbol"
            source="events"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 13,
            } as any}
            paint={{ "text-color": "#ffffff" }}
          />

          {/* Individual event dots */}
          <Layer
            id="unclustered-point"
            type="circle"
            source="events"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": "#8b5cf6",
              "circle-radius": 10,
              "circle-stroke-width": 2.5,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.9,
            }}
          />
        </Source>

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            maxWidth="220px"
          >
            <div className="p-3 min-w-[180px]">
              <p className="font-semibold text-sm line-clamp-2 mb-1.5">
                {popupInfo.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-default-500 mb-0.5">
                <Calendar size={11} />
                {new Date(popupInfo.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1 text-xs text-default-500 mb-2.5">
                <MapPin size={11} />
                {popupInfo.city}, {popupInfo.country}
              </div>
              <Link
                to={`/events/${popupInfo.id}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View event →
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
