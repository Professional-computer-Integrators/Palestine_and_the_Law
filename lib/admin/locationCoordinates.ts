type LocationInput = {
  city?: string;
  region?: string;
  country?: string;
};

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  "united states": [-98.5, 39.8],
  usa: [-98.5, 39.8],
  "us": [-98.5, 39.8],
  canada: [-106.3, 56.1],
  mexico: [-102.5, 23.6],
  "united kingdom": [-1.5, 52.4],
  uk: [-1.5, 52.4],
  gb: [-1.5, 52.4],
  ireland: [-8.0, 53.4],
  france: [2.2, 46.6],
  germany: [10.4, 51.2],
  spain: [-3.7, 40.4],
  italy: [12.6, 41.9],
  netherlands: [5.3, 52.1],
  belgium: [4.7, 50.5],
  switzerland: [8.2, 46.8],
  austria: [14.6, 47.5],
  sweden: [18.6, 60.1],
  norway: [8.5, 60.5],
  finland: [25.7, 61.9],
  poland: [19.1, 51.9],
  portugal: [-8.2, 39.4],
  greece: [21.8, 39.1],
  turkey: [35.2, 38.9],
  palestine: [35.2, 31.9],
  israel: [34.9, 31.0],
  jordan: [36.2, 30.6],
  lebanon: [35.9, 33.9],
  syria: [38.0, 34.8],
  iraq: [43.7, 33.2],
  iran: [53.7, 32.4],
  "united arab emirates": [54.0, 23.4],
  "uae": [54.0, 23.4],
  "saudi arabia": [45.1, 23.9],
  qatar: [51.2, 25.4],
  kuwait: [47.5, 29.3],
  bahrain: [50.6, 26.0],
  oman: [55.9, 21.5],
  yemen: [48.5, 15.6],
  egypt: [30.8, 26.8],
  morocco: [-7.1, 31.8],
  tunisia: [9.5, 33.9],
  algeria: [1.7, 28.0],
  nigeria: [8.7, 9.1],
  "south africa": [22.9, -30.6],
  india: [78.9, 20.6],
  pakistan: [69.3, 30.4],
  bangladesh: [90.4, 23.7],
  china: [104.2, 35.9],
  japan: [138.3, 36.2],
  "south korea": [127.8, 35.9],
  singapore: [103.8, 1.4],
  indonesia: [113.9, -0.8],
  malaysia: [101.9, 4.2],
  philippines: [121.8, 12.9],
  thailand: [101.0, 15.9],
  vietnam: [108.3, 14.1],
  australia: [133.8, -25.3],
  "new zealand": [174.9, -40.9],
  brazil: [-51.9, -14.2],
  argentina: [-63.6, -38.4],
  chile: [-71.5, -35.7],
  colombia: [-74.3, 4.6],
  peru: [-75.0, -9.2],
  venezuela: [-66.6, 6.4],
};

const CITY_OVERRIDES: Record<string, [number, number]> = {
  "amman|jordan": [35.93, 31.95],
  "aqaba|jordan": [35.01, 29.53],
  "cairo|egypt": [31.24, 30.04],
  "alexandria|egypt": [29.92, 31.2],
  "gaza|palestine": [34.47, 31.5],
  "jerusalem|palestine": [35.22, 31.78],
  "ramallah|palestine": [35.2, 31.9],
  "london|united kingdom": [-0.13, 51.51],
  "manchester|united kingdom": [-2.24, 53.48],
  "new york|united states": [-74.01, 40.71],
  "washington|united states": [-77.04, 38.91],
  "los angeles|united states": [-118.24, 34.05],
  "toronto|canada": [-79.38, 43.65],
  "berlin|germany": [13.4, 52.52],
  "paris|france": [2.35, 48.86],
};

function normalizeText(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "");
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function wrapLongitude(lon: number): number {
  let wrapped = lon;
  while (wrapped > 180) wrapped -= 360;
  while (wrapped < -180) wrapped += 360;
  return wrapped;
}

function clampLatitude(lat: number): number {
  return Math.max(-85, Math.min(85, lat));
}

function jitterFromHash(base: [number, number], seed: string): [number, number] {
  const hash = hashString(seed || "seed");
  const angle = ((hash % 3600) / 3600) * Math.PI * 2;
  const radiusDeg = 0.4 + (((hash >>> 8) % 220) / 100);
  const dLon = Math.cos(angle) * radiusDeg;
  const dLat = Math.sin(angle) * radiusDeg * 0.7;

  return [wrapLongitude(base[0] + dLon), clampLatitude(base[1] + dLat)];
}

export function coordinatesFromLocation(location: LocationInput): [number, number] {
  const city = normalizeText(location.city);
  const region = normalizeText(location.region);
  const country = normalizeText(location.country);

  const cityCountryKey = city && country ? `${city}|${country}` : "";
  if (cityCountryKey && CITY_OVERRIDES[cityCountryKey]) {
    return CITY_OVERRIDES[cityCountryKey];
  }

  const countryCentroid = COUNTRY_CENTROIDS[country];
  if (countryCentroid) {
    const seed = `${city}|${region}|${country}`;
    return jitterFromHash(countryCentroid, seed);
  }

  if (city || region || country) {
    const pseudoLon = (hashString(`${country}|${city}`) % 360) - 180;
    const pseudoLat = (hashString(`${region}|${city}|${country}`) % 160) - 80;
    return [pseudoLon, pseudoLat];
  }

  return [0, 0];
}
