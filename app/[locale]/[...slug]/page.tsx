'use client';

import { useEffect, useState } from 'react';
import { isNull } from 'lodash';
import Personalize from '@contentstack/personalize-edge-sdk';
import { RenderComponents } from '@/components';
import { Page } from '@/types';
import { isDataInLiveEdit } from '@/utils';
import { NotFoundComponent, PageWrapper } from '@/components';
import { onEntryChange } from '@/config';
import useRouterHook from '@/hooks/useRouterHook';
import { setDataForChromeExtension } from '@/utils';
import {
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths
} from '@/services/helper';
import { getEntryByUrl } from '@/services';
import { usePersonalization } from '@/context';
import { getDailyNewsArticles } from '@/services/contentstack';

export default function LandingPage() {
  const [data, setData] = useState<Page.LandingPage['entry'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { path, locale } = useRouterHook();
  const [isABTestEnabled, setIsABTestEnabled] = useState<boolean>(false);
  const { personalizationSDK } = usePersonalization();

  /** AB Test Impression Logic */
  useEffect(() => {
    const variants = personalizationSDK?.getVariants() ?? {};

    if (
      path === process.env.CONTENTSTACK_AB_LANDING_PAGE_PATH &&
      Personalize.getInitializationStatus() === 'success' &&
      variants[process.env.CONTENTSTACK_AB_EXPERIENCE_ID ?? '1']
    ) {
      setIsABTestEnabled(true);
      personalizationSDK?.triggerImpression(
        process.env.CONTENTSTACK_AB_EXPERIENCE_ID ?? '1'
      );
    }
  }, [Personalize.getInitializationStatus()]);

  /** Fetch Page Data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const refUids = [
          ...textAndImageReferenceIncludes,
          ...teaserReferenceIncludes,
          ...imageCardsReferenceIncludes
        ];
        const jsonRtePaths = [...textJSONRtePaths];

        const res = await getEntryByUrl<Page.LandingPage['entry']>(
          'landing_page',
          locale,
          path,
          refUids,
          jsonRtePaths,
          personalizationSDK
        );

        // Detect News block
        if (res?.components?.some((block: any) => block.news_section)) {
          const newsItems = await getDailyNewsArticles();
          res.news = newsItems;
        }

        setData(res);
        setDataForChromeExtension({
          entryUid: res?.uid || '',
          contenttype: 'landing_page',
          locale
        });

        if (!res && !isNull(res)) {
          throw '404';
        }
      } catch (err) {
        console.error('Error while fetching Landing page:', err);
        setLoading(false);
      }
    };

    onEntryChange(fetchData);
  }, [path]);

  console.log('📄 SLUG PAGE ROUTE RENDERED');

  // ---------- RETURN UI ----------
  if (!data && !loading && !isDataInLiveEdit()) {
    return <NotFoundComponent />;
  }

  if (!data) return null;

  return (
    <PageWrapper {...data}>
      <RenderComponents
        components={data?.components}
        news={data?.news ?? []}
        isABTestEnabled={isABTestEnabled}
      />
    </PageWrapper>
  );
}
