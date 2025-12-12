'use client';

import { useEffect, useState } from 'react';
import { getEntry } from '@/services/contentstack';
import { RenderComponents } from '@/components/RenderComponents';
import PageWrapper from '@/components/PageWrapper';
import NotFound from '@/components/NotFound';
import useRouterHook from '@/hooks/useRouterHook';

export default function SlugPage() {
  const { path, locale } = useRouterHook();
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    async function loadPage() {
      const page = await getEntry('page', { url: path });
      setEntry(page);
    }
    loadPage();
  }, [path]);

  if (!entry) return <NotFound />;

  return (
    <PageWrapper {...entry}>
      <RenderComponents components={entry.page_components ?? []} />
    </PageWrapper>
  );
}
