import type { Quote } from '@hey/lens';

/**
 * Removes the `quoteOn` property from a Quote object.
 * @param publication The Quote object to remove the `quoteOn` property from.
 * @returns The Quote object without the `quoteOn` property.
 */
const removeQuoteOn = (publication: Quote): Quote => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // biome-ignore lint/correctness/noUnusedVariables: We need to remove the `quoteOn` property from the object.
  const { quoteOn, ...rest } = publication;

  return rest as Quote;
};

export default removeQuoteOn;
