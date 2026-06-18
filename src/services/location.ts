import * as Location from 'expo-location';

export interface ReverseGeoResult {
  locality: string;
  district: string;
  pincode:  string;
  lat:      number;
  lng:      number;
}

interface NominatimAddress {
  suburb?:         string;
  neighbourhood?:  string;
  quarter?:        string;
  village?:        string;
  town?:           string;
  city?:           string;
  county?:         string;
  state_district?: string;
  state?:          string;
  postcode?:       string;
}

function rejectAfter(ms: number, msg: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

async function getCoords(): Promise<{ latitude: number; longitude: number }> {
  // Instant if there's a recent cached fix (works well when mock location is set in emulator)
  const last = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
  if (last) return last.coords;

  // Fresh GPS with 10 s hard timeout
  const pos = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
    rejectAfter(10_000, 'GPS timed out. On emulator: open Extended Controls → Location, set lat/lng and tap Send.'),
  ]);
  return pos.coords;
}

export async function detectLocation(): Promise<ReverseGeoResult> {
  const granted = await requestLocationPermission();
  if (!granted) throw new Error('Location permission denied. Please enable it in device Settings.');

  const { latitude: lat, longitude: lng } = await getCoords();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7_000);

  let data: { address: NominatimAddress };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'HarvestConnect/1.0' },
        signal: controller.signal,
      }
    );
    if (!res.ok) throw new Error('Address lookup failed — check internet connection');
    data = await res.json() as { address: NominatimAddress };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('Address lookup timed out — check internet connection');
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const addr = data.address;
  const locality =
    addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.village ?? addr.town ?? addr.city ?? 'Unknown';
  const district = [addr.state_district ?? addr.county, addr.state].filter(Boolean).join(', ');

  return { locality, district: district || 'Unknown', pincode: addr.postcode ?? '', lat, lng };
}
