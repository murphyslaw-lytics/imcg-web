import PageWrapper from '@/components/PageWrapper';
import { RenderComponents } from '@/components/RenderComponents';
import { getEntries, getEntry } from '@/services/cs-api';
import NotFound from '@/components/NotFound';

interface Props {
  params: {
    locale: string;
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = params;

  // Fetch homepage entry (assumes singleton page = "home")
  const pages = await getEntries('page');
  const homePage = pages?.find((p: any) => p.url === '/' || p.locale === locale);

  if (!homePage) return <NotFound />;

  return (
    <PageWrapper locale={locale}>
      <RenderComponents
        components={homePage.page_components ?? []}
        featured_articles={homePage.featured_articles ?? null}
        news={[]}
      />
    </PageWrapper>
  );
}
