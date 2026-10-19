type Page = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

const PAGE_SIZE = 1000;

/**
 * Every row of a query, fetched in pages (the API returns at most 1000 rows per
 * request). `page(from, to)` must apply `.range(from, to)` to a stable ordering.
 */
export async function fetchAllRows<T>(page: (from: number, to: number) => Page): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
