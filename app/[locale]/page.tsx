'use client';

import { useEffect, useState } from 'react';
import { RenderComponents } from '@/components';
import { Page } from '@/types';
import { NotFoundComponent, PageWrapper } from '@/components';
import { onEntryChange } from '@/config';
import useRouterHook from '@/hooks/useRouterHook';
import { isDataInLiveEdit, setDataForChromeExtension } from '@/utils';
import {
  featuredArticlesReferenceIncludes,
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths,
} from '@/services/helper';
import { getEntryByUrl } from '@/services';
import { usePersonalization } from '@/context';
import { getDailyNewsArticles } from '@/services/contentstack';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [data, setData] = useState<Page.Homepage['entry'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { path, locale } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

  const fetchData = async () => {
    try {
      const refUids = [
        ...textAndImageReferenceIncludes,
        ...teaserReferenceIncludes,
        ...imageCardsReferenceIncludes,
        ...featuredArticlesReferenceIncludes,
      ];

      const jsonRTEPaths = [...textJSONRtePaths];

      let res = await getEntryByUrl<Page.Homepage['entry']>(
        'home_page',
        locale,
        path,
        refUids,
        jsonRTEPaths,
        personalizationSDK
      );

      if (!res) {
        throw new Error('404');
      }

      // Detect News Section block
      const hasNewsSection = res.components?.some(
        (block: any) => block.news_section
      );

      if (hasNewsSection) {
        const newsItems = await getDailyNewsArticles();
        res = { ...res, news: newsItems };
      }

      setData(res);

      // Chrome extension helper
      setDataForChromeExtension({
        entryUid: res.uid ?? '',
        contenttype: 'home_page',
        locale,
      });

      setLoading(false);
    } catch (err) {
      console.error('❌ fetchData error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    onEntryChange(fetchData);
  }, []);

  console.log('🏠 HOME PAGE ROUTE RENDERED');

  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  return (
    <PageWrapper {...data}>
      <RenderComponents
        {...data?.$}
        components={data?.components}
        featured_articles={data?.featured_articles}
        news={data?.news ?? []}
      />
    </PageWrapper>
  );
}
