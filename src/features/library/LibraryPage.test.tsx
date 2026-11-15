import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppSelector } from '../../app/hooks';
import type { LibraryBook, User } from '../../shared/api/types';
import { STRINGS } from '../../shared/i18n/strings';
import { loginModalOpened } from '../../shared/ui-state/uiSlice';
import { useGetLibraryStatsQuery, useGetShelfQuery, useUploadBookMutation } from './libraryApi';
import { LibraryPage } from './LibraryPage';

const t = STRINGS.ru;

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));

vi.mock('../../shared/i18n/useStrings', async () => {
  const strings = await vi.importActual<{ STRINGS: typeof STRINGS }>('../../shared/i18n/strings');
  return { useStrings: () => ({ t: strings.STRINGS.ru, lang: 'ru' }) };
});
vi.mock('../../app/hooks', () => ({ useAppSelector: vi.fn(), useAppDispatch: () => dispatch }));
vi.mock('./libraryApi', () => ({
  useGetShelfQuery: vi.fn(),
  useGetLibraryStatsQuery: vi.fn(),
  useUploadBookMutation: vi.fn(),
}));

const reader: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'reader@example.com',
  nickname: 'Reader',
  avatarUrl: null,
  favoriteGenres: [],
  uiLanguage: 'ru',
  emailConfirmed: true,
};

const book = (overrides: Partial<LibraryBook>): LibraryBook => ({
  bookId: '00000000-0000-0000-0000-0000000000aa',
  title: 'Emma',
  author: 'Jane Austen',
  coverId: null,
  provider: 'openlibrary',
  externalId: 'OL1W',
  hasReadableFile: false,
  status: 'want',
  isFavorite: false,
  progress: 0,
  cfiPosition: null,
  addedAtUtc: '2026-11-01T10:00:00Z',
  lastReadAtUtc: null,
  ...overrides,
});

type ShelfQuery = ReturnType<typeof useGetShelfQuery>;

const refetch = vi.fn();

const showShelf = (state: { currentData?: LibraryBook[]; isError?: boolean }) => {
  // Странице нужны только эти поля результата запроса; остальное в заглушку не входит.
  const result = { currentData: undefined, isError: false, refetch, ...state };
  vi.mocked(useGetShelfQuery).mockReturnValue(result as unknown as ShelfQuery);
};

const openLibrary = (user: User | null = reader) => {
  vi.mocked(useAppSelector).mockReturnValue(user);
  return render(
    <MemoryRouter initialEntries={['/library']}>
      <LibraryPage />
    </MemoryRouter>,
  );
};

describe('LibraryPage', () => {
  beforeEach(() => {
    dispatch.mockReset();
    refetch.mockReset();
    vi.mocked(useGetLibraryStatsQuery).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useGetLibraryStatsQuery>);
    vi.mocked(useUploadBookMutation).mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as unknown as ReturnType<typeof useUploadBookMutation>);
    showShelf({});
  });

  it('гостю предлагает войти', () => {
    openLibrary(null);

    expect(screen.getByText(t.toastGuestAdd)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.login }));
    expect(dispatch).toHaveBeenCalledWith(loginModalOpened());
  });

  it('пока полка грузится, показывает заглушки, а не «полка пуста»', () => {
    const { container } = openLibrary();

    expect(container.querySelector('.library__grid--skeleton')).toBeInTheDocument();
    expect(screen.queryByText(t.emptyShelf)).not.toBeInTheDocument();
    // Числа книг ещё нет — «0 книг» было бы неправдой.
    expect(container.querySelector('.library__count')).not.toBeInTheDocument();
  });

  it('при ошибке загрузки показывает сообщение с повтором, а не пустую полку', () => {
    showShelf({ isError: true });

    openLibrary();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(t.libraryError);
    expect(screen.queryByText(t.emptyShelf)).not.toBeInTheDocument();
    fireEvent.click(within(alert).getByRole('button', { name: t.retry }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('при ошибке обновления оставляет загруженные книги и говорит, что они прежние', () => {
    showShelf({ currentData: [book({})], isError: true });

    openLibrary();

    expect(screen.getByRole('alert')).toHaveTextContent(t.libraryStale);
    // Название стоит и на заглушке обложки, и в подписи — ищем подпись по её подсказке.
    expect(screen.getByTitle('Emma')).toBeInTheDocument();
  });

  it('пустую полку показывает только когда она действительно пуста', () => {
    showShelf({ currentData: [] });

    openLibrary();

    expect(screen.getByText(t.emptyShelf)).toBeInTheDocument();
    expect(screen.getByText('0 книг')).toBeInTheDocument();
  });

  it('склоняет число книг на полке', () => {
    showShelf({ currentData: [book({})] });

    openLibrary();

    expect(screen.getByText('1 книга')).toBeInTheDocument();
  });

  it('каталожную книгу ведёт на её страницу, а загруженный EPUB — сразу в читалку', () => {
    const uploaded = book({
      bookId: '00000000-0000-0000-0000-0000000000bb',
      title: 'My Upload',
      provider: null,
      externalId: null,
      hasReadableFile: true,
    });
    showShelf({ currentData: [book({}), uploaded] });

    openLibrary();

    expect(screen.getByRole('link', { name: /Emma/ })).toHaveAttribute(
      'href',
      '/books/openlibrary/OL1W',
    );
    expect(screen.getByRole('link', { name: /My Upload/ })).toHaveAttribute(
      'href',
      `/reader/${uploaded.bookId}`,
    );
  });

  it('книгу без страницы и без файла не делает ссылкой', () => {
    showShelf({
      currentData: [book({ title: 'Pending', provider: null, externalId: null })],
    });

    openLibrary();

    expect(screen.getByTitle('Pending')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Pending/ })).not.toBeInTheDocument();
  });
});
