const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeUrl(url: string) {
  const withProtocol = url.startsWith("http") ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteUrl() {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      DEFAULT_SITE_URL,
  );
}

export const siteConfig = {
  name: "DSA Visualizer",
  defaultTitle: "DSA Visualizer - Learn Data Structures & Algorithms Interactively",
  description:
    "Master DSA with interactive visualizations, multi-language code, and practice problems",
  keywords: [
    "DSA Visualizer",
    "data structures",
    "algorithms",
    "interactive coding",
    "algorithm visualizer",
    "coding interview prep",
    "LeetCode practice",
    "computer science education",
    "multi-language code examples",
    "Next.js learning app",
  ],
  ogImage: "/opengraph-image",
  url: getSiteUrl(),
};
