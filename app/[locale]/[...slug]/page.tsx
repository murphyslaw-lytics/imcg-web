import { PageWrapper, RenderComponents, NotFoundComponent } from '@/components';
import {
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths,
} from '@/services/helper';
import { getDailyNewsArticles, getEntryByUrl } from '@/services/contentstack';
import { Page } from '@/types';

type LandingPageWithNews = Page.LandingPage['entry'] & {
  news?: any[];
};

export const dynamic = 'force-dynamic';

export default async function LandingPage({
  params,
}: {
  params: { locale: string; slug: string[] };
}) {
  const locale = params.locale;
  const slugSegments = params.slug || [];
  const path = '/' + slugSegments.join('/');

  const refUids = [
    ...textAndImageReferenceIncludes,
    ...teaserReferenceIncludes,
    ...imageCardsReferenceIncludes,
  ];
  const jsonRTEPaths = [...textJSONRtePaths];

  let entry: LandingPageWithNews | null = null;

  try {
    entry = (await getEntryByUrl<Page.LandingPage['entry']>(
      'landing_page',
      locale,
      path,
      refUids,
      jsonRTEPaths,
    )) as LandingPageWithNews | null;

    if (!entry) {
      throw new Error('404');
    }

    const hasNewsSection = entry.components?.some(
      (block: any) => (block as any).news_section,
    );

    if (hasNewsSection) {
      const newsItems = await getDailyNewsArticles();
      entry = { ...entry, news: newsItems };
    }
  } catch (err) {
    console.error('❌ Landing page error:', err);
  }

  if (!entry) {
    return <NotFoundComponent />;
  }

  return (
    <PageWrapper {...entry}>
      <RenderComponents
        components={entry.components}
        featured_articles={entry.featured_articles}
        news={entry.news ?? []}
        $={entry.$}
        isABEnabled={false}
      />
    </PageWrapper>
  );
}
