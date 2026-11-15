import { baseApi } from '../../shared/api/baseApi';
import type { BookDetails, BookList, BookRef } from '../../shared/api/types';

// collection — книги, которые можно читать (коллекция в БД бэкенда); all — живой поиск
// по всему Open Library, где читаемые помечены `isReadable`.
export type CatalogScope = 'collection' | 'all';

export type BooksQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  genre?: string;
  scope?: CatalogScope;
};

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Кэш ключуется аргументом целиком: каждая страница поиска — отдельная запись,
    // повторный визит отдаётся мгновенно без рефетча.
    // Язык интерфейса в запрос не уходит: он не должен фильтровать каталог.
    getBooks: builder.query<BookList, BooksQuery>({
      query: ({ page = 1, pageSize = 24, q = '', genre = '', scope = 'collection' }) => ({
        url: 'catalog/books',
        params: {
          page,
          pageSize,
          q: q || undefined,
          genre: genre || undefined,
          // collection — умолчание сервера, в адрес запроса не пишем.
          scope: scope === 'all' ? 'all' : undefined,
        },
      }),
    }),
    getBook: builder.query<BookDetails, BookRef>({
      query: ({ provider, externalId }) => `catalog/books/${provider}/${externalId}`,
    }),
  }),
});

export const { useGetBooksQuery, useGetBookQuery } = catalogApi;
