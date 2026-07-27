import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const icon = L.divIcon({
  className: "",
  html: `<span style="display:flex;height:1.75rem;width:1.75rem;align-items:center;justify-content:center;border-radius:9999px;background:oklch(0.546 0.215 262.9);color:#fff;font-size:12px;font-weight:700;box-shadow:0 6px 16px -4px rgba(37,99,235,.6)">•</span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
}

export default function LeafletMap({
  points,
  height = 320,
  zoom = 12,
}: {
  points: MapPoint[];
  height?: number;
  zoom?: number;
}) {
  const center: [number, number] = points.length
    ? [points[0].latitude, points[0].longitude]
    : [12.9716, 77.5946];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height, width: "100%" }}
      className="overflow-hidden rounded-2xl border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon}>
          <Popup>
            <strong>{point.title}</strong>
            {point.subtitle && <div>{point.subtitle}</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
