import type { VisitorSession } from "./types";

export const seedSessions: VisitorSession[] = [
  {
    id: "S-GB-0001",
    country: "United Kingdom",
    city: "London",
    region: "Europe",
    source: "Google Search",
    browser: "Chrome 135",
    device: "Desktop",
    duration: "12m 04s",
    timestamp: "2026-05-04T09:15:00Z",
    pages: 5,
    coordinates: [-0.1, 51.5],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "09:15",
        thumbnail:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/contents",
        label: "Overview of Chapters",
        at: "09:17",
        thumbnail:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/chapter/1",
        label: "Chapter 1",
        at: "09:22",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
  {
    id: "S-US-0002",
    country: "United States",
    city: "Washington D.C.",
    region: "North America",
    source: "Direct",
    browser: "Safari 18",
    device: "Desktop",
    duration: "18m 22s",
    timestamp: "2026-05-04T13:45:00Z",
    pages: 7,
    coordinates: [-77.0, 38.9],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "13:45",
        thumbnail:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/insights",
        label: "Insights",
        at: "13:48",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/contact",
        label: "Contact",
        at: "14:00",
        thumbnail:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
  {
    id: "S-DE-0003",
    country: "Germany",
    city: "Berlin",
    region: "Europe",
    source: "LinkedIn",
    browser: "Firefox 137",
    device: "Desktop",
    duration: "09m 58s",
    timestamp: "2026-05-04T07:30:00Z",
    pages: 4,
    coordinates: [13.4, 52.5],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "07:30",
        thumbnail:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/dedication",
        label: "Dedication",
        at: "07:33",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/chapter/3",
        label: "Chapter 3",
        at: "07:38",
        thumbnail:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
  {
    id: "S-JO-0004",
    country: "Jordan",
    city: "Amman",
    region: "Asia",
    source: "Google Search",
    browser: "Chrome 135",
    device: "Mobile",
    duration: "06m 11s",
    timestamp: "2026-05-03T20:05:00Z",
    pages: 3,
    coordinates: [35.9, 31.9],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "20:05",
        thumbnail:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/contents",
        label: "Overview of Chapters",
        at: "20:07",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/contact",
        label: "Contact",
        at: "20:10",
        thumbnail:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
  {
    id: "S-EG-0005",
    country: "Egypt",
    city: "Cairo",
    region: "Africa",
    source: "Referral",
    browser: "Chrome 134",
    device: "Mobile",
    duration: "05m 33s",
    timestamp: "2026-05-03T16:20:00Z",
    pages: 2,
    coordinates: [31.2, 30.1],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "16:20",
        thumbnail:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/insights",
        label: "Insights",
        at: "16:24",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
  {
    id: "S-CA-0006",
    country: "Canada",
    city: "Toronto",
    region: "North America",
    source: "Bing",
    browser: "Edge 134",
    device: "Desktop",
    duration: "07m 19s",
    timestamp: "2024-02-14T11:40:00Z",
    pages: 3,
    coordinates: [-79.38, 43.65],
    journey: [
      {
        path: "/",
        label: "Home",
        at: "11:40",
        thumbnail:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/contents",
        label: "Overview of Chapters",
        at: "11:43",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=420&q=80",
      },
      {
        path: "/chapter/2",
        label: "Chapter 2",
        at: "11:46",
        thumbnail:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=420&q=80",
      },
    ],
  },
];
