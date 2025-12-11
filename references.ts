// references.ts
// ---------------------------------------------------------
// A simple mapping of reference includes for various types
// ---------------------------------------------------------

export const textAndImageReferenceIncludes: string[] = [];
export const teaserReferenceIncludes: string[] = [];
export const imageCardsReferenceIncludes: string[] = [];

// JSON RTE paths
export const textJSONRtePaths: string[] = [];

// Aggregated reference includes for a Page
export const pageReferenceIncludes = [
  ...textAndImageReferenceIncludes,
  ...teaserReferenceIncludes,
  ...imageCardsReferenceIncludes,
];
