import { baseApi } from '../../shared/api/baseApi';
import type { BookDetails, BookList, BookRef } from '../../shared/api/types';

export type BooksQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  genre?: string;
  lang?: string;
};

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Кэш ключуется аргументом целиком: каждая страница поиска — отдельная запись,
    // повторный визит отдаётся мгновенно без рефетча.
    getBooks: builder.query<BookList, BooksQuery>({
      query: ({ page = 1, pageSize = 24, q = '', genre = '', lang = '' }) => ({
        url: 'catalog/books',
        params: {
          page,
          pageSize,
          q: q || undefined,
          genre: genre || undefined,
          lang: lang || undefined,
        },
      }),
    }),
    getBook: builder.query<BookDetails, BookRef>({
      query: ({ provider, externalId }) => `catalog/books/${provider}/${externalId}`,
    }),
  }),
});

export const { useGetBooksQuery, useGetBookQuery } = catalogApi;
