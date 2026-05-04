export type JourneyStep = {
  path: string;
  label: string;
  at: string;
  thumbnail: string;
};

export type VisitorSession = {
  id: string;
  country: string;
  city: string;
  region: string;
  source: string;
  browser: string;
  device: string;
  duration: string;
  timestamp: string;
  pages: number;
  coordinates: [number, number];
  journey: JourneyStep[];
};
