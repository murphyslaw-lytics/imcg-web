import PageWrapper from '@/components/PageWrapper';
import { RenderComponents } from '@/components/RenderComponents';
import { getEntries } from '@/services/cs-api';
import NotFound from '@/components/NotFound';

interface Props {
  params: { locale: string; slug: string[] };
}

export default async function DynamicPage({ params }: Props) {
  const { locale, slug } = params;
  const url = '/' + slug.join('/');

  const pages = await getEntries('page');
  const page = pages?.find((p: any) => p.url === url && p.locale === locale);

  if (!page) return <NotFound />;

  return (
    <PageWrapper locale={locale}>
      <RenderComponents
        components={page.page_components ?? []}
        featured_articles={page.featured_articles ?? null}
        news={[]}
      />
    </PageWrapper>
  );
}
