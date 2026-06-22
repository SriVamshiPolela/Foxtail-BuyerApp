import * as Location from 'expo-location';

export interface ReverseGeoResult {
  locality: string;
  district: string;
  pincode:  string;
  lat:      number;
  lng:      number;
}

export interface LocationDetails {
  pincode:  string;
  district: string;
  state:    string;
}

export interface PlaceSuggestion {
  placeId:       string;
  description:   string;
  mainText:      string;
  secondaryText: string;
  // Pre-resolved details for Nominatim / India Post results — avoids a second API call
  prefetched?: { locality: string; district: string; state: string; pincode: string };
}

const GEOCODING_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_KEY ?? '';
const PLACES_KEY    = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY    ?? '';
const GEOCODE_URL   = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_URL    = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

// ─── Google Maps helpers ───────────────────────────────────────────────────────

interface GmapsComponent {
  long_name: string;
  types:     string[];
}

function pick(comps: GmapsComponent[], ...types: string[]): string {
  for (const type of types) {
    const c = comps.find((c) => c.types.includes(type));
    if (c) return c.long_name;
  }
  return '';
}

function parseComponents(comps: GmapsComponent[]): LocationDetails & { locality: string } {
  // India administrative hierarchy:
  //   administrative_area_level_1 = State
  //   administrative_area_level_2 = District
  //   administrative_area_level_3 = Mandal / Tehsil
  const locality    = pick(comps, 'sublocality_level_1', 'sublocality', 'administrative_area_level_3', 'locality');
  const districtRaw = pick(comps, 'administrative_area_level_2');
  const state       = pick(comps, 'administrative_area_level_1');
  const pincode     = pick(comps, 'postal_code');
  const district    = districtRaw ? `${districtRaw} District, ${state}` : state;
  return { locality, district, state, pincode };
}

async function gmapsGeocode(params: string): Promise<GmapsComponent[] | null> {
  try {
    const res = await fetch(`${GEOCODE_URL}?${params}&key=${GEOCODING_KEY}&language=en`,
      { signal: AbortSignal.timeout(7000) });
    if (!res.ok) return null;
    const data = await res.json() as {
      status: string;
      results: Array<{ address_components: GmapsComponent[] }>;
    };
    if (data.status !== 'OK' || !data.results.length) return null;
    return data.results[0].address_components;
  } catch {
    return null;
  }
}

// ─── India Post API — pincode fallback when Google Maps omits postal_code ─────

async function indiaPostByLocality(locality: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(locality)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return '';
    const data = await res.json() as Array<{
      Status: string;
      PostOffice?: Array<{
        Name: string; Block: string; BranchType: string;
        Pincode: string; District: string; State: string;
      }>;
    }>;
    if (data[0]?.Status !== 'Success') return '';
    const offices = data[0].PostOffice ?? [];
    if (!offices.length) return '';
    const norm = locality.toLowerCase().trim();
    const po =
      offices.find((o) => o.Block.toLowerCase() === norm) ??
      offices.find((o) => o.Name.toLowerCase() === norm) ??
      offices.find((o) => o.Name.toLowerCase().startsWith(norm)) ??
      offices.find((o) => o.BranchType === 'Head Post Office') ??
      offices[0];
    return po.Pincode;
  } catch {
    return '';
  }
}

// ─── Public: GPS detect ────────────────────────────────────────────────────────

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

function rejectAfter(ms: number, msg: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
}

async function nominatimReverse(lat: number, lng: number): Promise<{
  locality: string; district: string; state: string; pincode: string;
} | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'HarvestConnect/1.0' }, signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      address: {
        suburb?: string; neighbourhood?: string; quarter?: string;
        village?: string; town?: string; city?: string;
        county?: string; state_district?: string;
        state?: string; postcode?: string;
      };
    };
    const a = data.address;
    const locality    = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? a.town ?? a.city ?? '';
    const districtRaw = a.state_district ?? a.county ?? '';
    const state       = a.state ?? '';
    return {
      locality,
      district: districtRaw ? `${districtRaw} District, ${state}` : state,
      state,
      pincode:  a.postcode ?? '',
    };
  } catch {
    return null;
  }
}

