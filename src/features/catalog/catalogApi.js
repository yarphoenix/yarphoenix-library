import { baseApi } from '../../shared/api/baseApi';

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Кэш ключуется аргументом целиком: каждая страница поиска — отдельная запись,
    // повторный визит отдаётся мгновенно без рефетча.
    getBooks: builder.query({
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
    getBook: builder.query({
      query: ({ provider, externalId }) => `catalog/books/${provider}/${externalId}`,
    }),
  }),
});

export const { useGetBooksQuery, useGetBookQuery } = catalogApi;
