// -----------------------------------------------------------
// Contentstack SDK Setup
// -----------------------------------------------------------

import * as Contentstack from "contentstack";

const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!;
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!;

if (!apiKey || !deliveryToken || !environment) {
  console.error("❌ Missing Contentstack environment variables");
}

export const Stack = Contentstack.Stack({
  api_key: apiKey,
  delivery_token: deliveryToken,
  environment: environment,
  region: Contentstack.Region.EU, // adjust if needed
});

// -----------------------------------------------------------
// Utility functions
// -----------------------------------------------------------

async function runQuery(query: any) {
  try {
    const result = await query.find();

    // find() returns `[entries, schema]`
    const entries = result?.[0] ?? [];

    // Normalize single / multiple responses
    return Array.isArray(entries) ? entries : [entries];
  } catch (err) {
    console.error("Contentstack Query Error:", err);
    return null;
  }
}

// -----------------------------------------------------------
// Get entry by URL
// -----------------------------------------------------------

export async function getEntryByUrl(
  contentTypeUid: string,
  locale: string,
  url: string,
  referenceIncludes: string[] = [],
  jsonRtePaths: string[] = [],
  personalizationSDK?: any
) {
  try {
    const query = Stack.contentType(contentTypeUid)
      .entry()
      .query()
      .where("url", url)
      .language(locale)
      .includeEmbeddedItems()
      .includeReference(referenceIncludes);

    const entries = await runQuery(query);
    if (!entries || !entries.length) return null;

    let entry = entries[0];

    // Apply JSON RTE resolution if needed
    if (jsonRtePaths.length > 0) {
      jsonRtePaths.forEach((path: string) => {
        const parts = path.split(".");
        let target = entry;

        for (const p of parts) {
          if (!target[p]) break;
          target = target[p];
        }
      });
    }

    // Apply personalization if available
    if (personalizationSDK) {
      entry = personalizationSDK.applyPersonalization(entry);
    }

    return entry;
  } catch (err) {
    console.error("getEntryByUrl() failed:", err);
    return null;
  }
}

// -----------------------------------------------------------
// Get Daily News Articles (custom content type)
// -----------------------------------------------------------

export async function getDailyNewsArticles() {
  try {
    const query = Stack.contentType("daily_news_article")
      .entry()
      .query()
      .includeEmbeddedItems()
      .orderByDescending("date");

    const entries = await runQuery(query);
    return entries ?? [];
  } catch (err) {
    console.error("getDailyNewsArticles() failed:", err);
    return [];
  }
}

// -----------------------------------------------------------
// Article Listing
// -----------------------------------------------------------

export async function getArticles(locale: string) {
  try {
    const query = Stack.contentType("article")
      .entry()
      .query()
      .language(locale)
      .includeEmbeddedItems()
      .orderByDescending("date");

    const entries = await runQuery(query);
    return entries ?? [];
  } catch (err) {
    console.error("getArticles() failed:", err);
    return [];
  }
}

// -----------------------------------------------------------
// Get Single Article by Slug
// -----------------------------------------------------------

export async function getArticleBySlug(slug: string, locale: string) {
  try {
    const query = Stack.contentType("article")
      .entry()
      .query()
      .where("url", "/" + slug)
      .language(locale)
      .includeEmbeddedItems()
      .includeReference(["author"]);

    const entries = await runQuery(query);
    return entries?.[0] ?? null;
  } catch (err) {
    console.error("getArticleBySlug() failed:", err);
    return null;
  }
}
