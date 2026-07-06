import type { MetadataRoute } from "next";
import { getSafeAppUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSafeAppUrl();
  const now = new Date();

  return [
    "/terms",
    "/privacy",
    "/commercial-transaction",
    "/contact",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.3,
  }));
}
