import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition }) => {
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
            },
        });

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    }

    // Default center to New Delhi, India for this demo
    const defaultCenter = [28.7041, 77.1025]; 

    return (
        <MapContainer 
            center={position || defaultCenter} 
            zoom={12} 
            scrollWheelZoom={true} 
            style={{ height: "250px", width: "100%", borderRadius: "8px", border: "1px solid #ccc", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
};

export default LocationPicker;
