'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, Minimize2, List } from 'lucide-react';

interface Property {
  slug: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  beds: number;
  baths: number;
  parking: number;
  type: string;
  purpose: string;
  lat?: number;
  lng?: number;
  photo: string;
}

interface PropertyMapProps {
  properties: Property[];
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
}

// South Africa center coordinates
const SA_CENTER = { lat: -33.9249, lng: 18.4241 };
const ZA_BOUNDS = {
  north: -22.1,
  south: -34.8,
  east: 32.9,
  west: 16.5,
};

export function PropertyMap({ properties, selectedSlug, onSelect }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import of Leaflet (client-side only)
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [SA_CENTER.lat, SA_CENTER.lng],
        zoom: 10,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
        .addTo(map);

      // Tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for properties with coordinates
      addMarkers(L, map, properties);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        (marker as { remove: () => void }).remove();
      });
      markersRef.current = [];

      addMarkers(L, map, properties);
    };

    updateMarkers();
  }, [properties, selectedSlug]);

  // Fit bounds when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || properties.length === 0) return;

    const fitBounds = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;

      const coords = properties
        .filter((p) => p.lat && p.lng)
        .map((p) => [p.lat!, p.lng!] as [number, number]);

      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      }
    };

    fitBounds();
  }, [properties]);

  function addMarkers(L: typeof import('leaflet'), map: ReturnType<typeof L.map>, props: Property[]) {
    props.forEach((property) => {
      if (!property.lat || !property.lng) return;

      const isSelected = property.slug === selectedSlug;
      const isHovered = property.slug === hoveredSlug;

      // Custom price marker
      const priceLabel = property.price.length > 12
        ? `${property.price.slice(0, 10)}...`
        : property.price;

      const icon = L.divIcon({
        className: 'price-marker',
        html: `
          <div class="
            flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-lg
            ${isSelected ? 'bg-[#4A3AFF] text-white ring-2 ring-[#4A3AFF]/30' : 'bg-white text-[#1A1A2E] border border-[#E5E7EB]'}
            ${isHovered ? 'scale-110' : ''}
            transition-transform cursor-pointer whitespace-nowrap
          ">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="3" fill="${isSelected ? '#fff' : '#4A3AFF'}"/>
            </svg>
            ${priceLabel}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([property.lat, property.lng], { icon })
        .addTo(map)
        .on('click', () => {
          onSelect?.(property.slug);
        })
        .on('mouseover', () => {
          setHoveredSlug(property.slug);
        })
        .on('mouseout', () => {
          setHoveredSlug(null);
        });

      markersRef.current.push(marker);
    });
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white ${expanded ? 'fixed inset-4 z-50' : 'h-[280px] sm:h-[400px]'}`}>
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Property count badge */}
      <div className="absolute left-3 top-3 z-[1000] rounded-lg bg-white px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#4A3AFF]" />
          <span className="text-xs font-bold text-[#1A1A2E]">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
      </div>

      {/* Expand/collapse button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="absolute right-3 top-3 z-[1000] flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg transition hover:bg-[#F7F8FA]"
        aria-label={expanded ? 'Collapse map' : 'Expand map'}
      >
        {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-[10px] shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#4A3AFF]" /> For sale
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#00C9A7]" /> To rent
          </span>
        </div>
      </div>
    </div>
  );
}
