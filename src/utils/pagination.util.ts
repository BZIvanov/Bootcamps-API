export const getPaginationMeta = (
  total: number,
  query: Record<string, unknown>
) => {
  const page = parseInt((query.page as string) || '1', 10);
  const limit = parseInt((query.limit as string) || '10', 10);
  const totalPages = Math.ceil(total / limit);

  return { page, limit, totalPages };
};
