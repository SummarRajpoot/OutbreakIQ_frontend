'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Custom icons for Green and Red markers
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Hospital {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  type: string;
  diseases: string[];
  emergency: boolean;
  beds: number;
  rating: number;
  can_treat?: boolean;
}

interface MapComponentProps {
  hospitals: Hospital[];
  center: [number, number];
  zoom: number;
}

// Component to handle map view updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ hospitals, center, zoom }: MapComponentProps) {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative z-10">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hospitals.map((hospital) => (
          <Marker 
            key={hospital.id} 
            position={[hospital.lat, hospital.lng]}
            icon={hospital.can_treat ? greenIcon : redIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-slate-900 text-lg mb-1">{hospital.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${hospital.can_treat ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {hospital.can_treat ? 'Can Treat ✅' : 'Not Equipped ❌'}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                    {hospital.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1"><strong>Address:</strong> {hospital.address}</p>
                <p className="text-sm text-slate-600 mb-1"><strong>Phone:</strong> {hospital.phone}</p>
                <p className="text-sm text-slate-600"><strong>Beds:</strong> {hospital.beds}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
