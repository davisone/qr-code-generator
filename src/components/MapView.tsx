"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types pour les donnees de la carte
interface LocationData {
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
  count: number;
  lastScan: string;
  qrCodeName: string;
  color: string;
}

interface CountryOrCityCount {
  name: string;
  count: number;
}

interface MapDataResponse {
  locations: LocationData[];
  summary: {
    totalLocations: number;
    totalScans: number;
    topCountries: CountryOrCityCount[];
    topCities: CountryOrCityCount[];
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

// Composant interne pour ajuster les limites de la carte selon les donnees
const FitBounds = ({ locations }: { locations: LocationData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.lat, loc.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [locations, map]);

  return null;
};

// Creation d'une icone personnalisee pour un marqueur
const createMarkerIcon = (color: string, count: number, index: number): L.DivIcon => {
  if (count > 1) {
    // Marqueur cluster avec taille proportionnelle au nombre de scans
    const size = Math.min(20 + count * 4, 50);
    return L.divIcon({
      className: "",
      html: `<div class="map-cluster" style="width: ${size}px; height: ${size}px; background: ${color}; box-shadow: 0 0 10px ${color}, 0 0 20px ${color}; animation-delay: ${index * 50}ms;">${count}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // Marqueur simple avec point lumineux
  return L.divIcon({
    className: "",
    html: `<div class="map-marker" style="background: ${color}; box-shadow: 0 0 10px ${color}, 0 0 20px ${color}; animation-delay: ${index * 50}ms;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// Formatage de la date en francais
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MapView = ({ qrCodes }: MapViewProps) => {
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<MapDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Recuperation des donnees de la carte
  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedQRCode) {
        params.set("qrCodeId", selectedQRCode);
      }
      if (period > 0) {
        params.set("period", period.toString());
      } else {
        // "Tout" : on met une periode tres large
        params.set("period", "3650");
      }

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

  // Centre par defaut : France
  const defaultCenter: L.LatLngTuple = [46.6, 2.2];

  const locations = data?.locations ?? [];
  const summary = data?.summary;

  // Libelles des periodes
  const periodOptions: { label: string; value: Period }[] = [
    { label: "7j", value: 7 },
    { label: "30j", value: 30 },
    { label: "90j", value: 90 },
    { label: "Tout", value: 0 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 relative" style={{ minHeight: "600px" }}>
      {/* Panneau lateral */}
      <div className="w-full lg:w-80 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#e5e5e5] p-5 overflow-y-auto rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none z-10">
        <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">Carte des scans</h2>

        {/* Selecteur de QR code */}
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

        {/* Filtres de periode */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#525252] mb-1.5">
            Periode
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
            {/* Total des scans geolocalisees */}
            <div className="bento-card p-4">
              <p className="text-sm text-[#525252]">Scans geolocalisees</p>
              <p className="text-2xl font-bold text-[#0a0a0a]">{summary.totalScans}</p>
              <p className="text-xs text-[#a3a3a3] mt-1">
                {summary.totalLocations} emplacement{summary.totalLocations !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Top 3 pays */}
            {summary.topCountries.length > 0 && (
              <div className="bento-card p-4">
                <p className="text-sm font-medium text-[#525252] mb-2">Top pays</p>
                <div className="space-y-2">
                  {summary.topCountries.map((country, i) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <span className="text-sm text-[#0a0a0a] flex items-center gap-2">
                        <span className="text-xs text-[#a3a3a3] font-mono w-4">{i + 1}.</span>
                        {country.name}
                      </span>
                      <span className="text-sm font-semibold text-[#0a0a0a]">{country.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top 3 villes */}
            {summary.topCities.length > 0 && (
              <div className="bento-card p-4">
                <p className="text-sm font-medium text-[#525252] mb-2">Top villes</p>
                <div className="space-y-2">
                  {summary.topCities.map((city, i) => (
                    <div key={city.name} className="flex items-center justify-between">
                      <span className="text-sm text-[#0a0a0a] flex items-center gap-2">
                        <span className="text-xs text-[#a3a3a3] font-mono w-4">{i + 1}.</span>
                        {city.name}
                      </span>
                      <span className="text-sm font-semibold text-[#0a0a0a]">{city.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etat vide */}
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
                <p className="text-sm text-[#525252]">Aucun scan geolocalisee</p>
                <p className="text-xs text-[#a3a3a3] mt-1">
                  Les scans apparaitront ici une fois detectees.
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
          zoom={3}
          style={{ height: "100%", width: "100%", minHeight: "500px" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Ajustement automatique des limites */}
          {locations.length > 0 && <FitBounds locations={locations} />}

          {/* Marqueurs */}
          {locations.map((loc, index) => (
            <Marker
              key={`${loc.lat}-${loc.lng}-${index}`}
              position={[loc.lat, loc.lng]}
              icon={createMarkerIcon(loc.color, loc.count, index)}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="text-xs">
                  <p className="font-semibold">
                    {loc.city ?? "Ville inconnue"}, {loc.country ?? "Pays inconnu"}
                  </p>
                  <p className="text-[#525252]">
                    {loc.count} scan{loc.count > 1 ? "s" : ""}
                  </p>
                  <p className="text-[#a3a3a3]">
                    Dernier : {formatDate(loc.lastScan)}
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Indicateur de chargement superpose */}
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
