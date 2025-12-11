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

type HomePageWithNews = Page.HomePage['entry'] & {
  news?: any[];
};

export default function Page({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const { path } = useRouterHook(); // homepage path = "/"
  const { personalizationSDK } = usePersonalization();

  const [data, setData] = useState<HomePageWithNews | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const refUids = [
        ...textAndImageReferenceIncludes,
        ...teaserReferenceIncludes,
        ...imageCardsReferenceIncludes,
      ];

      const jsonRTEPaths = [...textJSONRtePaths];

      let res = (await getEntryByUrl<Page.HomePage['entry']>(
        'home_page',
        locale,
        '/', // homepage URL
        refUids,
        jsonRTEPaths,
        personalizationSDK
      )) as HomePageWithNews | undefined;

      if (!res) throw new Error('404');

      // Inject news if homepage has news block
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
        contenttype: 'home_page',
        locale,
      });

      setLoading(false);
    } catch (err) {
      console.error('Home Page Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    onEntryChange(fetchData);
  }, [locale]);

  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data?.components}
        featured_articles={(data as any).featured_articles}
        news={data?.news ?? []}
      />
    </PageWrapper>
  );
}
