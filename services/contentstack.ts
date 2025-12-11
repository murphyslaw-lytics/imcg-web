import _ from 'lodash';
import { addEditableTags, jsonToHTML } from '@contentstack/utils';
import { QueryOperator } from '@contentstack/delivery-sdk';
import { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object';
import { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk';
import { isEditButtonsEnabled, Stack } from '@/config';
import { deserializeVariantIds } from '@/utils';

/**
 * Fetch daily news articles: always returns an array of entries.
 */
export async function getDailyNewsArticles() {
  if (!Stack) {
    throw new Error('Stack is not initialised');
  }

  const query = Stack.contentType('daily_news_article').entry().query();

  // find() returns [entries[], schema]
  const [entries] = (await query.find()) as [any[], unknown];

  if (!entries || !Array.isArray(entries)) {
    return [];
  }

  return entries;
}

/**
 * Fetch multiple entries from a specific content-type.
 */
export const getEntries = async <T>(
  contentTypeUid: string,
  locale: string,
  referenceFieldPath: string[],
  jsonRtePath: string[],
  query: { queryOperator?: string; filterQuery?: any },
  personalizationSDK?: Sdk,
  limit: number = 0,
) => {
  try {
    if (!Stack) {
      throw new Error(
        'No stack initialization found. Check Contentstack environment variables.',
      );
    }

    const entryQuery = Stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])
      .variants(deserializeVariantIds(personalizationSDK))
      .query();

    // OR query handling
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

        return Stack.contentType(contentTypeUid)
          .entry()
          .query()
          .containedIn(key, value as (string | number | boolean)[]);
      });

      entryQuery.queryOperator(QueryOperator.OR, ...queries);
    }

    // Simple equalTo filter
    if (query?.filterQuery?.key && query?.filterQuery?.value) {
      entryQuery.equalTo(query.filterQuery.key, query.filterQuery.value);
    }

    // Optional limit
    if (limit !== 0) entryQuery.limit(limit);

    const result = (await entryQuery
      .addParams({ include_metadata: true })
      .addParams({ include_applied_variants: true })
      .find()) as { entries: T[] };

    const data = result?.entries as EmbeddedItem[];

    if (data && _.isEmpty(data?.[0])) {
      throw '404 | Not found';
    }

    data.forEach((entry) => {
      if (jsonRtePath?.length) {
        jsonToHTML({
          entry,
          paths: jsonRtePath,
        });
      }

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

/**
 * Fetch a single entry by URL.
 */
export const getEntryByUrl = async <T>(
  contentTypeUid: string,
  locale: string,
  entryUrl: string,
  referenceFieldPath: string[],
  jsonRtePath: string[],
  personalizationSDK?: Sdk,
) => {
  try {
    if (!Stack) {
      throw new Error(
        'No stack initialization found. Check Contentstack environment variables.',
      );
    }

    const entryRef = Stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])
      .variants(deserializeVariantIds(personalizationSDK));

    referenceFieldPath?.forEach((path) => entryRef.includeReference(path));

    const result = (await entryRef
      .query()
      .equalTo('url', entryUrl)
      .addParams({ include_metadata: true })
      .addParams({ include_applied_variants: true })
      .find()) as { entries: T[] };

    const data = result?.entries?.[0] as EmbeddedItem;

    if (!data || _.isEmpty(data)) {
      throw '404 | Not found';
    }

    if (jsonRtePath?.length) {
      jsonToHTML({
        entry: data,
        paths: jsonRtePath,
      });
    }

    if (isEditButtonsEnabled) {
      addEditableTags(data, contentTypeUid, true, locale);
    }

    return data;
  } catch (error) {
    console.error('🚀 ~ getEntryByUrl ~ error:', error);
    throw error;
  }
};
