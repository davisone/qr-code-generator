"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight?: number;
}

interface HeatmapViewProps {
  points: HeatmapPoint[];
}

// Palette brand : yellow -> red -> ink
const HEAT_GRADIENT = {
  0.2: "#f0b500",
  0.5: "#d4290f",
  0.8: "#1a1410",
};

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const HeatmapView = ({ points }: HeatmapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const heatLayerRef = useRef<Layer | null>(null);

  // Initialisation de la map (dynamic import pour SSR-safety)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet.heat");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        worldCopyJump: true,
        preferCanvas: true,
      });
      mapRef.current = map;

      L.tileLayer(TILE_URL, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
    };

    void init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        heatLayerRef.current = null;
      }
    };
  }, []);

  // Mise à jour de la heat layer quand les points changent
  useEffect(() => {
    const update = async () => {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      await import("leaflet.heat");

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      if (points.length === 0) return;

      const latLngs: Array<[number, number, number]> = points.map((p) => [
        p.lat,
        p.lng,
        p.weight ?? 1,
      ]);

      const heat = L.heatLayer(latLngs, {
        radius: 25,
        blur: 20,
        maxZoom: 10,
        minOpacity: 0.25,
        gradient: HEAT_GRADIENT,
      }).addTo(map);
      heatLayerRef.current = heat;
    };
    void update();
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 500,
        borderRadius: 2,
        overflow: "hidden",
        border: "var(--rule)",
      }}
    />
  );
};

export default HeatmapView;
