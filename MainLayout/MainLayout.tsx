'use client';

import { useEffect, useState } from 'react';
import { getEntries } from '@/services/contentstack';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout({ children, locale }: { children: React.ReactNode; locale: string }) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      const webConfigRes = await getEntries('web_configuration'); // FIXED
      if (webConfigRes && webConfigRes.length > 0) {
        setConfig(webConfigRes[0]);
      }
    }
    loadConfig();
  }, []);

  return (
    <>
      <Header config={config} locale={locale} />
      <main>{children}</main>
      <Footer config={config} />
    </>
  );
}
