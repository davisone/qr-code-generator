"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CountryData {
  country: string;
  count: number;
  lat: number;
  lng: number;
}

interface MapDataResponse {
  countries: CountryData[];
  summary: {
    totalScans: number;
    totalCountries: number;
  };
}

interface QRCodeOption {
  id: string;
  name: string;
  type: string;
  foregroundColor: string;
}

interface MapViewProps {
  qrCodes: QRCodeOption[];
}

type Period = 7 | 30 | 90 | 0;

const FitBounds = ({ countries }: { countries: CountryData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (countries.length === 0) return;
    const bounds = L.latLngBounds(
      countries.map((c) => [c.lat, c.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
  }, [countries, map]);

  return null;
};

// Rayon du cercle proportionnel au nombre de scans
const getRadius = (count: number, maxCount: number): number => {
  const min = 8;
  const max = 35;
  if (maxCount <= 1) return min;
  return min + ((count / maxCount) * (max - min));
};

const MapView = ({ qrCodes }: MapViewProps) => {
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<MapDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedQRCode) params.set("qrCodeId", selectedQRCode);
      params.set("period", period > 0 ? period.toString() : "3650");

      const res = await fetch(`/api/qrcodes/map-data?${params.toString()}`);
      if (res.ok) {
        const json: MapDataResponse = await res.json();
        setData(json);
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  }, [selectedQRCode, period]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const defaultCenter: L.LatLngTuple = [30, 0];
  const countries = data?.countries ?? [];
  const summary = data?.summary;
  const maxCount = countries.reduce((max, c) => Math.max(max, c.count), 0);

  const periodOptions: { label: string; value: Period }[] = [
    { label: "7j", value: 7 },
    { label: "30j", value: 30 },
    { label: "90j", value: 90 },
    { label: "Tout", value: 0 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 relative" style={{ minHeight: "600px" }}>
      {/* Panneau latéral */}
      <div className="w-full lg:w-72 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#e5e5e5] p-5 overflow-y-auto rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none z-10">
        <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">Scans par pays</h2>

        {/* Sélecteur de QR code */}
        <div className="mb-4">
          <label htmlFor="map-qr-select" className="block text-sm font-medium text-[#525252] mb-1.5">
            QR Code
          </label>
          <select
            id="map-qr-select"
            value={selectedQRCode}
            onChange={(e) => setSelectedQRCode(e.target.value)}
            className="input text-sm"
          >
            <option value="">Tous les QR codes</option>
            {qrCodes.map((qr) => (
              <option key={qr.id} value={qr.id}>
                {qr.name} ({qr.type === "url" ? "URL" : "Texte"})
              </option>
            ))}
          </select>
        </div>

        {/* Filtres de période */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#525252] mb-1.5">
            Période
          </label>
          <div className="flex gap-2">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`btn btn-sm flex-1 ${
                  period === opt.value ? "btn-primary" : "btn-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0a0a0a]"></div>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div className="bento-card p-4">
              <p className="text-sm text-[#525252]">Total scans</p>
              <p className="text-2xl font-bold text-[#0a0a0a]">{summary.totalScans}</p>
              <p className="text-xs text-[#a3a3a3] mt-1">
                {summary.totalCountries} pays
              </p>
            </div>

            {/* Liste des pays */}
            {countries.length > 0 && (
              <div className="bento-card p-4">
                <p className="text-sm font-medium text-[#525252] mb-3">Pays</p>
                <div className="space-y-2">
                  {countries.map((c, i) => (
                    <div key={c.country} className="flex items-center gap-2">
                      <span className="text-xs text-[#a3a3a3] font-mono w-4 shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm text-[#0a0a0a] truncate">{c.country}</span>
                          <span className="text-sm font-semibold text-[#0a0a0a] ml-2">{c.count}</span>
                        </div>
                        <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${maxCount > 0 ? (c.count / maxCount) * 100 : 0}%`,
                              background: "var(--red, #d4290f)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.totalScans === 0 && (
              <div className="text-center py-6">
                <svg
                  className="w-12 h-12 mx-auto text-[#d4d4d4] mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-[#525252]">Aucun scan géolocalisé</p>
                <p className="text-xs text-[#a3a3a3] mt-1">
                  Les scans apparaîtront ici une fois détectés.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Carte */}
      <div className="flex-1 relative rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none overflow-hidden" style={{ minHeight: "500px" }}>
        <MapContainer
          center={defaultCenter}
          zoom={2}
          style={{ height: "100%", width: "100%", minHeight: "500px" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {countries.length > 0 && <FitBounds countries={countries} />}

          {countries.map((c) => (
            <CircleMarker
              key={c.country}
              center={[c.lat, c.lng]}
              radius={getRadius(c.count, maxCount)}
              pathOptions={{
                fillColor: "#d4290f",
                fillOpacity: 0.7,
                color: "#fff",
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="text-xs">
                  <p className="font-semibold">{c.country}</p>
                  <p className="text-[#525252]">
                    {c.count} scan{c.count > 1 ? "s" : ""}
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1000]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
