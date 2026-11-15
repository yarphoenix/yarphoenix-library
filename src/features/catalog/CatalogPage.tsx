import { useMemo } from 'react';

import { apiErrorStatus } from '../../shared/api/errors';
import heroImage from '../../shared/assets/hero-library.jpg';
import { countLabel } from '../../shared/i18n/plural';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { ErrorNotice } from '../../shared/ui/ErrorNotice/ErrorNotice';
import { BookCard } from './BookCard';
import { CatalogSearch } from './CatalogSearch';
import { CatalogSkeleton } from './CatalogSkeleton';
import { GENRES } from './genres';
import { Pagination } from './Pagination';
import { ScopeSwitch } from './ScopeSwitch';
import { useBooksPage } from './useBooksPage';
import { useCatalogParams } from './useCatalogParams';
import './CatalogPage.scss';

// Более длинное название не помещается в подсказку строки поиска.
const MAX_SUGGESTION_LENGTH = 48;

export function CatalogPage() {
  const { t, lang } = useStrings();
  const { page, q, genre, scope, setPage, setQuery, setGenre, setScope, clearFilters } =
    useCatalogParams();

  // data — последняя удачная выдача. Пока грузится следующая страница, она остаётся на экране
  // (сетка не мигает); после ошибки это уже не ответ на текущий запрос, а прежние результаты —
  // и об этом надо сказать, а не молча показывать их дальше.
  const { data, error, isFetching, isError, refetch } = useBooksPage({ page, q, genre, scope });

  const searchingAll = scope === 'all';
  const stale = isError && Boolean(data);
  // 503 в живом поиске — бэкенд не достучался до Open Library. Коллекция от неё не зависит,
  // поэтому только в этом случае есть смысл предлагать вернуться к ней.
  const openLibraryDown = searchingAll && apiErrorStatus(error) === 503;

  const suggestions = useMemo(
    () =>
      (data?.items ?? [])
        .map((book) => book.title.trim())
        .filter((title) => title && title.length <= MAX_SUGGESTION_LENGTH),
    [data],
  );

  const goToPage = (next: number) => {
    setPage(next);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const errorMessage = openLibraryDown
    ? t.catalogErrorAll
    : stale
      ? t.catalogStale
      : t.catalogError;
  const errorActions = (
    <>
      <Button variant="primary" size="sm" onClick={() => refetch()}>
        {t.retry}
      </Button>
      {openLibraryDown && (
        <Button variant="secondary" size="sm" onClick={() => setScope('collection')}>
          {t.scopeReadable}
        </Button>
      )}
    </>
  );

  // В коллекции ничего не нашлось — возможно, книга есть в Open Library без текста.
  const canWidenSearch = !searchingAll && q !== '';

  return (
    <section className="catalog">
      <div className="catalog__hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="catalog__hero-inner">
          <h1 className="catalog__hero-title">{t.heroTitle}</h1>
        </div>
      </div>

      <div className="catalog__content" id="catalog">
        <div className="catalog__controls">
          <div className="catalog__search">
            <CatalogSearch query={q} onQueryChange={setQuery} suggestions={suggestions} />
          </div>
          <ScopeSwitch scope={scope} onChange={setScope} />
        </div>
        {searchingAll && <p className="catalog__scope-hint">{t.scopeAllHint}</p>}

        <div className="catalog__genres">
          <button
            type="button"
            className={`catalog__genre ${genre === '' ? 'catalog__genre--active' : ''}`}
            aria-pressed={genre === ''}
            onClick={() => setGenre('')}
          >
            {t.all}
          </button>
          {GENRES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`catalog__genre ${genre === item.key ? 'catalog__genre--active' : ''}`}
              aria-pressed={genre === item.key}
              onClick={() => setGenre(item.key)}
            >
              {item[lang]}
            </button>
          ))}
        </div>

        <div className="catalog__title-row">
          <h2 className="catalog__title">{t.catalogTitle}</h2>
          {/* Счётчик относится к показанной выдаче; у прежних результатов он был бы неправдой. */}
          {data && !isError && (
            <span className="catalog__results">{countLabel(lang, data.total, t.booksFound)}</span>
          )}
        </div>

        {isError && (
          <ErrorNotice
            variant={stale ? 'banner' : 'block'}
            className={stale ? 'catalog__notice' : ''}
            message={errorMessage}
          >
            {errorActions}
          </ErrorNotice>
        )}

        {!isError && !data && <CatalogSkeleton />}

        {data && data.items.length > 0 && (
          <>
            <div
              className={`catalog__grid ${isFetching ? 'catalog__grid--loading' : ''} ${
                stale ? 'catalog__grid--stale' : ''
              }`}
            >
              {data.items.map((book) => (
                <BookCard
                  key={`${book.provider}:${book.externalId}`}
                  book={book}
                  showReadable={searchingAll}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onChange={goToPage} />
          </>
        )}

        {data && data.items.length === 0 && !isError && (
          <div className="catalog__empty">
            <p className="catalog__empty-text">
              {canWidenSearch ? t.noResultsReadable : t.noResults}
            </p>
            <div className="catalog__empty-actions">
              {canWidenSearch && (
                <Button variant="primary" size="sm" onClick={() => setScope('all')}>
                  {t.searchAll}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                {t.clearFilters}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
