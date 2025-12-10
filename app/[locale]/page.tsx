'use client'
import { useEffect, useState } from 'react'
import { RenderComponents } from '@/components'
import { Page } from '@/types'
import { NotFoundComponent, PageWrapper } from '@/components'
import { onEntryChange } from '@/config'
import useRouterHook from '@/hooks/useRouterHook'
import { isDataInLiveEdit, setDataForChromeExtension } from '@/utils'
import { featuredArticlesReferenceIncludes, imageCardsReferenceIncludes, teaserReferenceIncludes, textAndImageReferenceIncludes, textJSONRtePaths } from '@/services/helper'
import { getEntryByUrl } from '@/services'
import { usePersonalization } from '@/context'
import { getDailyNewsArticles } from '@/services/contentstack';

/**
 * @component Home 
 * 
 * @route '/{locale}/'
 * @description component that renders the home page of the app
 *  
 * @returns {JSX.Element} The rendered homepage content
 */
export default function Home () {

    const [data, setData] = useState<Page.LandingPage['entry'] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const { path, locale } = useRouterHook()
    const {personalizationSDK} = usePersonalization()

    /**
    * @method fetchData
    * @description Method that fetches the home page data and populates state with it
    *
    * @async
    * @returns {Promise<void>}
    */
    const fetchData = async () => {
        try {
            const refUids = [
                ...textAndImageReferenceIncludes,
                ...teaserReferenceIncludes,
                ...imageCardsReferenceIncludes,
                ...featuredArticlesReferenceIncludes
            ]
            const jsonRTEPaths = [
                ...textJSONRtePaths
            ]
            const res = await getEntryByUrl<Page.Homepage['entry']>('home_page', locale, path , refUids, jsonRTEPaths, personalizationSDK) as Page.LandingPage['entry']
            setData(res)
            // Detect News Section block on home page
const hasNewsSection = res?.components?.some(
  (block: any) => block.news_section
);

if (hasNewsSection) {
    const newsItems = await getDailyNewsArticles();
    res.news = newsItems;

    // ⭐ THIS IS THE IMPORTANT PART
    setData({ ...res });
}

            setDataForChromeExtension({ entryUid: res?.uid ?? '', contenttype: 'home_page', locale: locale })
            if (!res) {
                throw '404'
            }
        } catch (err) {
            console.error('🚀 ~ fetchData ~ err:', err)
            setLoading(false)
        }
    }

    /**
     * useEffect to fetch data to be rendered on the page
     * */ 
    useEffect(() => {
        onEntryChange(fetchData)
    }, [])

    return (
        <>
            {data
                ? <PageWrapper {...data}>
                    {data?.components
                        ? <RenderComponents
  $={data?.$}
  components={data?.components}
  featured_articles={data?.featured_articles}
  news={data?.news ?? []}   // ⭐ USE data, NOT res
/>
 : ''}
                </PageWrapper>
                : <>
                    {!loading && !isDataInLiveEdit() && <NotFoundComponent />}
                </>}
        </>
    )
}
