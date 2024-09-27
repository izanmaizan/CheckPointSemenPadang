import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "animate.css"; // Animasi

// Import marker icons using import statement
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

const PetaModal = ({ isVisible, onClose, coords }) => {
  if (!isVisible || !coords) return null;

  const [position, setPosition] = useState([coords.lat, coords.lon]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 animate__animated animate__fadeIn animate__faster">
      <div className="relative bg-white p-4 rounded-xl shadow-xl max-w-lg w-full animate__animated animate__zoomIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 hover:bg-gray-200 rounded-full p-2 transition-colors duration-300">
          &times;
        </button>

        {/* Modal Title */}
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Peta Lokasi
        </h3>

        {/* Map Container */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="rounded-lg">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={customIcon}>
              <Popup>Lokasi Geofence</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PetaModal;
