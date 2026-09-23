import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface AdminMapProps {
  reports?: any[];
}

const AdminMap: React.FC<AdminMapProps> = ({ reports = [] }) => {
  const [isClient, setIsClient] = useState(false);
  const defaultCenter: [number, number] = [33.5138, 36.2765];

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

  if (!isClient) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />;

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {reports && reports.map((report, idx) => (
        <CircleMarker 
          key={report.id || idx}
          center={[report.lat || report.location_lat || 33.5, report.lng || report.location_lng || 36.2]}
          radius={10}
          pathOptions={{ 
            color: report.priority === 'urgent' ? '#ef4444' : '#f59e0b', 
            fillColor: report.priority === 'urgent' ? '#ef4444' : '#f59e0b', 
            fillOpacity: 0.6 
          }}
        >
          <Popup>
            <div className="text-right p-1 font-sans">
              <p className="font-bold text-sm mb-1">{report.title}</p>
              <p className="text-[10px] text-gray-500">الحالة: {report.status}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default AdminMap;
