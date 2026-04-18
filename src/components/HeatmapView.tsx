"use client";

import { useEffect, useRef, useState } from "react";
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

// Détection du thème courant (light/dark) via l'attribut data-theme sur <html>
const readTheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
};

const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const HeatmapView = ({ points }: HeatmapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const heatLayerRef = useRef<Layer | null>(null);
  const tileLayerRef = useRef<Layer | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialisation de la map (dynamic import pour SSR-safety)
  useEffect(() => {
    let cancelled = false;
    let cleanupFns: Array<() => void> = [];

    const init = async () => {
      if (!containerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet.heat");

      if (cancelled || !containerRef.current) return;

      const initialTheme = readTheme();
      setTheme(initialTheme);

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        worldCopyJump: true,
        preferCanvas: true,
      });
      mapRef.current = map;

      const tileUrl = initialTheme === "dark" ? TILE_DARK : TILE_LIGHT;
      const tileLayer = L.tileLayer(tileUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Observer pour synchroniser le tile layer au toggle de thème
      const observer = new MutationObserver(() => {
        const next = readTheme();
        setTheme(next);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      cleanupFns.push(() => observer.disconnect());
    };

    void init();

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        heatLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Mise à jour du tile layer quand le thème change
  useEffect(() => {
    const update = async () => {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
      const tileUrl = theme === "dark" ? TILE_DARK : TILE_LIGHT;
      const tileLayer = L.tileLayer(tileUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;
    };
    void update();
  }, [theme]);

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
