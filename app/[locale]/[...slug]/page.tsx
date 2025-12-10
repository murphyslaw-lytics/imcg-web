'use client';

import { useEffect, useState } from 'react';
import Personalize from '@contentstack/personalize-edge-sdk';
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

// -----------------------------------------------------------
// Local type for extended entry with news
// -----------------------------------------------------------
type LandingPageWithNews = Page.LandingPage['entry'] & {
  news?: any[];
};

export default function LandingPage() {
  const [data, setData] = useState<LandingPageWithNews | null>(null);
  const [loading, setLoading] = useState(true);

  // Hooks MUST be declared before fetchData
  const { path, locale } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

  // -----------------------------------------------------------
  // Fetch Data
  // -----------------------------------------------------------
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

      // Detect News Section
      const hasNewsSection = res.components?.some(
        (block: any) => block.news_section
      );

      if (hasNewsSection) {
        const newsItems = await getDailyNewsArticles();
        res = { ...res, news: newsItems };
      }

      setData(res);

      // Chrome Extension Support
      setDataForChromeExtension({
        entryUid: res.uid ?? '',
        contenttype: 'landing_page',
        locale,
      });

      setLoading(false);
    } catch (err) {
      console.error('❌ Landing Page Error:', err);
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // Fetch based on entry change
  // -----------------------------------------------------------
  useEffect(() => {
    onEntryChange(fetchData);
  }, [path, locale]);

  console.log('📄 SLUG PAGE ROUTE RENDERED');

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------
  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  if (!data) return null;

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data.components}
        news={data.news ?? []}
      />
    </PageWrapper>
  );
}
