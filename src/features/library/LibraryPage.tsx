import {
  BookMarked,
  BookOpen,
  Bookmark,
  Check,
  Compass,
  Flame,
  Heart,
  Library as LibraryIcon,
  Upload,
} from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { apiErrorMessage } from '../../shared/api/errors';
import { countLabel } from '../../shared/i18n/plural';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { ErrorNotice } from '../../shared/ui/ErrorNotice/ErrorNotice';
import { loginModalOpened, toastShown } from '../../shared/ui-state/uiSlice';
import { selectUser } from '../auth/authSlice';
import { LibraryCard } from './LibraryCard';
import { useGetLibraryStatsQuery, useGetShelfQuery, useUploadBookMutation } from './libraryApi';
import './LibraryPage.scss';

const SHELVES = [
  { key: 'all', labelKey: 'shelfAll', statKey: 'total', Icon: LibraryIcon },
  { key: 'reading', labelKey: 'shelfReading', statKey: 'reading', Icon: BookOpen },
  { key: 'want', labelKey: 'shelfWant', statKey: 'wantToRead', Icon: Bookmark },
  { key: 'read', labelKey: 'shelfRead', statKey: 'read', Icon: Check },
  { key: 'favorites', labelKey: 'shelfFav', statKey: 'favorites', Icon: Heart },
] as const;

const ALL_SHELF = SHELVES[0];
const SKELETON_CARDS = 6;

export function LibraryPage() {
  const { t, lang } = useStrings();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Полка из адреса; незнакомое значение — «все книги».
  const requestedShelf = searchParams.get('shelf');
  const activeShelf = SHELVES.find((item) => item.key === requestedShelf) ?? ALL_SHELF;

  // currentData — книги именно этой полки. Обычное data при переключении ещё держит прошлую
  // полку, а после ошибки не отличает «не загрузилось» от «на полке пусто».
  const {
    currentData: books,
    isError,
    refetch,
  } = useGetShelfQuery(activeShelf.key, { skip: !user });
  const { data: stats } = useGetLibraryStatsQuery(undefined, { skip: !user });
  const [uploadBook, { isLoading: uploading }] = useUploadBookMutation();

  const onFilePicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      await uploadBook(file).unwrap();
      dispatch(toastShown(t.toastWant));
    } catch (failure) {
      dispatch(toastShown(apiErrorMessage(failure) ?? t.uploadError));
    }
  };

  if (!user) {
    return (
      <section className="library library--guest">
        <p className="library__guest">{t.toastGuestAdd}</p>
        <Button variant="primary" onClick={() => dispatch(loginModalOpened())}>
          {t.login}
        </Button>
      </section>
    );
  }

  return (
    <div className="library">
      <aside className="library__sidebar">
        <Link to="/" className="library__nav-item">
          <Compass size={17} strokeWidth={1.9} className="library__nav-icon" aria-hidden="true" />
          <span className="library__nav-label">{t.discover}</span>
        </Link>

        <div className="library__section-label">{t.libraryTitle}</div>
        {SHELVES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`library__nav-item ${
              item.key === activeShelf.key ? 'library__nav-item--active' : ''
            }`}
            aria-pressed={item.key === activeShelf.key}
            onClick={() => setSearchParams(item.key === 'all' ? {} : { shelf: item.key })}
          >
            <item.Icon
              size={17}
              strokeWidth={1.9}
              className="library__nav-icon"
              aria-hidden="true"
            />
            <span className="library__nav-label">{t[item.labelKey]}</span>
            <span className="library__nav-count">{stats?.[item.statKey] ?? ''}</span>
          </button>
        ))}

        {stats && (
          <div className="library__streak">
            <div className="library__section-label">{t.readingGoal}</div>
            <div className="library__streak-value">
              <Flame
                size={16}
                strokeWidth={2}
                className="library__streak-icon"
                aria-hidden="true"
              />
              {stats.currentStreak} · {t.streakBest} {stats.longestStreak}
            </div>
            {stats.achievements.length > 0 && (
              <div className="library__achievements">
                {stats.achievements.map((threshold) => (
                  <span key={threshold} className="library__badge">
                    <BookMarked size={12} strokeWidth={2.2} aria-hidden="true" />
                    {threshold}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      <main className="library__main">
        <div className="library__head">
          <h1 className="library__title">{t[activeShelf.labelKey]}</h1>
          {/* Пока полка не загрузилась, числа книг нет — «0 книг» было бы неправдой. */}
          {books && (
            <span className="library__count">{countLabel(lang, books.length, t.booksN)}</span>
          )}
          <span className="library__spacer" />
          <input ref={fileInputRef} type="file" accept=".epub" hidden onChange={onFilePicked} />
          <Button
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} strokeWidth={2} aria-hidden="true" />
            {t.uploadEpub}
          </Button>
        </div>

        {isError && (
          <ErrorNotice
            variant={books ? 'banner' : 'block'}
            className={books ? 'library__notice' : ''}
            message={books ? t.libraryStale : t.libraryError}
          >
            <Button variant="primary" size="sm" onClick={() => refetch()}>
              {t.retry}
            </Button>
          </ErrorNotice>
        )}

        {!books && !isError && (
          <div className="library__grid library__grid--skeleton" aria-hidden="true">
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <div key={index} className="library__skeleton-card">
                <div className="library__skeleton-cover" />
                <div className="library__skeleton-line" />
                <div className="library__skeleton-line library__skeleton-line--short" />
              </div>
            ))}
          </div>
        )}

        {books && books.length > 0 && (
          <div className="library__grid">
            {books.map((item) => (
              <LibraryCard key={item.bookId} item={item} />
            ))}
          </div>
        )}

        {books && books.length === 0 && !isError && (
          <div className="library__empty">
            <BookOpen
              size={40}
              strokeWidth={1.2}
              className="library__empty-icon"
              aria-hidden="true"
            />
            <p className="library__empty-text">{t.emptyShelf}</p>
            <Link to="/" className="library__empty-link">
              {t.browseCta}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
