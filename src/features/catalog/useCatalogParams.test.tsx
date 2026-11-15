import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useCatalogParams } from './useCatalogParams';

// Хук вместе с адресной строкой, которую он меняет.
const renderAt = (url: string) =>
  renderHook(() => ({ catalog: useCatalogParams(), search: useLocation().search }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    ),
  });

describe('useCatalogParams', () => {
  it('читает страницу, поиск, жанр и режим из адреса', () => {
    const { result } = renderAt('/?page=3&q=austen&genre=classic&scope=all');

    expect(result.current.catalog).toMatchObject({
      page: 3,
      q: 'austen',
      genre: 'classic',
      scope: 'all',
    });
  });

  it('без параметров — первая страница книг, которые можно читать', () => {
    const { result } = renderAt('/');

    expect(result.current.catalog).toMatchObject({
      page: 1,
      q: '',
      genre: '',
      scope: 'collection',
    });
  });

  it.each(['abc', '0', '-2', ''])('номер страницы «%s» считает первой страницей', (raw) => {
    const { result } = renderAt(`/?page=${raw}`);

    expect(result.current.catalog.page).toBe(1);
  });

  it('незнакомый режим считает коллекцией', () => {
    const { result } = renderAt('/?scope=everything');

    expect(result.current.catalog.scope).toBe('collection');
  });

  it('смена режима возвращает на первую страницу и сохраняет поиск и жанр', () => {
    const { result } = renderAt('/?page=3&q=austen&genre=classic');

    act(() => result.current.catalog.setScope('all'));
    expect(result.current.search).toBe('?q=austen&genre=classic&scope=all');

    // Режим по умолчанию в адрес не пишется.
    act(() => result.current.catalog.setScope('collection'));
    expect(result.current.search).toBe('?q=austen&genre=classic');
  });

  it('новый запрос и новый жанр возвращают на первую страницу', () => {
    const { result } = renderAt('/?page=4&q=austen');

    act(() => result.current.catalog.setQuery('dickens'));
    expect(result.current.search).toBe('?q=dickens');

    act(() => result.current.catalog.setPage(2));
    act(() => result.current.catalog.setGenre('classic'));
    expect(result.current.search).toBe('?q=dickens&genre=classic');
  });

  it('первую страницу в адрес не пишет', () => {
    const { result } = renderAt('/?page=2');

    act(() => result.current.catalog.setPage(3));
    expect(result.current.search).toBe('?page=3');

    act(() => result.current.catalog.setPage(1));
    expect(result.current.search).toBe('');
  });

  it('сброс фильтров убирает поиск и жанр, но оставляет режим', () => {
    const { result } = renderAt('/?page=2&q=austen&genre=classic&scope=all');

    act(() => result.current.catalog.clearFilters());

    expect(result.current.search).toBe('?scope=all');
  });
});
