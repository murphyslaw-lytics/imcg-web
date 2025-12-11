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
import { cookies } from "next/headers";

export default async function Page(props: any) {
  const { locale, slug } = props.params;

  const path = "/" + slug.join("/");

  const personalizationCookie = cookies().get("cs_personalize_variants")?.value;
  const personalizationSDK = personalizationCookie
    ? { getAppliedVariants: () => deserializeVariantIds(personalizationCookie) }
    : undefined;

  const refUids = [
    ...textAndImageReferenceIncludes,
    ...teaserReferenceIncludes,
    ...imageCardsReferenceIncludes,
  ];

  const jsonRTEPaths = [...textJSONRtePaths];

  let entry: (Page.LandingPage["entry"] & { news?: any[] }) | null = null;

  try {
    entry = (await getEntryByUrl<Page.LandingPage["entry"]>(
      "landing_page",
      locale,
      path,
      refUids,
      jsonRTEPaths,
      personalizationSDK
    )) as any;
  } catch (e) {
    console.error("❌ Failed to load page:", e);
  }

  if (!entry) return notFound();

  const hasNews = entry.components?.some((b: any) => b.news_section);

  if (hasNews) {
    entry.news = await getDailyNewsArticles();
  }

  return (
    <PageWrapper {...entry}>
      <RenderComponents components={entry.components} news={entry.news ?? []} />
    </PageWrapper>
  );
}
