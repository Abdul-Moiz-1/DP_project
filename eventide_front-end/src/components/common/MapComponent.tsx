import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: LatLngExpression;
    label?: string;
    color?: 'blue' | 'red' | 'green';
    popup?: string;
  }>;
  polyline?: LatLngExpression[];
  polylineColor?: string;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

/**
 * Reusable Leaflet map component using OpenStreetMap tiles
 * Provides a foundation for both location picking and event display
 */
export const MapComponent = React.forwardRef<LeafletMap, MapComponentProps>(
  (
    {
      center = [51.505, -0.09],
      zoom = 13,
      height = '400px',
      markers = [],
      polyline: polylineCoords,
      polylineColor = '#3b82f6',
      onMapClick,
      interactive = true,
    },
    ref,
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);

    // Initialize map
    useEffect(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: center as L.LatLngExpression,
        zoom,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle click events
      if (onMapClick && interactive) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Forward ref
      if (typeof ref === 'function') {
        ref(map);
      } else if (ref) {
        ref.current = map;
      }

      return () => {
        // Don't destroy on re-render, only on unmount
      };
    }, []);

    // Update zoom
    useEffect(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }, [zoom]);

    // Update center
    useEffect(() => {
      if (mapInstanceRef.current && center) {
        mapInstanceRef.current.panTo(center as L.LatLngExpression);
      }
    }, [center]);

    // Update markers
    useEffect(() => {
      if (!mapInstanceRef.current) return;

      // Clear old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach((markerData) => {
        const marker = L.marker(markerData.position, {
          icon: getColoredIcon(markerData.color || 'blue'),
        }).addTo(mapInstanceRef.current!);

        if (markerData.popup) {
          marker.bindPopup(markerData.popup);
        }

        if (markerData.label) {
          marker.bindTooltip(markerData.label, { permanent: false });
        }

        markersRef.current.push(marker);
      });
    }, [markers]);

    // Update polyline
    useEffect(() => {
      if (!mapInstanceRef.current) return;

      // Remove old polyline
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // Add new polyline
      if (polylineCoords && polylineCoords.length > 1) {
        polylineRef.current = L.polyline(polylineCoords as L.LatLngExpression[], {
          color: polylineColor,
          weight: 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(mapInstanceRef.current);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds(polylineCoords as L.LatLngExpression[]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [polylineCoords, polylineColor]);

    return (
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      />
    );
  },
);

MapComponent.displayName = 'MapComponent';

/**
 * Get colored marker icon for different marker types
 */
function getColoredIcon(color: 'blue' | 'red' | 'green'): L.Icon {
  const colors: Record<string, string> = {
    blue: '3b82f6',
    red: 'ef4444',
    green: '22c55e',
  };

  const colorHex = colors[color] || colors.blue;

  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
