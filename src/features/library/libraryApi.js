import { baseApi } from '../../shared/api/baseApi';

const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShelf: builder.query({
      query: (shelf = 'all') => ({ url: 'library/books', params: { shelf } }),
      providesTags: ['Library'],
    }),
    // Состояние UserBook для страницы каталожной книги; 404 = не в библиотеке.
    lookupBook: builder.query({
      query: ({ provider, externalId }) => ({
        url: 'library/books/lookup',
        params: { provider, externalId },
      }),
      providesTags: ['Library'],
    }),
    getLibraryBook: builder.query({
      query: (bookId) => `library/books/${bookId}`,
      providesTags: ['Library'],
    }),
    uploadBook: builder.mutation({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: 'library/upload', method: 'POST', body: form };
      },
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    getLibraryStats: builder.query({
      query: () => ({ url: 'library/stats', params: { timeZoneId } }),
      providesTags: ['LibraryStats'],
    }),
    addToLibrary: builder.mutation({
      query: ({ provider, externalId }) => ({
        url: 'library/books',
        method: 'POST',
        body: { provider, externalId },
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    // «Читать» для PD-книги: сервер докачивает файл с Internet Archive в MinIO
    // и переводит книгу в Reading (ленивый ингест, ТЗ §5.1.2). Возвращает bookId.
    startReading: builder.mutation({
      query: ({ provider, externalId }) => ({
        url: 'library/books/read',
        method: 'POST',
        body: { provider, externalId },
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    updateShelf: builder.mutation({
      query: ({ bookId, ...patch }) => ({
        url: `library/books/${bookId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    removeFromLibrary: builder.mutation({
      query: (bookId) => ({ url: `library/books/${bookId}`, method: 'DELETE' }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    updateProgress: builder.mutation({
      query: ({ bookId, cfiPosition, progress }) => ({
        url: `library/books/${bookId}/progress`,
        method: 'PUT',
        body: { cfiPosition, progress, timeZoneId },
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
  }),
});

export const {
  useGetShelfQuery,
  useLookupBookQuery,
  useGetLibraryBookQuery,
  useUploadBookMutation,
  useGetLibraryStatsQuery,
  useAddToLibraryMutation,
  useStartReadingMutation,
  useUpdateShelfMutation,
  useRemoveFromLibraryMutation,
  useUpdateProgressMutation,
} = libraryApi;
