import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------
// Fix Leaflet marker icons
// ----------------------------------------------------

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// ----------------------------------------------------
// Recenter map when GPS location changes
// ----------------------------------------------------

function RecenterMap({ lat, lng, followUser }) {
  const map = useMap();

  useEffect(() => {
    if (followUser) {
      map.setView([lat, lng], 16, {
        animate: true
      });
    }
  }, [lat, lng, followUser, map]);

  return null;
}

// ----------------------------------------------------
// Handle clicking on the real map
// ----------------------------------------------------

function MapClickHandler({ onLocationSelect, ward, address }) {
  useMapEvents({
    click(e) {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));

      const pinAddress =
        `Pinned Location: ${newLat}, ${newLng}`;

      onLocationSelect({
        latitude: newLat,
        longitude: newLng,
        address: pinAddress,
        ward: ward
      });
    }
  });

  return null;
}

// ----------------------------------------------------
// Main MapPicker component
// ----------------------------------------------------

export default function MapPicker({ location, onChange }) {

  // --------------------------------------------------
  // Initial location
  // --------------------------------------------------

  const [lat, setLat] = useState(
    location?.latitude ?? 20.2961
  );

  const [lng, setLng] = useState(
    location?.longitude ?? 85.8245
  );

  const [address, setAddress] = useState(
    location?.address || ''
  );

  const [ward, setWard] = useState(
    location?.ward || 'Select Ward'
  );

  // --------------------------------------------------
  // GPS states
  // --------------------------------------------------

  const [isLocating, setIsLocating] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [followUser, setFollowUser] = useState(false);

  // Stores browser GPS watcher ID
  const watchId = useRef(null);

  // --------------------------------------------------
  // Generate Ward 1 - Ward 100
  // --------------------------------------------------

  const predefinedWards = Array.from(
    { length: 100 },
    (_, index) => `Ward ${index + 1}`
  );

  // --------------------------------------------------
  // Send current data to parent
  // --------------------------------------------------

  const sendLocationToParent = (
    newLat,
    newLng,
    newAddress,
    newWard
  ) => {
    onChange({
      latitude: newLat,
      longitude: newLng,
      address: newAddress,
      ward: newWard
    });
  };

  // --------------------------------------------------
  // START REAL-TIME GPS TRACKING
  // --------------------------------------------------

  const startLocationTracking = () => {

    if (!navigator.geolocation) {
      alert(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    // If already tracking, stop it
    if (isTracking) {
      stopLocationTracking();
      return;
    }

    setIsLocating(true);
    setFollowUser(true);

    watchId.current =
      navigator.geolocation.watchPosition(

        // --------------------------------------------
        // GPS SUCCESS
        // --------------------------------------------

        (position) => {

          const newLat = Number(
            position.coords.latitude.toFixed(6)
          );

          const newLng = Number(
            position.coords.longitude.toFixed(6)
          );

          const accuracy = Math.round(
            position.coords.accuracy
          );

         const gpsAddress =
  `GPS: ${newLat}, ${newLng} | Accuracy: ${accuracy}m`;

          // Update map coordinates
          setLat(newLat);
          setLng(newLng);

          // Update displayed address
          setAddress(gpsAddress);

          setIsLocating(false);
          setIsTracking(true);

          // IMPORTANT:
          // Ward is NOT changed by GPS.
          // Whatever ward user selected remains selected.

          onChange({
            latitude: newLat,
            longitude: newLng,
            address: gpsAddress,
            ward: ward,
            accuracy: accuracy
          });
        },

        // --------------------------------------------
        // GPS ERROR
        // --------------------------------------------

        (error) => {

          console.error(
            'Geolocation error:',
            error
          );

          setIsLocating(false);
          setIsTracking(false);
          setFollowUser(false);

          if (error.code === 1) {

            alert(
              'Location permission was denied. Please allow location access in your browser.'
            );

          } else if (error.code === 2) {

            alert(
              'Your location could not be determined. Please try again.'
            );

          } else if (error.code === 3) {

            alert(
              'Location request timed out. Please try again.'
            );

          } else {

            alert(
              'Unable to get your current location.'
            );
          }
        },

        // --------------------------------------------
        // GPS OPTIONS
        // --------------------------------------------

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
  };

  // --------------------------------------------------
  // STOP GPS TRACKING
  // --------------------------------------------------

  const stopLocationTracking = () => {

    if (watchId.current !== null) {

      navigator.geolocation.clearWatch(
        watchId.current
      );

      watchId.current = null;
    }

    setIsTracking(false);
    setIsLocating(false);
    setFollowUser(false);
  };

  // --------------------------------------------------
  // Cleanup GPS watcher when component disappears
  // --------------------------------------------------

  useEffect(() => {

    return () => {

      if (watchId.current !== null) {

        navigator.geolocation.clearWatch(
          watchId.current
        );

        watchId.current = null;
      }
    };

  }, []);

  // --------------------------------------------------
  // MANUAL MAP LOCATION
  // --------------------------------------------------

  const handleManualLocation = ({
    latitude,
    longitude,
    address: newAddress
  }) => {

    // Stop following GPS when user manually selects
    // another point on the map.
    setFollowUser(false);

    setLat(latitude);
    setLng(longitude);
    setAddress(newAddress);

    // IMPORTANT:
    // Ward stays exactly the same.

    onChange({
      latitude: latitude,
      longitude: longitude,
      address: newAddress,
      ward: ward
    });
  };

  // --------------------------------------------------
  // WARD SELECTION
  // --------------------------------------------------

  const handleWardSelect = (e) => {

    const selectedWard = e.target.value;

    setWard(selectedWard);

    // IMPORTANT:
    //
    // Selecting a ward does NOT:
    // - change latitude
    // - change longitude
    // - move the map
    // - move the marker
    //
    // Ward is only user information.

    onChange({
      latitude: lat,
      longitude: lng,
      address: address,
      ward: selectedWard
    });
  };

  // --------------------------------------------------
  // ADDRESS CHANGE
  // --------------------------------------------------

  const handleAddressChange = (e) => {

    const newAddress = e.target.value;

    setAddress(newAddress);

    // Address change also does NOT move the map.

    onChange({
      latitude: lat,
      longitude: lng,
      address: newAddress,
      ward: ward
    });
  };

  // --------------------------------------------------
  // Map starting position
  // --------------------------------------------------

  const mapCenter = [lat, lng];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      className="space-y-3"
      data-testid="map-picker-component"
    >

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}

      <div className="flex flex-wrap items-center justify-between gap-2">

        <div className="flex items-center gap-2">

          <MapPin className="h-4 w-4 text-blue-600" />

          <span className="text-sm font-semibold text-slate-800">
            Location Details
          </span>

        </div>

        {/* GPS BUTTON */}

        <button
          type="button"
          onClick={startLocationTracking}
          disabled={isLocating}
          data-testid="use-current-location-btn"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            isTracking
              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
              : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
          }`}
        >

          <Navigation
            className={`h-3.5 w-3.5 ${
              isLocating
                ? 'animate-spin'
                : ''
            }`}
          />

          {isLocating
            ? 'Detecting GPS...'
            : isTracking
            ? 'Stop GPS Tracking'
            : 'Use My Current Location'}

        </button>

      </div>

      {/* ============================================ */}
      {/* WARD + ADDRESS */}
      {/* ============================================ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

        {/* ------------------------------------------ */}
        {/* WARD */}
        {/* ------------------------------------------ */}

        <div>

          <label className="block text-xs font-medium text-slate-600 mb-1">
            Select Municipal Ward
          </label>

          <select
            value={ward}
            onChange={handleWardSelect}
            data-testid="ward-selector-dropdown"
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="Select Ward">
              Select Ward
            </option>

            {predefinedWards.map((wardName) => (

              <option
                key={wardName}
                value={wardName}
              >
                {wardName}
              </option>

            ))}

          </select>

        </div>

        {/* ------------------------------------------ */}
        {/* ADDRESS */}
        {/* ------------------------------------------ */}

        <div>

          <label className="block text-xs font-medium text-slate-600 mb-1">
            Street / Landmark Address
          </label>

          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="e.g. Near Community Center, 2nd Cross"
            data-testid="street-address-input"
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* ============================================ */}
      {/* REAL OPENSTREETMAP MAP */}
      {/* ============================================ */}

      <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">

        <MapContainer
          center={mapCenter}
          zoom={16}
          scrollWheelZoom={true}
          className="w-full h-72"
        >

          {/* OpenStreetMap */}

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Follow GPS */}

          <RecenterMap
            lat={lat}
            lng={lng}
            followUser={followUser}
          />

          {/* Map click */}

          <MapClickHandler
            ward={ward}
            address={address}
            onLocationSelect={handleManualLocation}
          />

          {/* ====================================== */}
          {/* LOCATION MARKER */}
          {/* ====================================== */}

          <Marker
            position={[lat, lng]}
          >

            <Popup>

              <div className="text-sm">

                <strong>
                  CivicPulse Complaint Location
                </strong>

                <br />

                Latitude: {lat}

                <br />

                Longitude: {lng}

                <br />

                Ward: {ward}

                <br />

                {isTracking && (

                  <span className="text-green-600 font-semibold">

                    ● Live GPS Tracking

                  </span>

                )}

              </div>

            </Popup>

          </Marker>

        </MapContainer>

        {/* Map instruction */}

        <div className="absolute top-2 right-2 z-[1000] bg-blue-600 text-white text-[10px] font-medium px-2 py-1 rounded shadow-sm">

          Click map to select location

        </div>

      </div>

      {/* ============================================ */}
      {/* COORDINATES */}
      {/* ============================================ */}

      <div className="flex flex-wrap items-center justify-between gap-2">

        <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-700 shadow-sm flex items-center gap-2">

          <Compass className="h-3.5 w-3.5 text-blue-600" />

          <span>
            Lat: {lat} | Lng: {lng}
          </span>

        </div>

        {/* LIVE STATUS */}

        {isTracking && (

          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">

            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>

            Live GPS tracking active

          </div>

        )}

      </div>

      {/* ============================================ */}
      {/* GPS INFORMATION */}
      {/* ============================================ */}

      {isTracking && (

        <div className="text-[11px] text-slate-500">

          Your location is being updated automatically
          while GPS tracking is active.

        </div>

      )}

    </div>
  );
}