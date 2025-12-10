import _ from 'lodash';
import { addEditableTags, jsonToHTML } from '@contentstack/utils';
import { QueryOperator } from '@contentstack/delivery-sdk';
import { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object';
import { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk';
import { isEditButtonsEnabled, Stack } from '@/config';
import { deserializeVariantIds } from '@/utils';

/* -----------------------------------------------------------
   ✅ ALWAYS RETURN VALID ARRAY OF NEWS ARTICLES
----------------------------------------------------------- */
export async function getDailyNewsArticles() {
  if (!Stack) {
    console.error("Contentstack stack not initialized.");
    return [];
  }

  const Query = Stack.contentType('daily_news_article').entry().query();

  const data = await Query.toJSON().find();

  // find() returns: [entries[], schema]
  const entries = (data as any)?.[0] ?? [];

  return Array.isArray(entries) ? entries : [entries];
}

/* -----------------------------------------------------------
   Get multiple entries
----------------------------------------------------------- */
export const getEntries = async <T>(
  contentTypeUid: string,
  locale: string,
  referenceFieldPath: string[],
  jsonRtePath: string[],
  query: { queryOperator?: string; filterQuery?: any },
  personalizationSDK?: Sdk,
  limit: number = 0
) => {
  try {
    if (!Stack) throw new Error('Stack not initialized.');

    const entryQuery = Stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])
      .variants(deserializeVariantIds(personalizationSDK))
      .query();

    /* -----------------------------------------------
       OR QUERY HANDLING — FIXED TYPE FOR containedIn()
    ------------------------------------------------ */
    if (query?.filterQuery?.length > 0 && query.queryOperator === 'or') {
      const queries = query.filterQuery.map((q: any) => {
        const key = Object.keys(q)[0];
        const value = Object.values(q)[0];

        if (typeof value === 'string') {
          return Stack.contentType(contentTypeUid)
            .entry()
            .query()
            .equalTo(key, value);
        }

        // Ensure value is an array for containedIn()
        const arr = Array.isArray(value) ? value : [value];

        return Stack.contentType(contentTypeUid)
          .entry()
          .query()
          .containedIn(key, arr as (string | number | boolean)[]);
      });

      entryQuery.queryOperator(QueryOperator.OR, ...queries);
    }

    /* -----------------------------------------------
       SIMPLE equalTo QUERY
    ------------------------------------------------ */
    if (query?.filterQuery?.key && query?.filterQuery?.value) {
      entryQuery.equalTo(query.filterQuery.key, query.filterQuery.value);
    }

    if (limit !== 0) entryQuery.limit(limit);

    const result = (await entryQuery
      .addParams({ include_metadata: true })
      .addParams({ include_applied_variants: true })
      .find()) as { entries: T[] };

    const data = result?.entries as EmbeddedItem[];

    if (data && _.isEmpty(data?.[0])) throw '404 | Not found';

    // Convert RTE JSON and add editable tags
    data.forEach((entry) => {
      if (jsonRtePath) jsonToHTML({ entry, paths: jsonRtePath });

      if (isEditButtonsEnabled) {
        addEditableTags(entry, contentTypeUid, true, locale);
      }
    });

    return data;
  } catch (error) {
    console.error('🚀 ~ getEntries ~ error:', error);
    throw error;
  }
};

/* -----------------------------------------------------------
   Get a single entry by URL
----------------------------------------------------------- */
export const getEntryByUrl = async <T>(
  contentTypeUid: string,
  locale: string,
  entryUrl: string,
  referenceFieldPath: string[],
  jsonRtePath: string[],
  personalizationSDK?: Sdk
) => {
  try {
    if (!Stack) throw new Error('Stack not initialized.');

    const entryQuery = Stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])
      .variants(deserializeVariantIds(personalizationSDK));

    // Ensure reference includes are applied
    referenceFieldPath?.forEach((path) => entryQuery.includeReference(path));

    const result = (await entryQuery
      .query()
      .equalTo('url', entryUrl)
      .addParams({ include_metadata: true })
      .addParams({ include_applied_variants: true })
      .find()) as { entries: T[] };

    const data = result?.entries?.[0] as EmbeddedItem;

    if (!data || _.isEmpty(data)) throw '404 | Not found';

    // Convert JSON RTE
    if (jsonRtePath) jsonToHTML({ entry: data, paths: jsonRtePath });

    // Live Preview tags
    if (isEditButtonsEnabled) {
      addEditableTags(data, contentTypeUid, true, locale);
    }

    return data;
  } catch (error) {
    console.error('🚀 ~ getEntryByUrl ~ error:', error);
    throw error;
  }
};
