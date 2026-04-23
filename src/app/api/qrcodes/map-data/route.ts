import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Coordonnées centrales des pays courants
const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "France": { lat: 46.6, lng: 2.2 },
  "Belgium": { lat: 50.5, lng: 4.5 },
  "Belgique": { lat: 50.5, lng: 4.5 },
  "Switzerland": { lat: 46.8, lng: 8.2 },
  "Suisse": { lat: 46.8, lng: 8.2 },
  "Germany": { lat: 51.2, lng: 10.4 },
  "Allemagne": { lat: 51.2, lng: 10.4 },
  "Spain": { lat: 40.5, lng: -3.7 },
  "Espagne": { lat: 40.5, lng: -3.7 },
  "Italy": { lat: 41.9, lng: 12.6 },
  "Italie": { lat: 41.9, lng: 12.6 },
  "Portugal": { lat: 39.4, lng: -8.2 },
  "Netherlands": { lat: 52.1, lng: 5.3 },
  "Pays-Bas": { lat: 52.1, lng: 5.3 },
  "United Kingdom": { lat: 55.4, lng: -3.4 },
  "Royaume-Uni": { lat: 55.4, lng: -3.4 },
  "United States": { lat: 37.1, lng: -95.7 },
  "États-Unis": { lat: 37.1, lng: -95.7 },
  "Canada": { lat: 56.1, lng: -106.3 },
  "Brazil": { lat: -14.2, lng: -51.9 },
  "Brésil": { lat: -14.2, lng: -51.9 },
  "Mexico": { lat: 23.6, lng: -102.6 },
  "Mexique": { lat: 23.6, lng: -102.6 },
  "Japan": { lat: 36.2, lng: 138.3 },
  "Japon": { lat: 36.2, lng: 138.3 },
  "China": { lat: 35.9, lng: 104.2 },
  "Chine": { lat: 35.9, lng: 104.2 },
  "South Korea": { lat: 35.9, lng: 127.8 },
  "Corée du Sud": { lat: 35.9, lng: 127.8 },
  "India": { lat: 20.6, lng: 79.0 },
  "Inde": { lat: 20.6, lng: 79.0 },
  "Australia": { lat: -25.3, lng: 133.8 },
  "Australie": { lat: -25.3, lng: 133.8 },
  "Argentina": { lat: -38.4, lng: -63.6 },
  "Argentine": { lat: -38.4, lng: -63.6 },
  "Morocco": { lat: 31.8, lng: -7.1 },
  "Maroc": { lat: 31.8, lng: -7.1 },
  "Algeria": { lat: 28.0, lng: 1.7 },
  "Algérie": { lat: 28.0, lng: 1.7 },
  "Tunisia": { lat: 33.9, lng: 9.5 },
  "Tunisie": { lat: 33.9, lng: 9.5 },
  "Luxembourg": { lat: 49.8, lng: 6.1 },
  "Ireland": { lat: 53.1, lng: -7.7 },
  "Irlande": { lat: 53.1, lng: -7.7 },
  "Austria": { lat: 47.5, lng: 14.6 },
  "Autriche": { lat: 47.5, lng: 14.6 },
  "Poland": { lat: 51.9, lng: 19.1 },
  "Pologne": { lat: 51.9, lng: 19.1 },
  "Sweden": { lat: 60.1, lng: 18.6 },
  "Suède": { lat: 60.1, lng: 18.6 },
  "Norway": { lat: 60.5, lng: 8.5 },
  "Norvège": { lat: 60.5, lng: 8.5 },
  "Denmark": { lat: 56.3, lng: 9.5 },
  "Danemark": { lat: 56.3, lng: 9.5 },
  "Finland": { lat: 61.9, lng: 25.7 },
  "Finlande": { lat: 61.9, lng: 25.7 },
  "Romania": { lat: 45.9, lng: 25.0 },
  "Roumanie": { lat: 45.9, lng: 25.0 },
  "Greece": { lat: 39.1, lng: 21.8 },
  "Grèce": { lat: 39.1, lng: 21.8 },
  "Turkey": { lat: 39.0, lng: 35.2 },
  "Turquie": { lat: 39.0, lng: 35.2 },
  "Russia": { lat: 61.5, lng: 105.3 },
  "Russie": { lat: 61.5, lng: 105.3 },
  "Colombia": { lat: 4.6, lng: -74.1 },
  "Colombie": { lat: 4.6, lng: -74.1 },
  "Chile": { lat: -35.7, lng: -71.5 },
  "Chili": { lat: -35.7, lng: -71.5 },
  "South Africa": { lat: -30.6, lng: 22.9 },
  "Afrique du Sud": { lat: -30.6, lng: 22.9 },
  "Nigeria": { lat: 9.1, lng: 8.7 },
  "Egypt": { lat: 26.8, lng: 30.8 },
  "Égypte": { lat: 26.8, lng: 30.8 },
  "Indonesia": { lat: -0.8, lng: 113.9 },
  "Indonésie": { lat: -0.8, lng: 113.9 },
  "Thailand": { lat: 15.9, lng: 100.5 },
  "Thaïlande": { lat: 15.9, lng: 100.5 },
  "Vietnam": { lat: 14.1, lng: 108.3 },
  "Philippines": { lat: 12.9, lng: 121.8 },
  "Malaysia": { lat: 4.2, lng: 101.9 },
  "Malaisie": { lat: 4.2, lng: 101.9 },
  "Singapore": { lat: 1.4, lng: 103.8 },
  "Singapour": { lat: 1.4, lng: 103.8 },
  "Israel": { lat: 31.0, lng: 34.9 },
  "Israël": { lat: 31.0, lng: 34.9 },
  "United Arab Emirates": { lat: 23.4, lng: 53.8 },
  "Émirats arabes unis": { lat: 23.4, lng: 53.8 },
  "Saudi Arabia": { lat: 23.9, lng: 45.1 },
  "Arabie saoudite": { lat: 23.9, lng: 45.1 },
  "Czech Republic": { lat: 49.8, lng: 15.5 },
  "Tchéquie": { lat: 49.8, lng: 15.5 },
  "Hungary": { lat: 47.2, lng: 19.5 },
  "Hongrie": { lat: 47.2, lng: 19.5 },
  "Croatia": { lat: 45.1, lng: 15.2 },
  "Croatie": { lat: 45.1, lng: 15.2 },
  "New Zealand": { lat: -40.9, lng: 174.9 },
  "Nouvelle-Zélande": { lat: -40.9, lng: 174.9 },
  "Peru": { lat: -9.2, lng: -75.0 },
  "Pérou": { lat: -9.2, lng: -75.0 },
  "Senegal": { lat: 14.5, lng: -14.5 },
  "Sénégal": { lat: 14.5, lng: -14.5 },
  "Ivory Coast": { lat: 7.5, lng: -5.5 },
  "Côte d'Ivoire": { lat: 7.5, lng: -5.5 },
  "Cameroon": { lat: 7.4, lng: 12.4 },
  "Cameroun": { lat: 7.4, lng: 12.4 },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const qrCodeId = searchParams.get("qrCodeId");
  const period = parseInt(searchParams.get("period") || "30", 10);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  if (qrCodeId) {
    const qrCode = await prisma.qRCode.findFirst({
      where: { id: qrCodeId, userId: user.id },
    });
    if (!qrCode) {
      return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
    }
  }

  // Récupération des scans avec pays
  const scans = await prisma.scan.findMany({
    where: {
      qrCode: {
        userId: user.id,
        ...(qrCodeId ? { id: qrCodeId } : {}),
      },
      scannedAt: { gte: startDate },
      country: { not: null },
    },
    select: {
      country: true,
      latitude: true,
      longitude: true,
    },
  });

  // Agrégation par pays
  const countryMap = new Map<string, { count: number; latSum: number; lngSum: number; hasCoords: number }>();

  for (const scan of scans) {
    const country = scan.country || "Inconnu";
    const existing = countryMap.get(country);
    if (existing) {
      existing.count += 1;
      if (scan.latitude !== null && scan.longitude !== null) {
        existing.latSum += scan.latitude;
        existing.lngSum += scan.longitude;
        existing.hasCoords += 1;
      }
    } else {
      countryMap.set(country, {
        count: 1,
        latSum: scan.latitude ?? 0,
        lngSum: scan.longitude ?? 0,
        hasCoords: scan.latitude !== null && scan.longitude !== null ? 1 : 0,
      });
    }
  }

  // Construction des données pays avec coordonnées
  const countries = Array.from(countryMap.entries())
    .map(([country, data]) => {
      // Utiliser les coordonnées prédéfinies ou la moyenne des scans
      const center = COUNTRY_CENTERS[country];
      let lat: number, lng: number;

      if (center) {
        lat = center.lat;
        lng = center.lng;
      } else if (data.hasCoords > 0) {
        lat = data.latSum / data.hasCoords;
        lng = data.lngSum / data.hasCoords;
      } else {
        lat = 0;
        lng = 0;
      }

      return { country, count: data.count, lat, lng };
    })
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    countries,
    summary: {
      totalScans: scans.length,
      totalCountries: countries.length,
    },
  });
}