export async function detectLocation(): Promise<ReverseGeoResult> {
  const granted = await requestLocationPermission();
  if (!granted) throw new Error('Location permission denied. Please enable it in device Settings.');

  const last = await Location.getLastKnownPositionAsync({ maxAge: 300_000 });
  const pos  = last ?? await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
    rejectAfter(10_000, 'GPS timed out. On emulator: open Extended Controls → Location, set lat/lng and tap Send.'),
  ]);
  const { latitude: lat, longitude: lng } = pos.coords;

  // India bounding box: lat 8–38°N, lng 68–98°E
  // Catches the Android emulator default location (Mountain View, CA ~37°N 122°W)
  const isInIndia = lat >= 8 && lat <= 38 && lng >= 68 && lng <= 98;
  if (!isInIndia) {
    throw new Error(
      'GPS shows a location outside India.\n\n' +
      'On emulator: tap ⋮ (More) → Location, enter your coordinates and tap "Set Location".\n\n' +
      'Example — Hyderabad: Lat 17.3850, Lng 78.4867\n' +
      'Example — Armoor: Lat 18.7964, Lng 78.2878'
    );
  }

  // 1. Google Maps reverse geocoding (best accuracy)
  if (GEOCODING_KEY) {
    const comps = await gmapsGeocode(`latlng=${lat},${lng}`);
    if (comps) {
      const { locality, district, pincode, state } = parseComponents(comps);
      const resolvedPincode = pincode || await indiaPostByLocality(locality);
      return {
        locality: locality || 'Unknown',
        district: district || state || 'Unknown',
        pincode:  resolvedPincode,
        lat, lng,
      };
    }
  }

  // 2. Nominatim reverse geocoding (free fallback)
  const nom = await nominatimReverse(lat, lng);
  if (nom) {
    const resolvedPincode = nom.pincode || await indiaPostByLocality(nom.locality);
    return {
      locality: nom.locality || 'Unknown',
      district: nom.district || nom.state || 'Unknown',
      pincode:  resolvedPincode,
      lat, lng,
    };
  }

  throw new Error('Could not resolve your address. Check internet connection and try again.');
}

// ─── Public: Places Autocomplete (as user types) ──────────────────────────────

// ─── Nominatim (OpenStreetMap) search — free, handles city/area/street ───────

interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    suburb?: string; neighbourhood?: string; quarter?: string;
    city_district?: string; village?: string; town?: string; city?: string;
    county?: string; state_district?: string;
    state?: string; postcode?: string;
  };
}

async function nominatimSuggestions(query: string): Promise<PlaceSuggestion[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=6&accept-language=en`,
      { headers: { 'User-Agent': 'HarvestConnect/1.0' }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return [];
    const results = await res.json() as NominatimSearchResult[];
    return results.map((r) => {
      const a = r.address;
      const locality    = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? a.village ?? a.town ?? a.city ?? '';
      const districtRaw = a.state_district ?? a.county ?? '';
      const state       = a.state ?? '';
      const pincode     = a.postcode ?? '';
      const district    = districtRaw ? `${districtRaw} District, ${state}` : state;
      const mainText    = locality || r.display_name.split(',')[0].trim();
      const secondary   = [districtRaw, state].filter(Boolean).join(', ');
      return {
        placeId:       `nominatim:${r.lat}:${r.lon}`,
        description:   r.display_name,
        mainText,
        secondaryText: secondary,
        prefetched: { locality: mainText, district, state, pincode },
      };
    });
  } catch {
    return [];
  }
}

// ─── India Post suggestions fallback ─────────────────────────────────────────

async function indiaPostSuggestions(query: string): Promise<PlaceSuggestion[]> {
  try {
    const res = await fetch(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as Array<{
      Status: string;
      PostOffice?: Array<{
        Name: string; Block: string; BranchType: string;
        Pincode: string; District: string; State: string;
      }>;
    }>;
    if (data[0]?.Status !== 'Success') return [];
    const offices = data[0].PostOffice ?? [];

    // Deduplicate by Block+District (many post offices per mandal)
    const seen = new Set<string>();
    return offices
      .filter((o) => {
        const key = `${o.Block}|${o.District}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6)
      .map((o) => ({
        placeId:       `indiapost:${o.Pincode}:${o.Block}`,
        description:   `${o.Block}, ${o.District} District, ${o.State}`,
        mainText:      o.Block,
        secondaryText: `${o.District} District, ${o.State}`,
      }));
  } catch {
    return [];
  }
}

// ─── Public: Places Autocomplete (as user types) ──────────────────────────────

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) return [];

  // 1. Google Places — best quality, dedicated Places API key
  if (PLACES_KEY) {
    try {
      const res = await fetch(
        `${PLACES_URL}?input=${encodeURIComponent(query)}&types=geocode&components=country:in&key=${PLACES_KEY}&language=en`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json() as {
          status: string;
          predictions: Array<{
            place_id: string;
            description: string;
            structured_formatting: { main_text: string; secondary_text?: string };
          }>;
        };
        if (data.status === 'OK') {
          return (data.predictions ?? []).map((p) => ({
            placeId:       p.place_id,
            description:   p.description,
            mainText:      p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text ?? '',
          }));
        }
        if (data.status === 'ZERO_RESULTS') return [];
        // REQUEST_DENIED / INVALID_REQUEST / etc → fall through to Nominatim
      }
    } catch { /* network error — fall through */ }
  }

  // 2. Nominatim (OpenStreetMap) — free, handles city/area/street/suburb queries
  const nominatim = await nominatimSuggestions(query);
  if (nominatim.length > 0) return nominatim;

  // 3. India Post — last resort, good for post office / mandal names
  return indiaPostSuggestions(query);
}

