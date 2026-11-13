import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetBooksQuery } from './catalogApi';
import { useBooksPage } from './useBooksPage';

vi.mock('./catalogApi', () => ({ useGetBooksQuery: vi.fn() }));

const page = (label) => ({ items: [{ externalId: label }], total: 1 });

describe('useBooksPage', () => {
  beforeEach(() => {
    vi.mocked(useGetBooksQuery).mockReset();
  });

  it('keeps previous data on screen while the next page is fetching', () => {
    useGetBooksQuery.mockReturnValue({ data: page('p1'), isFetching: false });
    const { result, rerender } = renderHook((args) => useBooksPage(args), {
      initialProps: { page: 1 },
    });
    expect(result.current.data).toEqual(page('p1'));

    // Первый заход на новую страницу: data === undefined, но грид не должен опустеть.
    useGetBooksQuery.mockReturnValue({ data: undefined, isFetching: true });
    rerender({ page: 2 });
    expect(result.current.data).toEqual(page('p1'));
    expect(result.current.isFetching).toBe(true);

    // Новая страница пришла — отдаём её.
    useGetBooksQuery.mockReturnValue({ data: page('p2'), isFetching: false });
    rerender({ page: 2 });
    expect(result.current.data).toEqual(page('p2'));
  });
});
