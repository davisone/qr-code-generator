// Service de géolocalisation IP via ip-api.com (gratuit, sans clé API)

interface GeoData {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
}

export async function geolocateIp(ip: string): Promise<GeoData | null> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return null;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== "success") return null;

    return {
      latitude: data.lat,
      longitude: data.lon,
      country: data.country,
      city: data.city,
    };
  } catch {
    return null;
  }
}
