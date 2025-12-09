'use client';

import React from 'react';
import Link from 'next/link';

interface NewsItem {
  title: string;
  url: string;
  summary?: string;
  thumbnail_url?: string;
  source?: string;
  published_at?: string;
}

interface NewsSectionProps {
  items: NewsItem[];
}

export default function NewsSection({ items }: NewsSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="news-section mt-10 mb-14">
      <h2 className="text-2xl font-bold mb-6">Daily News</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            target="_blank"
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
          >
            {/* Thumbnail */}
            {item.thumbnail_url && (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

            {/* Summary */}
            {item.summary && (
              <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 flex justify-between">
              {item.source && <span>Source: {item.source}</span>}
              {item.published_at && (
                <span>{new Date(item.published_at).toLocaleDateString()}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
