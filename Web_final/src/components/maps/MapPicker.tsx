import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onLocationSelect }: MapPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const newPosition = new L.LatLng(lat, lng);
        setPosition(newPosition);
        onLocationSelect(lat, lng);
      }
    },
  });

  useEffect(() => {
    if (isInitialized) return;
    
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            const newPosition = new L.LatLng(lat, lng);
            setPosition(newPosition);
            onLocationSelect(lat, lng);
            setIsInitialized(true);
          }
        },
        () => {
          const defaultLat = 33.5138;
          const defaultLng = 36.2765;
          const defaultPosition = new L.LatLng(defaultLat, defaultLng);
          setPosition(defaultPosition);
          onLocationSelect(defaultLat, defaultLng);
          setIsInitialized(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      const defaultLat = 33.5138;
      const defaultLng = 36.2765;
      const defaultPosition = new L.LatLng(defaultLat, defaultLng);
      setPosition(defaultPosition);
      onLocationSelect(defaultLat, defaultLng);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return position === null ? null : (
    <Marker position={position} />
  );
};

const MapPicker = ({ onLocationSelect }: MapPickerProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  if (!isClient) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" />;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border-2 border-gray-200">
      <MapContainer 
        center={[33.5138, 36.2765]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
