import { baseApi } from '../../shared/api/baseApi';
import type {
  BookRef,
  LibraryBook,
  LibraryStats,
  UpdateShelfRequest,
} from '../../shared/api/types';

const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

// PATCH полки частичный: передаём только то, что меняем (статус и/или «избранное»).
export type ShelfPatch = { bookId: string } & Partial<UpdateShelfRequest>;

export type ProgressUpdate = {
  bookId: string;
  cfiPosition: string;
  // Процент прочитанного, 0–100.
  progress: number;
};

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Без аргумента — вся библиотека ('all').
    getShelf: builder.query<LibraryBook[], string | void>({
      query: (shelf) => ({
        url: 'library/books',
        params: { shelf: typeof shelf === 'string' ? shelf : 'all' },
      }),
      providesTags: ['Library'],
    }),
    // Состояние UserBook для страницы каталожной книги; 404 = не в библиотеке.
    lookupBook: builder.query<LibraryBook, BookRef>({
      query: ({ provider, externalId }) => ({
        url: 'library/books/lookup',
        params: { provider, externalId },
      }),
      providesTags: ['Library'],
    }),
    getLibraryBook: builder.query<LibraryBook, string>({
      query: (bookId) => `library/books/${bookId}`,
      providesTags: ['Library'],
    }),
    uploadBook: builder.mutation<LibraryBook, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: 'library/upload', method: 'POST', body: form };
      },
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    getLibraryStats: builder.query<LibraryStats, void>({
      query: () => ({ url: 'library/stats', params: { timeZoneId } }),
      providesTags: ['LibraryStats'],
    }),
    addToLibrary: builder.mutation<LibraryBook, BookRef>({
      query: ({ provider, externalId }) => ({
        url: 'library/books',
        method: 'POST',
        body: { provider, externalId },
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    // «Читать» для книги коллекции: при первом обращении сервер скачивает её текст
    // (Standard Ebooks / Project Gutenberg) в MinIO и переводит книгу в Reading.
    startReading: builder.mutation<LibraryBook, BookRef>({
      query: ({ provider, externalId }) => ({
        url: 'library/books/read',
        method: 'POST',
        body: { provider, externalId },
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    updateShelf: builder.mutation<LibraryBook, ShelfPatch>({
      query: ({ bookId, ...patch }) => ({
        url: `library/books/${bookId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    removeFromLibrary: builder.mutation<void, string>({
      query: (bookId) => ({ url: `library/books/${bookId}`, method: 'DELETE' }),
      invalidatesTags: ['Library', 'LibraryStats'],
    }),
    updateProgress: builder.mutation<LibraryBook, ProgressUpdate>({
      query: ({ bookId, cfiPosition, progress }) => ({
        url: `library/books/${bookId}/progress`,
        method: 'PUT',
        body: { cfiPosition, progress, timeZoneId },
        // Позиция сохраняется и при закрытии вкладки — запрос должен пережить страницу.
        keepalive: true,
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
