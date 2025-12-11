'use client';

import React from 'react';

export type NewsSectionProps = {
  id?: string;
  enabled?: boolean;
  _metadata?: any;
  items: any[];
};

export default function NewsSection({
  id,
  enabled = true,
  items,
}: NewsSectionProps) {
  if (!enabled) return null;
  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="py-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-2xl font-semibold">
          Latest personalisation & AI news
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item: any, index: number) => {
            const title =
              item.title ||
              item.headline ||
              item.news_title ||
              `Article ${index + 1}`;
            const url = item.url || item.link || '#';
            const summary =
              item.summary || item.description || item.subtitle || '';

            return (
              <article
                key={item.uid ?? index}
                className="rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-medium">
                  {url !== '#' ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h3>
                {summary && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {summary}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
