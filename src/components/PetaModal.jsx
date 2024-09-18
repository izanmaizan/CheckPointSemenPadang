import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PetaModal = ({ isVisible, onClose, coords }) => {
  if (!isVisible || !coords) return null;

  const [position, setPosition] = useState([coords.lat, coords.lon]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl">
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-2">Peta Lokasi</h3>
        <div className="h-80 w-full">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="rounded-lg">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>Lokasi Geofence</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PetaModal;
