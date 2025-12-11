import { PageWrapper, RenderComponents, NotFoundComponent } from '@/components';
import {
  featuredArticlesReferenceIncludes,
  imageCardsReferenceIncludes,
  teaserReferenceIncludes,
  textAndImageReferenceIncludes,
  textJSONRtePaths,
} from '@/services/helper';
import { getDailyNewsArticles, getEntryByUrl } from '@/services/contentstack';
import { Page } from '@/types';

export const dynamic = 'force-dynamic';

type HomeEntryWithNews = Page.Homepage['entry'] & {
  news?: any[];
};

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const path = '/'; // homepage URL in Contentstack

  const refUids = [
    ...textAndImageReferenceIncludes,
    ...teaserReferenceIncludes,
    ...imageCardsReferenceIncludes,
    ...featuredArticlesReferenceIncludes,
  ];

  const jsonRTEPaths = [...textJSONRtePaths];

  let entry: HomeEntryWithNews | null = null;

  try {
    entry = (await getEntryByUrl<Page.Homepage['entry']>(
      'home_page',
      locale,
      path,
      refUids,
      jsonRTEPaths,
    )) as HomeEntryWithNews | null;

    if (!entry) {
      throw new Error('404');
    }

    // Detect news section block
    const hasNewsSection = entry.components?.some(
      (block: any) => (block as any).news_section,
    );

    if (hasNewsSection) {
      const newsItems = await getDailyNewsArticles();
      entry = { ...entry, news: newsItems };
    }
  } catch (err) {
    console.error('❌ Home page error:', err);
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
