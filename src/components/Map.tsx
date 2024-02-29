import { GeoJsonObject } from "geojson";
import { geoJSON as LeafletGeoJSON, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

type MapProps = {
  geoJSON?: GeoJsonObject;
};

export function Map({ geoJSON }: MapProps) {
  const geoJSONisRelevant = objectNotEmpty(geoJSON);

  return (
    <MapContainer
      center={[0, 0]}
      zoom={3}
      style={{ width: "800px", height: "500px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsPanner
        bounds={geoJSONisRelevant ? LeafletGeoJSON(geoJSON).getBounds() : undefined}
      />
      {geoJSONisRelevant && geoJSON && <GeoJSON data={geoJSON} />}
    </MapContainer>
  );
}

interface PannerProps {
  bounds?: LatLngBoundsExpression;
}

export function BoundsPanner({ bounds }: PannerProps) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);

  return null;
}

function objectNotEmpty(obj?: object) {
  return obj && Object.keys(obj).length;
}
