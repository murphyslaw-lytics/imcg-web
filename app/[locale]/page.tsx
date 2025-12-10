'use client';

import { useEffect, useState } from 'react';
import { RenderComponents, PageWrapper, NotFoundComponent } from '@/components';
import { Page } from '@/types';
import useRouterHook from '@/hooks/useRouterHook';
import { onEntryChange } from '@/config';
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
import { setDataForChromeExtension, isDataInLiveEdit } from '@/utils';

// Extend the homepage entry type to optionally include news items
type HomePageWithNews = Page.Homepage['entry'] & {
  news?: any[];
};

export default function Home() {
  const [data, setData] = useState<HomePageWithNews | null>(null);
  const [loading, setLoading] = useState(true);

  const { path, locale } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

  // Fetch homepage entry and optionally attach news
  const fetchData = async () => {
    try {
      const refUids = [
        ...textAndImageReferenceIncludes,
        ...teaserReferenceIncludes,
        ...imageCardsReferenceIncludes,
        ...featuredArticlesReferenceIncludes,
      ];

      const jsonRTEPaths = [...textJSONRtePaths];

      let res = (await getEntryByUrl<Page.Homepage['entry']>(
        'home_page',
        locale,
        path,
        refUids,
        jsonRTEPaths,
        personalizationSDK
      )) as HomePageWithNews | undefined;

      if (!res) {
        throw new Error('404');
      }

      // Check if this page has the News Section block
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
      console.error('❌ Home Page Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    onEntryChange(fetchData);
  }, [path, locale]);

  console.log('🏠 HOME PAGE ROUTE RENDERED');

  if (loading) {
    return null;
  }

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  if (!data) {
    return null;
  }

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data.components}
        featured_articles={data.featured_articles}
        news={data.news ?? []}
      />
    </PageWrapper>
  );
}
