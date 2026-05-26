"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom marker icons
const createCustomIcon = (color = 'blue', size = 'medium') => {
  const sizes: Record<string, [number, number]> = {
    small: [20, 32],
    medium: [25, 41],
    large: [30, 50]
  };
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: sizes[size] || sizes.medium,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Map event handler component
const MapEvents = ({ onMapClick, onLocationFound }: { onMapClick?: any, onLocationFound?: any }) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick && onMapClick(e.latlng);
    },
    locationfound: (e) => {
      onLocationFound && onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
};

// Custom control component
const CustomControls = ({ onLocate, onToggleLayer, layers }: { onLocate: any, onToggleLayer: any, layers: any }) => {
  const map = useMap();

  useEffect(() => {
    const control = (L as any).control({ position: 'topright' });
    
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'custom-controls');
      div.innerHTML = `
        <div style="background: #18181b; color: white; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <button id="locate-btn" style="margin: 2px; padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; background: #27272a; color: white; font-size: 11px; font-weight: 600;">📍 Locate Me</button>
          <button id="satellite-btn" style="margin: 2px; padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; background: #27272a; color: white; font-size: 11px; font-weight: 600;">🛰️ Satellite</button>
          <button id="traffic-btn" style="margin: 2px; padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; background: #27272a; color: white; font-size: 11px; font-weight: 600;">🚦 Traffic</button>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(div);
      
      const locateBtn = div.querySelector('#locate-btn') as HTMLElement;
      const satelliteBtn = div.querySelector('#satellite-btn') as HTMLElement;
      const trafficBtn = div.querySelector('#traffic-btn') as HTMLElement;
      
      locateBtn.onclick = () => onLocate();
      satelliteBtn.onclick = () => onToggleLayer('satellite');
      trafficBtn.onclick = () => onToggleLayer('traffic');
      
      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, onLocate, onToggleLayer]);

  return null;
};

// Search component
const SearchControl = ({ onSearch }: { onSearch?: any }) => {
  const [query, setQuery] = useState('');
  const map = useMap();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latLng = [parseFloat(lat), parseFloat(lon)] as [number, number];
        map.flyTo(latLng, 13);
        onSearch && onSearch({ latLng, name: display_name });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    const control = (L as any).control({ position: 'topleft' });
    
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'search-control');
      div.innerHTML = `
        <div style="background: #18181b; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; gap: 5px; align-items: center;">
          <input 
            id="search-input" 
            type="text" 
            placeholder="Search places..." 
            style="padding: 6px 10px; border: 1px solid #27272a; border-radius: 6px; width: 180px; background: #09090b; color: white; font-size: 11px;"
          />
          <button 
            id="search-btn" 
            style="padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; background: #10b981; color: black; font-size: 11px; font-weight: bold;"
          >
            🔍
          </button>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(div);
      
      const input = div.querySelector('#search-input') as HTMLInputElement;
      const button = div.querySelector('#search-btn') as HTMLElement;
      
      input.addEventListener('input', (e: any) => setQuery(e.target.value));
      input.addEventListener('keypress', (e: any) => {
        if (e.key === 'Enter') handleSearch();
      });
      button.addEventListener('click', handleSearch);
      
      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, query]);

  return null;
};

