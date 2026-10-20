import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { APPENDICES } from "@/lib/appendices";

const SITE_URL = "https://palestineandthelaw.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/contents", "/dedication", "/insights", "/updates", "/contact"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...CHAPTERS.map((c) => ({ url: `${SITE_URL}/chapter/${c.num}` })),
    ...APPENDICES.map((a) => ({ url: `${SITE_URL}/appendix/${a.num}` })),
  ];
}
