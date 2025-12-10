import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils'
import { CardCollection, FeaturedArticles, Teaser, Text, TextAndImage } from '@/components'
import { Page } from '@/types'
import { pageBlocks } from '@/types/pages'
import { isDataInLiveEdit } from '@/utils'
import NewsSection from '../NewsSection'

// Extend pageBlocks to include optional news_section block
type PageBlocksWithNews = pageBlocks & {
  news_section?: {
    enabled?: boolean;
    _metadata?: any;
  };
};

/**
 * Renders different components based on the provided page data
 * @param {Object} props - Component properties
 * @param {Array} props.components - Array of page components to render
 * @param {Object} props.featured_articles - Featured articles data
 * @param {Object} props.$ - Optional object containing data-cslp attributes
 * @param {boolean} [props.isABEnabled=false] - Flag to enable A/B testing
 * @returns {JSX.Element} Rendered components
 */

function RenderComponents({ components, featured_articles, news = [], $, isABEnabled = false }: Page.pageRenderProps & { news?: any[] }) {
    console.log("RENDER COMPONENTS → news prop:", news);
    console.log("RENDER COMPONENTS → components:", components);

const componentMapper = (component: PageBlocksWithNews, key: number) => {

        switch (true) {

        case (!!component.teaser):
            return (

                <Teaser
                    id={`teaser-${key}`}
                    {...component.teaser} isABEnabled={isABEnabled}
                />

            )

        case (!!component.text_and_image):
            return (

                <TextAndImage
                    id={`text-image-${key}`}
                    {...component.text_and_image}
                />

            )

        case (!!component.card_collection):
            return (

                <CardCollection
                    id={`card-collection-${key}`}
                    {...component.card_collection}
                />

            )

        case (!!component.text):
            return (

                <Text
                    id={`text-${key}`}
                    {...component.text}
                />

            )
        case (!!component.news_section):
            return (
                
                <NewsSection
                    id={`news-section-${key}`}
                    items={news}
                    {...component.news_section}
                export interface NewsSectionProps {
                    id?: string;         // ← required to fix Launch error
                    items: any[];
                    enabled?: boolean;
                    _metadata?: any;
                    }
                />
  );

        default:
            return null
        }

    }

    return (
        <div>
            <div {...((isDataInLiveEdit() && $?.components) || {})} //Parent wrapper
                className={components?.length ? undefined : `${VB_EmptyBlockParentClass} max-height mt-32`}
            >
                {components?.map((component, key: number) => <div
                    key={`component-${key}`} id={`component-${key}`}
                    {...(isDataInLiveEdit() && $?.[`components__${key}`])}
                >
                    {
                        componentMapper(component, key)
                    }
                </div>)}
            </div>
            {featured_articles && <FeaturedArticles id='card-collection-FeaturedArticles' {...featured_articles} {...$?.featured_articles} />}
        </div>
    )
}

export { RenderComponents }