import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { storefrontApiRequest } from "@/lib/shopify";

const BASE_URL = "https://dermiglow.com.br";

const COLLECTION_HANDLES = [
  "seruns",
  "cream-line",
  "kits-line",
  "facial-cleansing-line",
  "skincare-accessories-line",
  "sunscreen-line",
];

const STATIC_PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/loja", changefreq: "daily", priority: "0.9" },
  { path: "/sobre", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/ajuda", changefreq: "monthly", priority: "0.5" },
  { path: "/envio-e-trocas", changefreq: "monthly", priority: "0.5" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
];

const HANDLES_QUERY = `
  query SitemapProducts($first: Int!) {
    products(first: $first) {
      edges { node { handle } }
    }
  }
`;

async function productHandles(): Promise<string[]> {
  try {
    const res = (await storefrontApiRequest(HANDLES_QUERY, { first: 250 })) as {
      data?: { products?: { edges?: { node: { handle: string } }[] } };
    };
    return (res?.data?.products?.edges ?? []).map((e) => e.node.handle);
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          ...STATIC_PATHS,
          ...COLLECTION_HANDLES.map((h) => ({
            path: `/colecao/${h}`,
            changefreq: "weekly",
            priority: "0.8",
          })),
          ...(await productHandles()).map((h) => ({
            path: `/produto/${h}`,
            changefreq: "weekly",
            priority: "0.7",
          })),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ].join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
