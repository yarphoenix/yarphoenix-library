import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { CatalogScope } from './catalogApi';

type Change = (params: URLSearchParams) => void;

const setOrDelete = (params: URLSearchParams, key: string, value: string) => {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
};

// Номер страницы приходит из адресной строки — там может оказаться что угодно.
const parsePage = (raw: string | null): number => Math.max(1, Math.trunc(Number(raw)) || 1);

/**
 * Состояние каталога живёт в URL: выдача шарится ссылкой, «назад» возвращает прежние
 * страницу, поиск, жанр и режим. Умолчания (первая страница, режим «можно читать») в адрес
 * не пишутся — у главной страницы он остаётся чистым.
 */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get('page'));
  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const scope: CatalogScope = searchParams.get('scope') === 'all' ? 'all' : 'collection';

  const update = useCallback(
    (change: Change, options?: { replace: boolean }) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        change(next);
        return next;
      }, options);
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => update((params) => setOrDelete(params, 'page', next > 1 ? String(next) : '')),
    [update],
  );

  // Поиск меняет адрес на каждой паузе в наборе — заменяем запись истории, иначе «назад»
  // шагал бы по недописанным словам. Смена запроса, жанра или режима возвращает на первую
  // страницу: номер страницы относится к прежней выдаче.
  const setQuery = useCallback(
    (next: string) =>
      update(
        (params) => {
          setOrDelete(params, 'q', next);
          params.delete('page');
        },
        { replace: true },
      ),
    [update],
  );

  const setGenre = useCallback(
    (next: string) =>
      update((params) => {
        setOrDelete(params, 'genre', next);
        params.delete('page');
      }),
    [update],
  );

  const setScope = useCallback(
    (next: CatalogScope) =>
      update((params) => {
        setOrDelete(params, 'scope', next === 'all' ? 'all' : '');
        params.delete('page');
      }),
    [update],
  );

  // Сбрасывает поиск и жанр; режим остаётся — это не фильтр, а выбор, где искать.
  const clearFilters = useCallback(
    () =>
      update((params) => {
        params.delete('q');
        params.delete('genre');
        params.delete('page');
      }),
    [update],
  );

  return { page, q, genre, scope, setPage, setQuery, setGenre, setScope, clearFilters };
}
