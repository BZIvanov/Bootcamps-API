import type { QueryString } from '@/utils/filters.util.js';

export const getPaginationMeta = (total: number, query: QueryString) => {
  const page = parseInt((query.page as string) || '1', 10);
  const limit = parseInt((query.limit as string) || '10', 10);
  const totalPages = Math.ceil(total / limit);

  return { page, limit, totalPages };
};
