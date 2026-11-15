import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BookList, BookSummary } from '../../shared/api/types';
import { STRINGS } from '../../shared/i18n/strings';
import { CatalogPage } from './CatalogPage';
import { useBooksPage } from './useBooksPage';

const t = STRINGS.ru;

vi.mock('../../shared/i18n/useStrings', async () => {
  const strings = await vi.importActual<{ STRINGS: typeof STRINGS }>('../../shared/i18n/strings');
  return { useStrings: () => ({ t: strings.STRINGS.ru, lang: 'ru' }) };
});
vi.mock('./useBooksPage', () => ({ useBooksPage: vi.fn() }));
// Карточка и строка поиска живут своей жизнью (store, таймеры) — здесь проверяется страница.
vi.mock('./BookCard', () => ({
  BookCard: ({ book, showReadable }: { book: BookSummary; showReadable?: boolean }) => (
    <div data-testid="book" data-show-readable={String(Boolean(showReadable))}>
      {book.title}
    </div>
  ),
}));
vi.mock('./CatalogSearch', () => ({ CatalogSearch: () => null }));

const emma: BookSummary = {
  provider: 'openlibrary',
  externalId: 'OL1W',
  title: 'Emma',
  author: 'Jane Austen',
  coverId: 1,
  firstPublishYear: 1815,
  isReadable: true,
};

const pageOf = (items: BookSummary[], total = items.length): BookList => ({
  items,
  page: 1,
  pageSize: 24,
  total,
  totalPages: 1,
});

type BooksPage = ReturnType<typeof useBooksPage>;

const refetch = vi.fn();

type CatalogState = {
  data?: BookList;
  // Ошибка запроса в том виде, как её отдаёт RTK Query: статус ответа сервера.
  error?: { status: number };
  isFetching?: boolean;
  isError?: boolean;
};

const showCatalog = (state: CatalogState) => {
  // Странице нужны только эти поля результата запроса; остальное в заглушку не входит.
  const result = { data: undefined, isFetching: false, isError: false, refetch, ...state };
  vi.mocked(useBooksPage).mockReturnValue(result as unknown as BooksPage);
};

const openCatalog = (url = '/') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <CatalogPage />
    </MemoryRouter>,
  );

const lastQuery = () => vi.mocked(useBooksPage).mock.lastCall?.[0];

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.mocked(useBooksPage).mockReset();
    refetch.mockReset();
  });

  it('запрашивает книги, которые можно читать, и не отправляет язык интерфейса', () => {
    showCatalog({ data: pageOf([emma]) });

    openCatalog();

    expect(lastQuery()).toEqual({ page: 1, q: '', genre: '', scope: 'collection' });
  });

  it('склоняет счётчик найденных книг', () => {
    showCatalog({ data: pageOf([emma], 2) });

    openCatalog();

    expect(screen.getByText('2 книги найдено')).toBeInTheDocument();
  });

  it('переключает поиск на весь Open Library и включает метки «можно читать»', () => {
    showCatalog({ data: pageOf([emma]) });
    openCatalog('/?page=3');
    expect(screen.getByTestId('book')).toHaveAttribute('data-show-readable', 'false');

    fireEvent.click(screen.getByRole('button', { name: t.scopeAll }));

    expect(lastQuery()).toMatchObject({ scope: 'all', page: 1 });
    expect(screen.getByTestId('book')).toHaveAttribute('data-show-readable', 'true');
    expect(screen.getByText(t.scopeAllHint)).toBeInTheDocument();
  });

  it('при ошибке без данных показывает сообщение с повтором вместо пустой страницы', () => {
    showCatalog({ isError: true });

    openCatalog();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(t.catalogError);
    fireEvent.click(within(alert).getByRole('button', { name: t.retry }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('при ошибке поверх прежней выдачи говорит об этом и не выдаёт её за ответ', () => {
    showCatalog({ data: pageOf([emma]), isError: true });

    const { container } = openCatalog('/?q=dickens');

    expect(screen.getByRole('alert')).toHaveTextContent(t.catalogStale);
    expect(screen.getByTestId('book')).toHaveTextContent('Emma');
    expect(container.querySelector('.catalog__grid')).toHaveClass('catalog__grid--stale');
    // Число найденного относилось к прежнему запросу.
    expect(screen.queryByText(/найден/)).not.toBeInTheDocument();
  });

  it('при сбое Open Library предлагает вернуться к книгам, которые можно читать', () => {
    showCatalog({ isError: true, error: { status: 503 } });
    openCatalog('/?scope=all');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(t.catalogErrorAll);
    fireEvent.click(within(alert).getByRole('button', { name: t.scopeReadable }));

    expect(lastQuery()).toMatchObject({ scope: 'collection' });
  });

  it('не винит Open Library, когда не отвечает сам сервер', () => {
    showCatalog({ isError: true, error: { status: 500 } });
    openCatalog('/?scope=all');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(t.catalogError);
    expect(within(alert).queryByRole('button', { name: t.scopeReadable })).not.toBeInTheDocument();
  });

  it('если в коллекции ничего не нашлось, предлагает искать во всём Open Library', () => {
    showCatalog({ data: pageOf([]) });
    openCatalog('/?q=tolstoy');

    expect(screen.getByText(t.noResultsReadable)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.searchAll }));

    expect(lastQuery()).toMatchObject({ q: 'tolstoy', scope: 'all' });
  });

  it('пока первая выдача грузится, показывает заглушки, а не «ничего не найдено»', () => {
    showCatalog({ isFetching: true });

    const { container } = openCatalog();

    expect(container.querySelector('.catalog__grid--skeleton')).toBeInTheDocument();
    expect(screen.queryByText(t.noResults)).not.toBeInTheDocument();
  });
});
