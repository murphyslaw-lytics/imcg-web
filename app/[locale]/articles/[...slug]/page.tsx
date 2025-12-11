"use client";

import { useEffect, useState } from "react";
import { getArticleBySlug } from "@/services/contentstack";
import PageWrapper from "@/components/PageWrapper";
import RenderComponents from "@/components/RenderComponents";
import NotFoundComponent from "@/components/NotFound";

export default function Page(props: any) {
  const { params } = props;
  const { locale, slug } = params;

  const articleSlug = slug.join("/");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getArticleBySlug(articleSlug, locale);
      setData(res ?? null);
      setLoading(false);
    } catch (err) {
      console.error("Article page error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [articleSlug, locale]);

  if (loading) return null;
  if (!data) return <NotFoundComponent />;

  return (
    <PageWrapper {...data}>
      <RenderComponents components={data.components} news={[]} />
    </PageWrapper>
  );
}
