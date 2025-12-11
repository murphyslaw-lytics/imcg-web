"use client";

import { useEffect, useState } from "react";
import { getArticles } from "@/services/contentstack";
import PageWrapper from "@/components/PageWrapper";
import RenderComponents from "@/components/RenderComponents";
import NotFoundComponent from "@/components/NotFound";

export default function Page(props: any) {
  const { params } = props;
  const { locale } = params;

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getArticles(locale);
      setArticles(res ?? []);
      setLoading(false);
    } catch (err) {
      console.error("Article listing error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [locale]);

  if (loading) return null;
  if (!articles.length) return <NotFoundComponent />;

  return (
    <PageWrapper title="Articles">
      <RenderComponents
        components={[
          {
            article_listing: { items: articles }
          }
        ]}
        news={[]}
      />
    </PageWrapper>
  );
}
