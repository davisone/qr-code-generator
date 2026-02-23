import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Types pour les données de la carte
interface LocationData {
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
  count: number;
  lastScan: Date;
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

export async function GET(req: NextRequest) {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  // Récupération des paramètres de requête
  const { searchParams } = new URL(req.url);
  const qrCodeId = searchParams.get("qrCodeId");
  const period = parseInt(searchParams.get("period") || "30", 10);

  // Calcul de la date de début de la période
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // Si un QR code spécifique est demandé, vérifier qu'il appartient à l'utilisateur
  if (qrCodeId) {
    const qrCode = await prisma.qRCode.findFirst({
      where: { id: qrCodeId, userId: user.id },
    });
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code introuvable" },
        { status: 404 }
      );
    }
  }

  // Récupération des scans avec données de géolocalisation
  const scans = await prisma.scan.findMany({
    where: {
      qrCode: {
        userId: user.id,
        ...(qrCodeId ? { id: qrCodeId } : {}),
      },
      scannedAt: { gte: startDate },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      latitude: true,
      longitude: true,
      country: true,
      city: true,
      scannedAt: true,
      qrCode: {
        select: {
          name: true,
          foregroundColor: true,
        },
      },
    },
    orderBy: { scannedAt: "desc" },
  });

  // Agrégation par position arrondie (2 décimales) pour regrouper les scans proches
  const locationMap = new Map<string, LocationData>();

  for (const scan of scans) {
    if (scan.latitude === null || scan.longitude === null) continue;

    const roundedLat = Math.round(scan.latitude * 100) / 100;
    const roundedLng = Math.round(scan.longitude * 100) / 100;
    const key = `${roundedLat},${roundedLng}`;

    const existing = locationMap.get(key);
    if (existing) {
      existing.count += 1;
      // Garder la date du scan le plus récent
      if (scan.scannedAt > existing.lastScan) {
        existing.lastScan = scan.scannedAt;
      }
    } else {
      locationMap.set(key, {
        lat: roundedLat,
        lng: roundedLng,
        city: scan.city,
        country: scan.country,
        count: 1,
        lastScan: scan.scannedAt,
        qrCodeName: scan.qrCode.name,
        color: scan.qrCode.foregroundColor,
      });
    }
  }

  const locations = Array.from(locationMap.values());

  // Calcul des pays les plus fréquents (top 3)
  const countryMap = new Map<string, number>();
  for (const scan of scans) {
    const country = scan.country || "Inconnu";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  }
  const topCountries: CountryOrCityCount[] = Array.from(countryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Calcul des villes les plus fréquentes (top 3)
  const cityMap = new Map<string, number>();
  for (const scan of scans) {
    const city = scan.city || "Inconnue";
    cityMap.set(city, (cityMap.get(city) || 0) + 1);
  }
  const topCities: CountryOrCityCount[] = Array.from(cityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Construction de la réponse
  const response: MapDataResponse = {
    locations,
    summary: {
      totalLocations: locations.length,
      totalScans: scans.length,
      topCountries,
      topCities,
    },
  };

  return NextResponse.json(response);
}
