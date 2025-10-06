import type { ParsedQs } from 'qs';
import type { QueryString } from '@/utils/filters.util.js';

/**
 * Converts ParsedQs -> QueryString (string | string[])
 * Nested objects are flattened to JSON strings (or ignored)
 */
export function parseQuery(query: ParsedQs): QueryString {
  const result: QueryString = {};

  for (const key in query) {
    const value = query[key];

    if (typeof value === 'string') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      const strings = value.filter((v): v is string => typeof v === 'string');
      if (strings.length > 0) result[key] = strings;
    }
  }

  return result;
}
