import React from "react";

export interface NewsSectionProps {
  id?: string;       // required for RenderComponents
  items: any[];      // news items from CMS
  enabled?: boolean;
  _metadata?: any;
}

export default function NewsSection({
  id,
  items,
  enabled,
  _metadata
}: NewsSectionProps) {
  return (
    <section id={id} className="news-section">
      <h2>Latest News</h2>

      {items.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li key={idx}>
              <h3>{item.title}</h3>

              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
