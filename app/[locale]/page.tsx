"use client";

import { useEffect, useState } from "react";
import { RenderComponents } from "@/components/RenderComponents";
import PageWrapper from "@/components/PageWrapper";
import NotFound from "@/components/NotFound";
import { usePersonalization } from "@/context";
import { getEntries, getDailyNewsArticles } from "@/services/contentstack";

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const { personalizationSDK } = usePersonalization();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Query homepage by `url == "/"` in this locale
        const json = await getEntries(
          "landing_page",
          `&query={"url":"/","locale":"${locale}"}`
        );

        const entry = json.entries?.[0];
        if (!entry) {
          setLoading(false);
          return;
        }

        // Inject daily news (if block exists)
        const hasNews = entry.components?.some((c: any) => c.news_section);
        if (hasNews) {
          entry.news = await getDailyNewsArticles();
        }

        setData(entry);
      } catch (e) {
        console.error("Home error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locale, personalizationSDK]);

  if (loading) return null;
  if (!data) return <NotFound />;

  return (
    <PageWrapper {...data}>
      <RenderComponents components={data.components} news={data.news ?? []} />
    </PageWrapper>
  );
}
