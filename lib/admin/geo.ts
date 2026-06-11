// Lightweight country -> region + centroid map used as a fallback when
// the IP geolocation API is unreachable. Coordinates are rough country
// centroids in [longitude, latitude] order to match VisitorSession.coordinates.

type CountryInfo = {
  name: string;
  region: string;
  coords: [number, number];
};

const COUNTRY_TABLE: Record<string, CountryInfo> = {
  US: { name: "United States", region: "North America", coords: [-98.5, 39.8] },
  CA: { name: "Canada", region: "North America", coords: [-106.3, 56.1] },
  MX: { name: "Mexico", region: "North America", coords: [-102.5, 23.6] },
  GB: { name: "United Kingdom", region: "Europe", coords: [-1.5, 52.4] },
  IE: { name: "Ireland", region: "Europe", coords: [-8.0, 53.4] },
  FR: { name: "France", region: "Europe", coords: [2.2, 46.6] },
  DE: { name: "Germany", region: "Europe", coords: [10.4, 51.2] },
  ES: { name: "Spain", region: "Europe", coords: [-3.7, 40.4] },
  IT: { name: "Italy", region: "Europe", coords: [12.6, 41.9] },
  NL: { name: "Netherlands", region: "Europe", coords: [5.3, 52.1] },
  BE: { name: "Belgium", region: "Europe", coords: [4.7, 50.5] },
  CH: { name: "Switzerland", region: "Europe", coords: [8.2, 46.8] },
  AT: { name: "Austria", region: "Europe", coords: [14.6, 47.5] },
  SE: { name: "Sweden", region: "Europe", coords: [18.6, 60.1] },
  NO: { name: "Norway", region: "Europe", coords: [8.5, 60.5] },
  FI: { name: "Finland", region: "Europe", coords: [25.7, 61.9] },
  DK: { name: "Denmark", region: "Europe", coords: [9.5, 56.3] },
  PL: { name: "Poland", region: "Europe", coords: [19.1, 51.9] },
  PT: { name: "Portugal", region: "Europe", coords: [-8.2, 39.4] },
  GR: { name: "Greece", region: "Europe", coords: [21.8, 39.1] },
  RO: { name: "Romania", region: "Europe", coords: [25.0, 45.9] },
  CZ: { name: "Czechia", region: "Europe", coords: [15.5, 49.8] },
  HU: { name: "Hungary", region: "Europe", coords: [19.5, 47.2] },
  UA: { name: "Ukraine", region: "Europe", coords: [31.2, 48.4] },
  RU: { name: "Russia", region: "Europe", coords: [105.3, 61.5] },
  TR: { name: "Turkey", region: "Europe", coords: [35.2, 38.9] },
  IL: { name: "Israel", region: "Middle East", coords: [34.9, 31.0] },
  PS: { name: "Palestine", region: "Middle East", coords: [35.2, 31.9] },
  JO: { name: "Jordan", region: "Middle East", coords: [36.2, 30.6] },
  LB: { name: "Lebanon", region: "Middle East", coords: [35.9, 33.9] },
  SY: { name: "Syria", region: "Middle East", coords: [38.0, 34.8] },
  IQ: { name: "Iraq", region: "Middle East", coords: [43.7, 33.2] },
  IR: { name: "Iran", region: "Middle East", coords: [53.7, 32.4] },
  AE: { name: "United Arab Emirates", region: "Middle East", coords: [54.0, 23.4] },
  SA: { name: "Saudi Arabia", region: "Middle East", coords: [45.1, 23.9] },
  QA: { name: "Qatar", region: "Middle East", coords: [51.2, 25.4] },
  KW: { name: "Kuwait", region: "Middle East", coords: [47.5, 29.3] },
  BH: { name: "Bahrain", region: "Middle East", coords: [50.6, 26.0] },
  OM: { name: "Oman", region: "Middle East", coords: [55.9, 21.5] },
  YE: { name: "Yemen", region: "Middle East", coords: [48.5, 15.6] },
  EG: { name: "Egypt", region: "Africa", coords: [30.8, 26.8] },
  ZA: { name: "South Africa", region: "Africa", coords: [22.9, -30.6] },
  NG: { name: "Nigeria", region: "Africa", coords: [8.7, 9.1] },
  KE: { name: "Kenya", region: "Africa", coords: [37.9, -0.0] },
  MA: { name: "Morocco", region: "Africa", coords: [-7.1, 31.8] },
  TN: { name: "Tunisia", region: "Africa", coords: [9.5, 33.9] },
  DZ: { name: "Algeria", region: "Africa", coords: [1.7, 28.0] },
  IN: { name: "India", region: "Asia", coords: [78.9, 20.6] },
  PK: { name: "Pakistan", region: "Asia", coords: [69.3, 30.4] },
  BD: { name: "Bangladesh", region: "Asia", coords: [90.4, 23.7] },
  CN: { name: "China", region: "Asia", coords: [104.2, 35.9] },
  JP: { name: "Japan", region: "Asia", coords: [138.3, 36.2] },
  KR: { name: "South Korea", region: "Asia", coords: [127.8, 35.9] },
  SG: { name: "Singapore", region: "Asia", coords: [103.8, 1.4] },
  HK: { name: "Hong Kong", region: "Asia", coords: [114.1, 22.4] },
  TW: { name: "Taiwan", region: "Asia", coords: [121.0, 23.7] },
  TH: { name: "Thailand", region: "Asia", coords: [101.0, 15.9] },
  VN: { name: "Vietnam", region: "Asia", coords: [108.3, 14.1] },
  ID: { name: "Indonesia", region: "Asia", coords: [113.9, -0.8] },
  PH: { name: "Philippines", region: "Asia", coords: [121.8, 12.9] },
  MY: { name: "Malaysia", region: "Asia", coords: [101.9, 4.2] },
  AU: { name: "Australia", region: "Oceania", coords: [133.8, -25.3] },
  NZ: { name: "New Zealand", region: "Oceania", coords: [174.9, -40.9] },
  BR: { name: "Brazil", region: "South America", coords: [-51.9, -14.2] },
  AR: { name: "Argentina", region: "South America", coords: [-63.6, -38.4] },
  CL: { name: "Chile", region: "South America", coords: [-71.5, -35.7] },
  CO: { name: "Colombia", region: "South America", coords: [-74.3, 4.6] },
  PE: { name: "Peru", region: "South America", coords: [-75.0, -9.2] },
  VE: { name: "Venezuela", region: "South America", coords: [-66.6, 6.4] },
};

export function lookupCountry(code: string | undefined | null): CountryInfo {
  if (!code) return { name: "Unknown", region: "Unknown", coords: [0, 0] };
  const upper = code.toUpperCase();
  return (
    COUNTRY_TABLE[upper] ?? {
      name: upper,
      region: "Unknown",
      coords: [0, 0],
    }
  );
}
