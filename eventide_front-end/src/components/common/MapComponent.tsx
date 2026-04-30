import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type MarkerColor = "blue" | "red" | "green";

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: MarkerColor;
    popup?: string;
  }>;
  polyline?: [number, number][];
  polylineColor?: string;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const markerStyles: Record<MarkerColor, string> = {
  blue: "from-sky-500 to-blue-600",
  red: "from-rose-500 to-orange-500",
  green: "from-emerald-500 to-teal-500",
};

export const MapComponent = forwardRef<MapRef, MapComponentProps>(
  (
    {
      center = [51.505, -0.09],
      zoom = 13,
      height = "400px",
      markers = [],
      polyline,
      polylineColor = "#8b5cf6",
      onMapClick,
      interactive = true,
    },
    forwardedRef,
  ) => {
    const mapRef = useRef<MapRef | null>(null);
    const [popupIndex, setPopupIndex] = useState<number | null>(null);

    const routeGeoJson = useMemo(
      () =>
        polyline && polyline.length > 1
          ? {
              type: "FeatureCollection" as const,
              features: [
                {
                  type: "Feature" as const,
                  geometry: {
                    type: "LineString" as const,
                    coordinates: polyline.map(([lat, lng]) => [lng, lat]),
                  },
                  properties: {},
                },
              ],
            }
          : null,
      [polyline],
    );

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      if (routeGeoJson?.features.length) {
        const coordinates = routeGeoJson.features[0].geometry.coordinates;
        const lngs = coordinates.map(([lng]) => lng);
        const lats = coordinates.map(([, lat]) => lat);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 64, duration: 900, maxZoom: 15 },
        );
        return;
      }

      if (markers.length > 1) {
        const lngs = markers.map((marker) => marker.position[1]);
        const lats = markers.map((marker) => marker.position[0]);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 64, duration: 900, maxZoom: 15 },
        );
        return;
      }

      map.flyTo({
        center: [center[1], center[0]],
        zoom,
        duration: 900,
      });
    }, [center, zoom, markers, routeGeoJson]);

    const handleClick = (event: MapLayerMouseEvent) => {
      if (!interactive || !onMapClick) return;
      onMapClick(event.lngLat.lat, event.lngLat.lng);
      setPopupIndex(null);
    };

    return (
      <div
        className="relative overflow-hidden rounded-[24px] border border-white/40 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,246,255,0.72))] shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.22),_transparent_40%),linear-gradient(180deg,rgba(16,18,27,0.96),rgba(24,24,36,0.92))]"
        style={{ height, width: "100%" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/10 to-transparent dark:from-black/25" />

        <Map
          ref={(instance) => {
            mapRef.current = instance;
            if (typeof forwardedRef === "function") {
              forwardedRef(instance);
            } else if (forwardedRef) {
              forwardedRef.current = instance;
            }
          }}
          initialViewState={{
            longitude: center[1],
            latitude: center[0],
            zoom,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          onClick={handleClick}
          dragPan={interactive}
          scrollZoom={interactive}
          doubleClickZoom={interactive}
          touchZoomRotate={interactive}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={interactive} visualizePitch={false} />

          {routeGeoJson && (
            <Source id="route-line" type="geojson" data={routeGeoJson}>
              <Layer
                id="route-glow"
                type="line"
                paint={{
                  "line-color": polylineColor,
                  "line-width": 10,
                  "line-opacity": 0.18,
                  "line-blur": 1.8,
                }}
              />
              <Layer
                id="route-line-main"
                type="line"
                paint={{
                  "line-color": polylineColor,
                  "line-width": 5,
                  "line-opacity": 0.92,
                }}
              />
            </Source>
          )}

          {markers.map((marker, index) => (
            <Marker
              key={`${marker.position[0]}-${marker.position[1]}-${index}`}
              longitude={marker.position[1]}
              latitude={marker.position[0]}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                setPopupIndex(index);
              }}
            >
              <button
                type="button"
                aria-label={marker.label || "Map marker"}
                className="group relative"
              >
                <div className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${markerStyles[marker.color || "blue"]} opacity-25 blur-md transition-transform duration-300 group-hover:scale-110`} />
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-gradient-to-br ${markerStyles[marker.color || "blue"]} text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition-transform duration-300 group-hover:-translate-y-0.5`}>
                  <MapPin size={18} fill="currentColor" />
                </div>
              </button>
            </Marker>
          ))}

          {popupIndex !== null && markers[popupIndex] && (
            <Popup
              longitude={markers[popupIndex].position[1]}
              latitude={markers[popupIndex].position[0]}
              anchor="top"
              offset={18}
              closeButton={false}
              closeOnClick={false}
              onClose={() => setPopupIndex(null)}
              className="maplibre-premium-popup"
            >
              <div className="min-w-[180px] p-1">
                {markers[popupIndex].label && (
                  <p className="text-sm font-semibold text-foreground">{markers[popupIndex].label}</p>
                )}
                {markers[popupIndex].popup && (
                  <p className="mt-1 text-xs leading-relaxed text-default-500">{markers[popupIndex].popup.replace(/<br\s*\/?>/g, ", ").replace(/<[^>]+>/g, "")}</p>
                )}
              </div>
            </Popup>
          )}
        </Map>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full border border-white/50 bg-background/85 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-default-500 backdrop-blur-md dark:border-white/10 dark:bg-black/45">
          Eventide Maps
        </div>
      </div>
    );
  },
);

MapComponent.displayName = "MapComponent";
