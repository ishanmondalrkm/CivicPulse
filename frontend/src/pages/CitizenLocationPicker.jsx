import React, { useEffect, useState } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = L.divIcon({
  className: 'civicpulse-map-marker',
  html: '<div style="width:18px;height:18px;border-radius:999px;background:#2563eb;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function ClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
        address: 'Location selected on map'
      });
    }
  });
  return null;
}

function Recenter({ location }) {
  // Kept intentionally lightweight: the map remains user-navigable after GPS capture.
  return null;
}

export default function CitizenLocationPicker({ location, onChange }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const getCurrentLocation = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported by this browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        onChange({ latitude, longitude, address: 'Current GPS location' });
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError(error.code === 1 ? 'Please allow location access in your browser.' : 'Could not determine your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    // No automatic GPS request: the citizen explicitly controls location access.
  }, []);

  const center = [location?.latitude || 12.9784, location?.longitude || 77.6408];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">GPS Location</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Use GPS or click directly on the map. No manual ward selection is required.</p>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gpsLoading}
          data-testid="use-current-location-btn"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-60"
        >
          {gpsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
          {gpsLoading ? 'Locating…' : 'Use My Current Location'}
        </button>
      </div>

      {gpsError && <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">{gpsError}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 h-64 bg-slate-100">
        <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <Recenter location={location} />
          <Marker position={center} icon={markerIcon} />
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="block text-slate-400 font-semibold">Latitude</span>
          <span className="font-mono font-bold text-slate-700">{location?.latitude ?? '—'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="block text-slate-400 font-semibold">Longitude</span>
          <span className="font-mono font-bold text-slate-700">{location?.longitude ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}