// ─── Public: resolve place_id → location details (after autocomplete pick) ────

export async function getPlaceDetails(
  placeId: string,
  fallbackName: string,
  prefetched?: PlaceSuggestion['prefetched'],
): Promise<(LocationDetails & { locality: string }) | null> {
  // Nominatim / India Post suggestions already carry resolved details — use them directly
  if (prefetched && (prefetched.district || prefetched.pincode)) {
    const resolvedPincode = prefetched.pincode || await indiaPostByLocality(prefetched.locality || fallbackName);
    return {
      locality: prefetched.locality || fallbackName,
      district: prefetched.district,
      state:    prefetched.state,
      pincode:  resolvedPincode,
    };
  }

  // India Post suggestion — placeId format: "indiapost:{pincode}:{block}"
  if (placeId.startsWith('indiapost:')) {
    const [, pincode, block] = placeId.split(':');
    const locality = block || fallbackName;
    // Resolve district from pincode
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`,
        { signal: AbortSignal.timeout(5000) });
      const data = await res.json() as Array<{
        Status: string;
        PostOffice?: Array<{ District: string; State: string }>;
      }>;
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        return {
          locality,
          district: `${po.District} District, ${po.State}`,
          state:    po.State,
          pincode,
        };
      }
    } catch { /* fall through */ }
    return { locality, district: fallbackName, state: '', pincode };
  }

  // Google Maps place_id
  const comps = await gmapsGeocode(`place_id=${encodeURIComponent(placeId)}`);
  if (!comps) return null;
  const { locality, district, pincode, state } = parseComponents(comps);
  const resolvedPincode = pincode || await indiaPostByLocality(locality || fallbackName);
  return {
    locality: locality || fallbackName,
    district: district || state,
    state,
    pincode:  resolvedPincode,
  };
}

// ─── Public: validate + resolve a manually-typed name ─────────────────────────

export async function lookupLocationByName(name: string): Promise<LocationDetails | null> {
  // Try Google Maps first
  if (GEOCODING_KEY) {
    const comps = await gmapsGeocode(`address=${encodeURIComponent(name)}&components=country:IN`);
    if (comps) {
      const { district, pincode, state, locality } = parseComponents(comps);
      if (district || state) {
        const resolvedPincode = pincode || await indiaPostByLocality(locality || name);
        return { district, state, pincode: resolvedPincode };
      }
    }
  }

  // Fall back to India Post
  try {
    const res = await fetch(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(name)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as Array<{
      Status: string;
      PostOffice?: Array<{
        Name: string; Block: string; BranchType: string;
        Pincode: string; District: string; State: string;
      }>;
    }>;
    if (data[0]?.Status !== 'Success') return null;
    const offices = data[0].PostOffice ?? [];
    if (!offices.length) return null;
    const norm = name.toLowerCase().trim();
    const po =
      offices.find((o) => o.Block.toLowerCase() === norm) ??
      offices.find((o) => o.Name.toLowerCase() === norm) ??
      offices.find((o) => o.Name.toLowerCase().startsWith(norm)) ??
      offices.find((o) => o.BranchType === 'Head Post Office') ??
      offices[0];
    return {
      district: `${po.District} District, ${po.State}`,
      state:    po.State,
      pincode:  po.Pincode,
    };
  } catch {
    return null;
  }
}

// ─── Public: pincode → name/district/state (used by explore tab) ─────────────

export interface PincodeInfo {
  name:     string;
  district: string;
  state:    string;
}

const pincodeCache = new Map<string, PincodeInfo | null>();

export async function lookupPincode(pin: string): Promise<PincodeInfo | null> {
  if (!/^\d{6}$/.test(pin)) return null;
  if (pincodeCache.has(pin)) return pincodeCache.get(pin)!;
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`,
      { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as Array<{
      Status: string;
      PostOffice?: Array<{ Name: string; Block: string; BranchType: string; District: string; State: string }>;
    }>;
    if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
      const offices = data[0].PostOffice;
      const po      = offices[0];
      let name: string;
      if (po.BranchType === 'Head Post Office') {
        name = po.Name;
      } else if (po.Block === po.District) {
        const subPO = offices.find((o) => o.BranchType === 'Sub Post Office');
        name = subPO ? subPO.Name : po.Block;
      } else {
        name = po.Block;
      }
      const info: PincodeInfo = { name, district: po.District, state: po.State };
      pincodeCache.set(pin, info);
      return info;
    }
  } catch { /* network error */ }
  pincodeCache.set(pin, null);
  return null;
}
