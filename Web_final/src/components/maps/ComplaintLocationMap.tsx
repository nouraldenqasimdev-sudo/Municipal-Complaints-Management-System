import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface ComplaintLocationMapProps {
  lat: number | string | null;
  lng: number | string | null;
  title?: string;
  address?: string;
}

const ComplaintLocationMap: React.FC<ComplaintLocationMapProps> = ({ lat, lng, title, address }) => {
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

  // تحويل القيم إلى numbers
  const latNum = Number(lat || 0);
  const lngNum = Number(lng || 0);

  if (!isClient) {
    return (
      <div className="h-[400px] bg-gray-50 animate-pulse rounded-[40px] flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">
        جارٍ تحميل الخريطة...
      </div>
    );
  }

  return (
    <div className="h-[400px] rounded-[40px] overflow-hidden border-4 border-gray-100 shadow-2xl">
      <MapContainer 
        center={[latNum, lngNum]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[latNum, lngNum]}>
          <Popup>
            <div className="text-right p-2 font-sans">
              {title && <p className="font-bold text-sm mb-1">{title}</p>}
              {address && <p className="text-xs text-gray-600 mb-1">{address}</p>}
              <p className="text-[10px] text-gray-500">الإحداثيات: {latNum.toFixed(6)}, {lngNum.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ComplaintLocationMap;
