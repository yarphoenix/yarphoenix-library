import { skipToken } from '@reduxjs/toolkit/query';
import { ChevronLeft, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { apiErrorMessage, apiErrorStatus } from '../../shared/api/errors';
import { useStrings } from '../../shared/i18n/useStrings';
import { BookCover } from '../../shared/ui/BookCover/BookCover';
import { Button } from '../../shared/ui/Button/Button';
import { loginModalOpened, toastShown } from '../../shared/ui-state/uiSlice';
import { selectUser } from '../auth/authSlice';
import { BookCard } from '../catalog/BookCard';
import { useGetBookQuery, useGetBooksQuery } from '../catalog/catalogApi';
import { coverUrl } from '../catalog/coverUrl';
import {
  useAddToLibraryMutation,
  useLookupBookQuery,
  useRemoveFromLibraryMutation,
  useStartReadingMutation,
  useUpdateShelfMutation,
} from '../library/libraryApi';
import './BookPage.scss';

const SIMILAR_LIMIT = 6;

export function BookPage() {
  const { provider, externalId } = useParams<{ provider: string; externalId: string }>();
  const { t } = useStrings();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // Каталожная запись адресуется парой (provider, externalId) — ТЗ §4.1.
  const bookRef = provider && externalId ? { provider, externalId } : null;

  // Везде берём currentData — данные именно этой книги. Обычное data при переходе на другую
  // книгу ещё держит прошлую, и страница показывала бы чужие название и полку.
  const {
    currentData: book,
    error,
    isFetching,
    isError,
    refetch,
  } = useGetBookQuery(bookRef ?? skipToken);
  const lookup = useLookupBookQuery(bookRef && user ? bookRef : skipToken);
  // 404 здесь — нормальный ответ «книги нет в библиотеке». RTK Query при ошибке оставляет
  // прошлые данные, поэтому после удаления с полки смотрим на isError, а не только на данные.
  const userBook = user && !lookup.isError ? lookup.currentData : undefined;

  // Похожие книги — тем же каталожным запросом по автору; текущую исключаем (§9.2, мелочи).
  const { currentData: similar } = useGetBooksQuery(
    book?.author ? { q: book.author, pageSize: SIMILAR_LIMIT + 1 } : skipToken,
  );
  const similarBooks = (similar?.items ?? [])
    .filter((item) => item.externalId !== externalId)
    .slice(0, SIMILAR_LIMIT);

  const [addToLibrary, { isLoading: adding }] = useAddToLibraryMutation();
  const [removeFromLibrary, { isLoading: removing }] = useRemoveFromLibraryMutation();
  const [startReading, { isLoading: preparing }] = useStartReadingMutation();
  const [updateShelf] = useUpdateShelfMutation();

  const inLibrary = Boolean(userBook);
  const isFavorite = userBook?.isFavorite ?? false;
  const isReading = userBook?.status === 'reading';
  // «Читать» доступно, когда файл уже есть у пользователя (свой аплоад/золотой случай)
  // ИЛИ книга в общественном достоянии — тогда файл подтянется по клику.
  const canRead = Boolean(userBook?.hasReadableFile) || Boolean(book?.isPublicDomain);

  // С прямой ссылки возвращаться некуда — ведём в каталог; иначе туда, откуда пришли
  // (с сохранением страницы, поиска и жанра).
  const goBack = () => {
    if (location.key === 'default') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const requireLogin = () => {
    dispatch(toastShown(t.toastGuestAdd));
    dispatch(loginModalOpened());
  };

  const reportFailure = (failure: unknown, fallback: string) => {
    dispatch(toastShown(apiErrorMessage(failure) ?? fallback));
  };

  const toggleLibrary = async () => {
    if (!bookRef) {
      return;
    }
    if (!user) {
      requireLogin();
      return;
    }
    try {
      if (userBook) {
        await removeFromLibrary(userBook.bookId).unwrap();
        dispatch(toastShown(t.toastRemoved));
      } else {
        await addToLibrary(bookRef).unwrap();
        dispatch(toastShown(t.toastWant));
      }
    } catch (failure) {
      reportFailure(failure, t.actionError);
    }
  };

  const openReader = async () => {
    if (!bookRef) {
      return;
    }
    if (!user) {
      requireLogin();
      return;
    }
    // Файл уже есть — открываем сразу; иначе просим сервер подготовить текст книги.
    if (userBook?.hasReadableFile) {
      navigate(`/reader/${userBook.bookId}`);
      return;
    }
    try {
      const prepared = await startReading(bookRef).unwrap();
      navigate(`/reader/${prepared.bookId}`);
    } catch (failure) {
      reportFailure(failure, t.bookError);
    }
  };

  const toggleFavorite = async () => {
    if (!bookRef) {
      return;
    }
    if (!user) {
      requireLogin();
      return;
    }
    try {
      // Избранное подразумевает членство в библиотеке — сначала добавляем.
      const bookId = userBook?.bookId ?? (await addToLibrary(bookRef).unwrap()).bookId;
      await updateShelf({ bookId, isFavorite: !isFavorite }).unwrap();
      dispatch(toastShown(isFavorite ? t.toastUnfav : t.toastFav));
    } catch (failure) {
      reportFailure(failure, t.actionError);
    }
  };

  if (!bookRef || (isError && apiErrorStatus(error) === 404)) {
    return (
      <div className="book-page">
        <p className="book-page__error">{t.bookNotFound}</p>
        <div className="book-page__error-actions">
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t.back}
          </Button>
        </div>
      </div>
    );
  }

  // isLoading из RTK Query здесь не годится: после ошибки или смены книги он остаётся false,
  // хотя данных ещё нет, — поэтому смотрим на сам факт запроса.
  if (!book && isFetching) {
    return (
      <div className="book-page" aria-busy="true">
        <div className="book-page__main">
          <div className="book-page__skeleton book-page__skeleton--cover" />
          <div className="book-page__info">
            <div className="book-page__skeleton book-page__skeleton--title" />
            <div className="book-page__skeleton book-page__skeleton--line" />
            <div className="book-page__skeleton book-page__skeleton--line" />
            <div className="book-page__skeleton book-page__skeleton--button" />
          </div>
        </div>
      </div>
    );
  }

  // Книга уже показана — оставляем её, даже если фоновое обновление не удалось.
  if (!book) {
    return (
      <div className="book-page">
        <p className="book-page__error">{t.bookError}</p>
        <div className="book-page__error-actions">
          <Button variant="primary" onClick={() => refetch()}>
            {t.retry}
          </Button>
          <Button variant="secondary" onClick={goBack}>
            {t.back}
          </Button>
        </div>
      </div>
    );
  }

  // Описание приходит одним текстом. Абзацы в нём разделены то пустой строкой, то одним
  // переводом строки — считаем абзацем каждую непустую строку.
  const paragraphs = (book.description ?? '')
    .split(/\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="book-page">
      <button type="button" className="book-page__back" onClick={goBack}>
        <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        {t.back}
      </button>

      <div className="book-page__main">
        <BookCover title={book.title} src={coverUrl(book, 'L')} width={200} />

        <div className="book-page__info">
          <h1 className="book-page__title">{book.title}</h1>
          {book.author && <p className="book-page__author">{book.author}</p>}

          <div className="book-page__badges">
            {book.firstPublishYear && (
              <span className="book-page__badge">{book.firstPublishYear}</span>
            )}
            {book.isPublicDomain && (
              <span className="book-page__badge book-page__badge--pd">{t.publicDomain}</span>
            )}
          </div>

          {userBook && isReading && (
            <div className="book-page__progress">
              <div className="book-page__progress-bar">
                <div
                  className="book-page__progress-fill"
                  style={{ width: `${userBook.progress}%` }}
                />
              </div>
              <span className="book-page__progress-value">{Math.round(userBook.progress)}%</span>
            </div>
          )}

          <div className="book-page__actions">
            {canRead && (
              <Button variant="primary" onClick={openReader} disabled={preparing}>
                {preparing ? t.preparingBook : isReading ? t.continueReading : t.read}
              </Button>
            )}
            <Button variant="secondary" onClick={toggleLibrary} disabled={adding || removing}>
              {inLibrary ? t.inLibrary : t.addToLibrary}
            </Button>
            <button
              type="button"
              className={`book-page__fav ${isFavorite ? 'book-page__fav--active' : ''}`}
              title={t.favorite}
              aria-label={t.favorite}
              aria-pressed={isFavorite}
              onClick={toggleFavorite}
            >
              <Heart
                size={19}
                strokeWidth={1.9}
                fill={isFavorite ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          </div>

          {preparing && (
            <p className="book-page__note" role="status">
              {t.preparingHint}
            </p>
          )}

          {/* Каталог — витрина метаданных: читать можно только книги с файлом (ТЗ §1.1). */}
          {!canRead && (
            <p className="book-page__note">
              {t.bookNoText}{' '}
              <Link className="book-page__note-link" to="/library">
                {t.bookNoTextAction}
              </Link>
            </p>
          )}
        </div>
      </div>

      {(paragraphs.length > 0 || book.subjects.length > 0) && (
        <div className="book-page__about">
          <h2 className="book-page__about-title">{t.about}</h2>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="book-page__description">
              {paragraph}
            </p>
          ))}
          {book.subjects.length > 0 && (
            <ul className="book-page__subjects" aria-label={t.subjects}>
              {book.subjects.map((subject) => (
                <li key={subject} className="book-page__subject">
                  {subject}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {similarBooks.length > 0 && (
        <div className="book-page__similar">
          <h2 className="book-page__about-title">{t.similar}</h2>
          <div className="book-page__similar-grid">
            {similarBooks.map((item) => (
              <BookCard key={`${item.provider}:${item.externalId}`} book={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
