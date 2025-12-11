'use client';

import { useEffect, useState } from 'react';
import { RenderComponents, NotFoundComponent, PageWrapper } from '@/components';
import { Page } from '@/types';
import { onEntryChange } from '@/config';
import useRouterHook from '@/hooks/useRouterHook';
import { isDataInLiveEdit, setDataForChromeExtension } from '@/utils';
import {
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths,
} from '@/services/helper';
import { getEntryByUrl } from '@/services';
import { usePersonalization } from '@/context';
import { getDailyNewsArticles } from '@/services/contentstack';

type LandingPageWithNews = Page.LandingPage['entry'] & {
  news?: any[];
};

export default function Page({
  params,
}: {
  params: { locale: string; slug: string[] };
}) {
  const { locale } = params;
  const { path } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

  const [data, setData] = useState<LandingPageWithNews | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const refUids = [
        ...textAndImageReferenceIncludes,
        ...teaserReferenceIncludes,
        ...imageCardsReferenceIncludes,
      ];

      const jsonRTEPaths = [...textJSONRtePaths];

      let res = (await getEntryByUrl<Page.LandingPage['entry']>(
        'landing_page',
        locale,
        path,
        refUids,
        jsonRTEPaths,
        personalizationSDK
      )) as LandingPageWithNews | undefined;

      if (!res) throw new Error('404');

      const hasNewsSection = res.components?.some(
        (block: any) => block.news_section
      );

      if (hasNewsSection) {
        const newsItems = await getDailyNewsArticles();
        res = { ...res, news: newsItems };
      }

      setData(res);

      setDataForChromeExtension({
        entryUid: res.uid ?? '',
        contenttype: 'landing_page',
        locale,
      });

      setLoading(false);
    } catch (err) {
      console.error('Slug Page Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    onEntryChange(fetchData);
  }, [locale, path]);

  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data?.components}
        news={data?.news ?? []}
      />
    </PageWrapper>
  );
}
