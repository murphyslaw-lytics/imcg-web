import { notFound } from "next/navigation";
import { PageWrapper, RenderComponents } from "@/components";
import { getEntryByUrl } from "@/services";
import { getDailyNewsArticles } from "@/services/contentstack";
import {
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths,
} from "@/services/helper";
import { Page } from "@/types";
import { deserializeVariantIds } from "@/utils";
import { cookies } from "next/headers"; // for personalization variants if needed

// ---------------------------------------------
// TYPES
// ---------------------------------------------
type LandingPageWithNews = Page.LandingPage["entry"] & {
  news?: any[];
};

// ---------------------------------------------
// DYNAMIC PAGE (Server Component)
// ---------------------------------------------
export default async function Page({
  params,
}: {
  params: { locale: string; slug: string[] };
}) {
  const { locale, slug } = params;

  // Build URL from slug segments
  const path = "/" + slug.join("/");

  // personalization variants from cookie (if any)
  const personalizationCookie = cookies().get("cs_personalize_variants")?.value;
  const personalizationSDK = personalizationCookie
    ? { getAppliedVariants: () => deserializeVariantIds(personalizationCookie) }
    : undefined;

  // ---------------------------------------------
  // Fetch page data from Contentstack
  // ---------------------------------------------
  const refUids = [
    ...textAndImageReferenceIncludes,
    ...teaserReferenceIncludes,
    ...imageCardsReferenceIncludes,
  ];

  const jsonRTEPaths = [...textJSONRtePaths];

  let entry: LandingPageWithNews | null = null;

  try {
    entry = (await getEntryByUrl<Page.LandingPage["entry"]>(
      "landing_page",
      locale,
      path,
      refUids,
      jsonRTEPaths,
      personalizationSDK
    )) as LandingPageWithNews;
  } catch (e) {
    console.error("❌ Failed to fetch entry:", e);
  }

  if (!entry) return notFound();

  // ---------------------------------------------
  // Optional: Attach Daily News if block exists
  // ---------------------------------------------
  const hasNewsSection = entry.components?.some(
    (block: any) => block.news_section
  );

  if (hasNewsSection) {
    const newsItems = await getDailyNewsArticles();
    entry.news = newsItems ?? [];
  }

  // ---------------------------------------------
  // RENDER PAGE
  // ---------------------------------------------
  return (
    <PageWrapper {...entry}>
      <RenderComponents components={entry.components} news={entry.news ?? []} />
    </PageWrapper>
  );
}
