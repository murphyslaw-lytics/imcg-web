import PageWrapper from '@/components/PageWrapper';
import { RenderComponents } from '@/components/RenderComponents';
import { getEntries } from '@/services/cs-api';
import NotFound from '@/components/NotFound';

interface Props {
  params: { locale: string };
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = params;

  const articles = await getEntries('article');
  if (!articles?.length) return <NotFound />;

  // Use "articles" page entry layout if you have one
  const articlePage = {
    page_components: [
      {
        card_collection: {
          cards: articles
        }
      }
    ]
  };

  return (
    <PageWrapper locale={locale}>
      <RenderComponents components={articlePage.page_components} featured_articles={null} news={[]} />
    </PageWrapper>
  );
}
