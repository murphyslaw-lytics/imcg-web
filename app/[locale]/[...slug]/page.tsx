"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import NotFound from "@/components/NotFound";
import { RenderComponents } from "@/components/RenderComponents";
import { getEntries, getDailyNewsArticles } from "@/services/contentstack";
import { usePersonalization } from "@/context";

export default function GenericPage({
  params,
}: {
  params: { locale: string; slug: string[] };
}) {
  const locale = params.locale;
  const path = "/" + params.slug.join("/");
  const { personalizationSDK } = usePersonalization();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const json = await getEntries(
          "landing_page",
          `&query={"url":"${path}","locale":"${locale}"}`
        );

        const entry = json.entries?.[0];
        if (!entry) {
          setLoading(false);
          return;
        }

        // Attach news if block exists
        const hasNews = entry.components?.some((c: any) => c.news_section);
        if (hasNews) {
          entry.news = await getDailyNewsArticles();
        }

        setData(entry);
      } catch (err) {
        console.error("Slug page error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locale, path, personalizationSDK]);

  if (loading) return null;
  if (!data) return <NotFound />;

  return (
    <PageWrapper {...data}>
      <RenderComponents components={data.components} news={data.news ?? []} />
    </PageWrapper>
  );
}
