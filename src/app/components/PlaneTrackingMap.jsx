"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

/* -----------------------------
   Utils
------------------------------ */
const toNum = (v) => Number(v);

function interpolate(points, t) {
  if (!points.length) return null;
  const i = Math.floor(t * (points.length - 1));
  return points[i];
}

/* -----------------------------
   Animated dashed route
------------------------------ */
function AnimatedRoute({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;

    const line = L.polyline(positions, {
      color: "#06b6d4",
      weight: 3,
      dashArray: "8 12",
      lineCap: "round"
    }).addTo(map);

    let offset = 0;
    let raf;
    const animate = () => {
      offset = (offset + 1) % 20;
      line.setStyle({ dashOffset: `${offset}` });
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      map.removeLayer(line);
    };
  }, [map, positions]);

  return null;
}

/* -----------------------------
   Freight pin with label
------------------------------ */
function FreightPin({ lat, lng, label, color }) {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        background: rgba(255,255,255,0.95);
        border-radius: 10px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 600;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.05);
        margin-bottom: 4px;
      ">
        ${label}
      </div>
      <svg width="22" height="28" viewBox="0 0 24 24" fill="${color}">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
      </svg>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: "",
    iconSize: [22, 40],
    iconAnchor: [11, 40]
  });

  return <Marker position={[lat, lng]} icon={icon} />;
}

/* -----------------------------
   Plane marker
------------------------------ */
function PlaneMarker({ lat, lng }) {
  if (!lat || !lng) return null;

  const icon = L.divIcon({
    html: `<div style="font-size:22px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));">✈️</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return <Marker position={[lat, lng]} icon={icon} />;
}

/* -----------------------------
   Fit bounds
------------------------------ */
function FitBounds({ origin, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!origin || !destination) return;
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [120, 120], maxZoom: 6 });
  }, [map, origin, destination]);

  return null;
}

/* =============================
   MAIN COMPONENT
============================= */
export default function PlaneTrackingMap({ pkg }) {
  const origin = pkg?.origin && {
    lat: toNum(pkg.origin.lat),
    lng: toNum(pkg.origin.lng)
  };

  const destination = pkg?.destination && {
    lat: toNum(pkg.destination.lat),
    lng: toNum(pkg.destination.lng)
  };

  const route = useMemo(() => {
    if (!origin || !destination) return [];
    return [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ];
  }, [origin, destination]);

  const [plane, setPlane] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!route.length) return;

    const start = new Date(pkg.createdAt).getTime();
    const end = new Date(pkg.deliveryTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const t =
        now <= start ? 0 :
        now >= end ? 1 :
        (now - start) / (end - start);

      const pos = interpolate(route, t);
      if (pos) setPlane({ lat: pos[0], lng: pos[1] });
    }, 1000);

    intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [route, pkg]);

  useEffect(() => {
    if (!pkg) return;
    if (String(pkg.status).toLowerCase() === "delivered") {
      const dLat = Number(pkg.destination?.lat);
      const dLng = Number(pkg.destination?.lng);
      if (Number.isFinite(dLat) && Number.isFinite(dLng)) {
        setPlane({ lat: dLat, lng: dLng });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  }, [pkg?.status, pkg]);

  if (!origin || !destination) return null;

  return (
    <div className="relative w-full h-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={3}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="© OpenStreetMap"
    />

    <AnimatedRoute positions={route} />

        <FreightPin
          lat={origin.lat}
          lng={origin.lng}
          label="Origin "
          color="#10b981"
        />

        <FreightPin
          lat={destination.lat}
          lng={destination.lng}
          label="Destination "
          color="#ef4444"
        />

      <PlaneMarker lat={plane?.lat} lng={plane?.lng} />

      <FitBounds origin={[origin.lat, origin.lng]} destination={[destination.lat, destination.lng]} />
    </MapContainer>

    {/* UI Overlay */}
      <motion.div
        className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-white/30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <p className="text-xs text-gray-500">Tracking Number</p>
        <p className="font-semibold text-sm">{pkg.trackingNumber}</p>
      </motion.div>
    </div>
  );
}
