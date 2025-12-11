"use client";

import { useEffect, useState } from "react";
import { usePersonalization } from "@/context";
import { useRouterHook } from "@/hooks/useRouterHook";
import { getEntryByUrl, getDailyNewsArticles } from "@/services/contentstack";
import {
  textAndImageReferenceIncludes,
  teaserReferenceIncludes,
  imageCardsReferenceIncludes,
  textJSONRtePaths,
} from "@/references";
import RenderComponents from "@/components/RenderComponents";
import PageWrapper from "@/components/PageWrapper";
import NotFoundComponent from "@/components/NotFound";

export default function Page(props: any) {
  const { params } = props;
  const { locale, slug } = params;

  const { personalizationSDK } = usePersonalization();
  const { path } = useRouterHook();

  const resolvedPath = "/" + slug.join("/");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const refUids = [
        ...textAndImageReferenceIncludes,
        ...teaserReferenceIncludes,
        ...imageCardsReferenceIncludes,
      ];
      const jsonRTEPaths = [...textJSONRtePaths];

      let res = await getEntryByUrl(
        "page",
        locale,
        resolvedPath,
        refUids,
        jsonRTEPaths,
        personalizationSDK
      );

      if (!res) throw new Error("404");

      const hasNewsSection = res?.components?.some(
        (c: any) => c.news_section
      );

      if (hasNewsSection) {
        const news = await getDailyNewsArticles();
        res = { ...res, news };
      }

      setData(res);
      setLoading(false);
    } catch (err) {
      console.error("Slug page error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedPath, locale]);

  if (loading) return null;
  if (!data) return <NotFoundComponent />;

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data.components}
        news={data.news ?? []}
      />
    </PageWrapper>
  );
}
