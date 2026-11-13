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
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';

import { selectUser } from '../auth/authSlice';
import { coverUrl } from '../catalog/coverUrl';
import { useStrings } from '../../shared/i18n/useStrings';
import { BookCover } from '../../shared/ui/BookCover/BookCover';
import { Button } from '../../shared/ui/Button/Button';
import { toastShown } from '../../shared/ui-state/uiSlice';
import { useGetLibraryStatsQuery, useGetShelfQuery, useUploadBookMutation } from './libraryApi';
import './LibraryPage.scss';

const SHELVES = [
  { key: 'all', labelKey: 'shelfAll', statKey: 'total', Icon: LibraryIcon },
  { key: 'reading', labelKey: 'shelfReading', statKey: 'reading', Icon: BookOpen },
  { key: 'want', labelKey: 'shelfWant', statKey: 'wantToRead', Icon: Bookmark },
  { key: 'read', labelKey: 'shelfRead', statKey: 'read', Icon: Check },
  { key: 'favorites', labelKey: 'shelfFav', statKey: 'favorites', Icon: Heart },
];

export function LibraryPage() {
  const { t } = useStrings();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const shelf = searchParams.get('shelf') ?? 'all';
  const fileInputRef = useRef(null);

  const { data: books } = useGetShelfQuery(shelf, { skip: !user });
  const { data: stats } = useGetLibraryStatsQuery(undefined, { skip: !user });
  const [uploadBook, { isLoading: uploading }] = useUploadBookMutation();

  const onFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      await uploadBook(file).unwrap();
      dispatch(toastShown(t.toastWant));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  if (!user) {
    return (
      <section className="library">
        <p className="library__guest">{t.toastGuestAdd}</p>
      </section>
    );
  }

  const activeShelf = SHELVES.find((s) => s.key === shelf) ?? SHELVES[0];

  return (
    <div className="library">
      <aside className="library__sidebar">
        <Link to="/" className="library__nav-item">
          <Compass size={17} strokeWidth={1.9} className="library__nav-icon" />
          <span className="library__nav-label">{t.discover}</span>
        </Link>

        <div className="library__section-label">{t.libraryTitle}</div>
        {SHELVES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`library__nav-item ${item.key === shelf ? 'library__nav-item--active' : ''}`}
            onClick={() => setSearchParams(item.key === 'all' ? {} : { shelf: item.key })}
          >
            <item.Icon size={17} strokeWidth={1.9} className="library__nav-icon" />
            <span className="library__nav-label">{t[item.labelKey]}</span>
            <span className="library__nav-count">{stats?.[item.statKey] ?? ''}</span>
          </button>
        ))}

        {stats && (
          <div className="library__streak">
            <div className="library__section-label">{t.readingGoal}</div>
            <div className="library__streak-value">
              <Flame size={16} strokeWidth={2} className="library__streak-icon" />
              {stats.currentStreak} · max {stats.longestStreak}
            </div>
            {stats.achievements.length > 0 && (
              <div className="library__achievements">
                {stats.achievements.map((threshold) => (
                  <span key={threshold} className="library__badge">
                    <BookMarked size={12} strokeWidth={2.2} />
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
          <span className="library__count">
            {books?.length ?? 0} {t.booksN}
          </span>
          <span className="library__spacer" />
          <input ref={fileInputRef} type="file" accept=".epub" hidden onChange={onFilePicked} />
          <Button
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} strokeWidth={2} />
            {t.uploadEpub}
          </Button>
        </div>

        {books && books.length > 0 ? (
          <div className="library__grid">
            {books.map((item) => (
              <LibraryCard key={item.bookId} item={item} />
            ))}
          </div>
        ) : (
          <div className="library__empty">
            <BookOpen size={40} strokeWidth={1.2} className="library__empty-icon" />
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

function LibraryCard({ item }) {
  const card = (
    <>
      <BookCover
        title={item.title}
        src={coverUrl({ coverId: item.coverId }, 'M')}
        width={150}
        className="library__card-cover"
      />
      <span className="library__card-title">{item.title}</span>
      <span className="library__card-author">{item.author}</span>
      {item.status === 'reading' && (
        <span className="library__card-progress">
          <span className="library__card-progress-bar">
            <span className="library__card-progress-fill" style={{ width: `${item.progress}%` }} />
          </span>
          <span className="library__card-progress-value">{Math.round(item.progress)}%</span>
        </span>
      )}
    </>
  );

  // У каталожных книг есть страница описания; загруженный без метаданных — пока нет.
  return item.provider && item.externalId ? (
    <Link className="library__card" to={`/books/${item.provider}/${item.externalId}`}>
      {card}
    </Link>
  ) : (
    <div className="library__card">{card}</div>
  );
}
