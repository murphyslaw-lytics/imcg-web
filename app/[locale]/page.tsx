'use client';

import { useEffect, useState } from 'react';
import { RenderComponents, NotFoundComponent, PageWrapper } from '@/components';
import { Page } from '@/types';
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

// ---------------------------------------------
// ✅ Define type OUTSIDE the component
// ---------------------------------------------
type HomePageWithNews = Page.Homepage['entry'] & {
  news?: any[];
};

export default function HomePage() {
  const [data, setData] = useState<HomePageWithNews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // MUST come before fetchData()
  const { path, locale } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

  // ---------------------------------------------
  // 🚀 Fetch Homepage Data
  // ---------------------------------------------
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

      // Detect news section block
      const hasNewsSection = res.components?.some(
        (block: any) => block.news_section
      );

      if (hasNewsSection) {
        const newsItems = await getDailyNewsArticles();
        res = { ...res, news: newsItems };
      }

      // Set final enriched homepage object
      setData(res);

      // Chrome extension support
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

  // ---------------------------------------------
  // 👀 Trigger onEntryChange watcher
  // ---------------------------------------------
  useEffect(() => {
    onEntryChange(fetchData);
  }, [path, locale]);

  console.log('🏠 HOME PAGE ROUTE RENDERED');

  // ---------------------------------------------
  // 🧹 Loading & 404 handling
  // ---------------------------------------------
  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  // ---------------------------------------------
  // 🏁 Render Home Page
  // ---------------------------------------------
  return (
    <PageWrapper {...data}>
      <RenderComponents
        {...data.$}
        components={data.components}
        featured_articles={data.featured_articles}
        news={data.news ?? []}
      />
    </PageWrapper>
  );
}
