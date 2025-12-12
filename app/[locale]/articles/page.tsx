"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import NotFound from "@/components/NotFound";
import { RenderComponents } from "@/components/RenderComponents";
import { getEntries } from "@/services/contentstack";
import { usePersonalization } from "@/context";

export default function ArticlesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const { personalizationSDK } = usePersonalization();

  const [page, setPage] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch page data for `/articles`
        const jsonPage = await getEntries(
          "articles_page",
          `&query={"url":"/articles","locale":"${locale}"}`
        );

        const entry = jsonPage.entries?.[0];
        if (!entry) {
          setLoading(false);
          return;
        }

        // Fetch all article items
        const jsonArticles = await getEntries("article", `&locale=${locale}`);

        setPage(entry);
        setArticles(jsonArticles.entries ?? []);
      } catch (err) {
        console.error("Articles page error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [locale, personalizationSDK]);

  if (loading) return null;
  if (!page) return <NotFound />;

  return (
    <PageWrapper {...page}>
      <RenderComponents
        components={page.components}
        articles={articles}
      />
    </PageWrapper>
  );
}
