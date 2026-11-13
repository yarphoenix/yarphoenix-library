import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { selectUser } from '../auth/authSlice';
import { BookCard } from '../catalog/BookCard';
import { coverUrl } from '../catalog/coverUrl';
import { useGetBookQuery, useGetBooksQuery } from '../catalog/catalogApi';
import { genreLabel } from '../catalog/genres';
import {
  useAddToLibraryMutation,
  useLookupBookQuery,
  useRemoveFromLibraryMutation,
  useStartReadingMutation,
  useUpdateShelfMutation,
} from '../library/libraryApi';
import { useStrings } from '../../shared/i18n/useStrings';
import { BookCover } from '../../shared/ui/BookCover/BookCover';
import { Button } from '../../shared/ui/Button/Button';
import { loginModalOpened, toastShown } from '../../shared/ui-state/uiSlice';
import './BookPage.scss';

export function BookPage() {
  const { provider, externalId } = useParams();
  const { t, lang } = useStrings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const { data: book, isLoading, isError } = useGetBookQuery({ provider, externalId });
  const { data: userBook } = useLookupBookQuery({ provider, externalId }, { skip: !user });
  // Похожие книги — тем же каталожным запросом по автору; исключаем текущую (§9.2, мелочи).
  const { data: similar } = useGetBooksQuery(
    { q: book?.author, pageSize: 7 },
    { skip: !book?.author },
  );
  const similarBooks = (similar?.items ?? [])
    .filter((item) => item.externalId !== externalId)
    .slice(0, 6);

  const [addToLibrary, { isLoading: adding }] = useAddToLibraryMutation();
  const [removeFromLibrary, { isLoading: removing }] = useRemoveFromLibraryMutation();
  const [startReading, { isLoading: preparing }] = useStartReadingMutation();
  const [updateShelf] = useUpdateShelfMutation();

  const inLibrary = Boolean(userBook);
  const isFavorite = userBook?.isFavorite ?? false;
  // «Читать» доступно, когда файл уже есть у пользователя (свой аплоад/золотой
  // случай) ИЛИ книга — PD с Internet Archive (файл подтянется по клику).
  const canRead = Boolean(userBook?.hasReadableFile) || Boolean(book?.isPublicDomain);

  const requireLogin = () => {
    dispatch(toastShown(t.toastGuestAdd));
    dispatch(loginModalOpened());
  };

  const toggleLibrary = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    try {
      if (inLibrary) {
        await removeFromLibrary(userBook.bookId).unwrap();
        dispatch(toastShown(t.toastRemoved));
      } else {
        await addToLibrary({ provider, externalId }).unwrap();
        dispatch(toastShown(t.toastWant));
      }
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const openReader = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    // Файл уже есть — открываем сразу; иначе просим сервер докачать PD-файл.
    if (userBook?.hasReadableFile) {
      navigate(`/reader/${userBook.bookId}`);
      return;
    }
    try {
      const result = await startReading({ provider, externalId }).unwrap();
      navigate(`/reader/${result.bookId}`);
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.bookError));
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    try {
      // Избранное подразумевает членство в библиотеке — сначала добавляем.
      const bookId =
        userBook?.bookId ?? (await addToLibrary({ provider, externalId }).unwrap()).bookId;
      await updateShelf({ bookId, isFavorite: !isFavorite }).unwrap();
      dispatch(toastShown(isFavorite ? t.toastUnfav : t.toastFav));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  if (isLoading) {
    return <div className="book-page book-page--pending" aria-busy="true" />;
  }

  if (isError || !book) {
    return (
      <div className="book-page">
        <p className="book-page__error">{t.bookError}</p>
      </div>
    );
  }

  return (
    <div className="book-page">
      <button type="button" className="book-page__back" onClick={() => navigate("/")}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {t.back}
      </button>

      <div className="book-page__main">
        <BookCover title={book.title} src={coverUrl(book, 'L')} width={200} />

        <div className="book-page__info">
          <h1 className="book-page__title">{book.title}</h1>
          <p className="book-page__author">{book.author}</p>

          <div className="book-page__badges">
            {book.genre && <span className="book-page__badge">{genreLabel(book.genre, lang)}</span>}
            {book.firstPublishYear && (
              <span className="book-page__badge">{book.firstPublishYear}</span>
            )}
            {book.pages && (
              <span className="book-page__badge">
                {book.pages} {t.pagesShort}
              </span>
            )}
            {book.isPublicDomain && (
              <span className="book-page__badge book-page__badge--pd">{t.publicDomain}</span>
            )}
          </div>

          {userBook?.status === 'reading' && (
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
                {preparing
                  ? t.preparingBook
                  : userBook?.status === 'reading'
                    ? t.continueReading
                    : t.read}
              </Button>
            )}
            <Button variant="secondary" onClick={toggleLibrary} disabled={adding || removing}>
              {inLibrary ? t.inLibrary : t.addToLibrary}
            </Button>
            <button
              type="button"
              className={`book-page__fav ${isFavorite ? 'book-page__fav--active' : ''}`}
              title={t.favorite}
              onClick={toggleFavorite}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {book.description && (
        <div className="book-page__about">
          <h2 className="book-page__about-title">{t.about}</h2>
          <p className="book-page__description">{book.description}</p>
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
