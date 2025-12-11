// -----------------------------------------------------------
// Minimal Contentstack Delivery API client (no SDK)
// Works in Next.js App Router, Edge or Node runtimes.
// -----------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!;
const DELIVERY_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!;
const ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!;
const REGION = "eu";

if (!API_KEY || !DELIVERY_TOKEN || !ENVIRONMENT) {
  throw new Error("Missing Contentstack env vars");
}

const BASE_URL = `https://cdn-${REGION}.contentstack.io/v3`;

// Generic REST helper
async function csFetch(path: string) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      api_key: API_KEY,
      access_token: DELIVERY_TOKEN,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("Contentstack error:", await res.text());
    throw new Error(`Failed request: ${res.status}`);
  }

  return res.json();
}

// -----------------------------------------------------------
// Get a Single Entry
// -----------------------------------------------------------
export async function getEntry(contentType: string, entryUid: string) {
  return csFetch(`/content_types/${contentType}/entries/${entryUid}?environment=${ENVIRONMENT}`);
}

// -----------------------------------------------------------
// Query: Get all entries in a content type
// -----------------------------------------------------------
export async function getEntries(contentType: string, params: string = "") {
  return csFetch(`/content_types/${contentType}/entries?environment=${ENVIRONMENT}${params}`);
}

// -----------------------------------------------------------
// Specific helper: Daily news articles
// -----------------------------------------------------------
export async function getDailyNewsArticles(limit = 10) {
  const json = await getEntries("daily_news_article", `&limit=${limit}&order=-updated_at`);
  return json?.entries ?? [];
}
