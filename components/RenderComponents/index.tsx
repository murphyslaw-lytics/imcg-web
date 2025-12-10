import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils';
import { CardCollection, FeaturedArticles, Teaser, Text, TextAndImage } from '@/components';
import { Page } from '@/types';
import { pageBlocks } from '@/types/pages';
import { isDataInLiveEdit } from '@/utils';
import NewsSection from '../NewsSection';

/* --------------------------------------------
   Types
--------------------------------------------- */
export interface NewsSectionProps {
  id?: string;
  items: any[];
  enabled?: boolean;
  _metadata?: any;
}

// Extend existing pageBlocks to include optional news_section
type PageBlocksWithNews = pageBlocks & {
  news_section?: {
    enabled?: boolean;
    _metadata?: any;
  };
};

/* --------------------------------------------
   RenderComponents Component
--------------------------------------------- */
function RenderComponents({
  components,
  featured_articles,
  news = [],
  $,
  isABEnabled = false
}: Page.pageRenderProps & { news?: any[] }) {

  console.log("RENDER COMPONENTS → news prop:", news);

  const componentMapper = (component: PageBlocksWithNews, key: number) => {
    switch (true) {
      case !!component.teaser:
        return (
          <Teaser
            id={`teaser-${key}`}
            {...component.teaser}
            isABEnabled={isABEnabled}
          />
        );

      case !!component.text_and_image:
        return (
          <TextAndImage
            id={`text-image-${key}`}
            {...component.text_and_image}
          />
        );

      case !!component.card_collection:
        return (
          <CardCollection
            id={`card-collection-${key}`}
            {...component.card_collection}
          />
        );

      case !!component.text:
        return (
          <Text
            id={`text-${key}`}
            {...component.text}
          />
        );

      case !!component.news_section:
        return (
          <NewsSection
            id={`news-section-${key}`}
            items={news}         // Inject news items supplied from page
            enabled={component.news_section.enabled}
            _metadata={component.news_section._metadata}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div
        {...((isDataInLiveEdit() && $?.components) || {})}
        className={
          components?.length
            ? undefined
            : `${VB_EmptyBlockParentClass} max-height mt-32`
        }
      >
        {components?.map((component, key) => (
          <div
            key={`component-${key}`}
            id={`component-${key}`}
            {...(isDataInLiveEdit() && $?.[`components__${key}`])}
          >
            {componentMapper(component, key)}
          </div>
        ))}
      </div>

      {featured_articles && (
        <FeaturedArticles
          id="card-collection-FeaturedArticles"
          {...featured_articles}
          {...$?.featured_articles}
        />
      )}
    </div>
  );
}

export { RenderComponents };
