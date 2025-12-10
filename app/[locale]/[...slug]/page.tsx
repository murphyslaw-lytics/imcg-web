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

// ✅ MUST be top-level type (not inside the component)
type LandingPageWithNews = Page.LandingPage['entry'] & {
  news?: any[];
};

export default function LandingPage() {
  const [data, setData] = useState<LandingPageWithNews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // MUST come before fetchData()
  const { path, locale } = useRouterHook();
  const { personalizationSDK } = usePersonalization();

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

      if (!res) {
        throw new Error('404');
      }

      // Detect news section
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
      console.error('❌ Landing Page Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    onEntryChange(fetchData);
  }, [path, locale]); // safer dependencies

  console.log('📄 SLUG PAGE ROUTE RENDERED');

  if (loading) return null;

  if (!data && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  // At this point data is guaranteed non-null
  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data.components}
        news={data.news ?? []}
      />
    </PageWrapper>
  );
}