export interface AdvancedMapProps {
  center?: number[];
  zoom?: number;
  markers?: any[];
  polygons?: any[];
  circles?: any[];
  polylines?: any[];
  onMarkerClick?: (marker: any) => void;
  onMapClick?: (latlng: any) => void;
  enableClustering?: boolean;
  enableSearch?: boolean;
  enableControls?: boolean;
  mapLayers?: {
    openstreetmap?: boolean;
    satellite?: boolean;
    traffic?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

// Main AdvancedMap component
export const AdvancedMap = ({
  center = [13.0827, 80.2707],
  zoom = 13,
  markers = [] as any[],
  polygons = [] as any[],
  circles = [] as any[],
  polylines = [] as any[],
  onMarkerClick,
  onMapClick,
  enableClustering = true,
  enableSearch = true,
  enableControls = true,
  mapLayers = {
    openstreetmap: true,
    satellite: false,
    traffic: false
  },
  className = '',
  style = { height: '500px', width: '100%' }
}: AdvancedMapProps) => {
  const [currentLayers, setCurrentLayers] = useState(mapLayers);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [clickedLocation, setClickedLocation] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle layer toggling
  const handleToggleLayer = useCallback((layerType: any) => {
    setCurrentLayers(prev => ({
      ...prev,
      [layerType]: !prev[layerType as keyof typeof prev]
    }));
  }, []);

  // Handle geolocation
  const handleLocate = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback((latlng: any) => {
    setClickedLocation(latlng);
    onMapClick && onMapClick(latlng);
  }, [onMapClick]);

  // Handle search results
  const handleSearch = useCallback((result: any) => {
    setSearchResult(result);
  }, []);

  if (!isMounted) return <div style={style} className="bg-zinc-900 animate-pulse rounded-3xl" />;

  return (
    <div className={`advanced-map ${className}`} style={style}>
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '24px' }}
        scrollWheelZoom={true}
      >
        {/* Base tile layers */}
        {currentLayers.openstreetmap && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {currentLayers.satellite && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Map events */}
        <MapEvents
          onMapClick={handleMapClick}
          onLocationFound={setUserLocation}
        />

        {/* Search control */}
        {enableSearch && <SearchControl onSearch={handleSearch} />}

        {/* Custom controls */}
        {enableControls && (
          <CustomControls
            onLocate={handleLocate}
            onToggleLayer={handleToggleLayer}
            layers={currentLayers}
          />
        )}

        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position}
            icon={marker.icon || createCustomIcon(marker.color, marker.size)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker)
            }}
          >
            {marker.popup && (
              <Popup>
                <div className="text-zinc-900">
                  <h3 className="font-bold text-sm mb-1">{marker.popup.title}</h3>
                  <p className="text-xs text-zinc-600 mb-2">{marker.popup.content}</p>
                  {marker.popup.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={marker.popup.image} 
                      alt={marker.popup.title}
                      style={{ maxWidth: '160px', height: 'auto', borderRadius: '4px' }}
                    />
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}


        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={createCustomIcon('red', 'medium')}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Search result marker */}
        {searchResult && (
          <Marker 
            position={searchResult.latLng}
            icon={createCustomIcon('green', 'large')}
          >
            <Popup>{searchResult.name}</Popup>
          </Marker>
        )}

        {/* Clicked location marker */}
        {clickedLocation && (
          <Marker 
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={createCustomIcon('orange', 'small')}
          >
            <Popup>
              Lat: {clickedLocation.lat.toFixed(6)}<br/>
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Polygons */}
        {polygons.map((polygon, index) => (
          <Polygon
            key={polygon.id || index}
            positions={polygon.positions}
            pathOptions={polygon.style || { color: 'purple', weight: 2, fillOpacity: 0.3 }}
          >
            {polygon.popup && <Popup>{polygon.popup}</Popup>}
          </Polygon>
        ))}

        {/* Circles */}
        {circles.map((circle, index) => (
          <Circle
            key={circle.id || index}
            center={circle.center}
            radius={circle.radius}
            pathOptions={circle.style || { color: 'blue', weight: 2, fillOpacity: 0.2 }}
          >
            {circle.popup && <Popup>{circle.popup}</Popup>}
          </Circle>
        ))}

        {/* Polylines */}
        {polylines.map((polyline, index) => (
          <Polyline
            key={polyline.id || index}
            positions={polyline.positions}
            pathOptions={polyline.style || { color: 'red', weight: 3 }}
          >
            {polyline.popup && <Popup>{polyline.popup}</Popup>}
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};
export default AdvancedMap;
