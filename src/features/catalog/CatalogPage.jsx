import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import heroImage from '../../shared/assets/hero-library.jpg';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { BookCard } from './BookCard';
import { GENRES } from './genres';
import { Pagination } from './Pagination';
import { useBooksPage } from './useBooksPage';
import { useTypewriter } from './useTypewriter';
import './CatalogPage.scss';

const SEARCH_DEBOUNCE_MS = 400;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Фишер–Йейтс: перемешиваем подсказки, чтобы порядок не был предсказуемым.
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function CatalogPage() {
  const { t, lang } = useStrings();

  // Состояние каталога живёт в URL: страницы шарятся ссылкой, «назад» работает,
  // и на смену страницы реагируют только читатели query-строки.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    if (searchInput === q) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        if (searchInput) {
          prev.set('q', searchInput);
        } else {
          prev.delete('q');
        }
        prev.delete('page');
        return prev;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, q, setSearchParams]);

  const setPage = (next) => {
    setSearchParams((prev) => {
      prev.set('page', String(next));
      return prev;
    });
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const setGenre = (key) => {
    setSearchParams((prev) => {
      if (key) {
        prev.set('genre', key);
      } else {
        prev.delete('genre');
      }
      prev.delete('page');
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const { data, isFetching, isError } = useBooksPage({ page, q, genre, lang });

  const [searchFocused, setSearchFocused] = useState(false);
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  // Подсказки для печатающего плейсхолдера: статичные фразы + реальные книги из
  // текущей выдачи («Что насчёт "…"?» → по Tab подставляется в поиск).
  const bookTitles = useMemo(
    () =>
      (data?.items ?? [])
        .map((book) => book.title?.trim())
        .filter((title) => title && title.length <= 48),
    [data],
  );

  const phrases = useMemo(() => {
    const statics = t.searchHints.map((text) => ({ text, fill: null }));
    const books = bookTitles.slice(0, 6).map((title) => ({
      text: t.searchBookHint.replace('%s', title),
      fill: title,
    }));
    return shuffle([...statics, ...books]);
  }, [t, bookTitles]);

  const typewriterOn = searchInput === '' && !reduceMotion;
  const ghost = useTypewriter(phrases, typewriterOn);
  const showGhost = typewriterOn && ghost.text !== '';
  const canFillFromGhost = Boolean(searchFocused && searchInput === '' && ghost.phrase?.fill);

  const onSearchKeyDown = (event) => {
    // Tab подставляет предложенное название книги в строку поиска.
    if (event.key === 'Tab' && canFillFromGhost && ghost.text) {
      event.preventDefault();
      setSearchInput(ghost.phrase.fill);
    }
  };

  return (
    <section className="catalog">
      <div className="catalog__hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="catalog__hero-inner">
          <h1 className="catalog__hero-title">{t.heroTitle}</h1>
        </div>
      </div>

      <div className="catalog__content" id="catalog">
        <div className="catalog__search">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <div className="catalog__search-field">
            <input
              className="catalog__search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={onSearchKeyDown}
              placeholder={typewriterOn ? '' : t.search}
              type="search"
            />
            {showGhost && (
              <div
                className={`catalog__search-ghost ${
                  ghost.exiting ? 'catalog__search-ghost--exiting' : ''
                }`}
                aria-hidden="true"
              >
                <span className="catalog__search-ghost-text">{ghost.text}</span>
                {!searchFocused && <span className="catalog__search-caret" />}
              </div>
            )}
          </div>
          {canFillFromGhost && ghost.text && (
            <kbd className="catalog__search-tab">{t.searchTab}</kbd>
          )}
          {searchInput && (
            <button
              type="button"
              className="catalog__search-clear"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="catalog__genres">
          <button
            type="button"
            className={`catalog__genre ${genre === '' ? 'catalog__genre--active' : ''}`}
            onClick={() => setGenre('')}
          >
            {t.all}
          </button>
          {GENRES.map((g) => (
            <button
              key={g.key}
              type="button"
              className={`catalog__genre ${genre === g.key ? 'catalog__genre--active' : ''}`}
              onClick={() => setGenre(g.key)}
            >
              {g[lang]}
            </button>
          ))}
        </div>

        <div className="catalog__title-row">
          <h2 className="catalog__title">{t.catalogTitle}</h2>
          {data && (
            <span className="catalog__results">
              {data.total} {t.booksFound}
            </span>
          )}
        </div>

        {isError && !data && <p className="catalog__error">{t.catalogError}</p>}

        {!isError && !data && <CatalogSkeleton />}

        {data && data.items.length > 0 && (
          <>
            <div className={`catalog__grid ${isFetching ? 'catalog__grid--loading' : ''}`}>
              {data.items.map((book) => (
                <BookCard key={`${book.provider}:${book.externalId}`} book={book} />
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}

        {data && data.items.length === 0 && (
          <div className="catalog__empty">
            <p className="catalog__empty-text">{t.noResults}</p>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              {t.clearFilters}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Скелетон только для самого первого показа, когда в кэше ещё ничего нет.
function CatalogSkeleton() {
  return (
    <div className="catalog__grid catalog__grid--skeleton" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="catalog__skeleton-card">
          <div className="catalog__skeleton-cover" />
          <div className="catalog__skeleton-line" />
          <div className="catalog__skeleton-line catalog__skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}
