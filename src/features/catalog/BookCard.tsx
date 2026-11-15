import { BookOpen, Plus } from 'lucide-react';
import { memo, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { apiErrorMessage } from '../../shared/api/errors';
import type { BookSummary } from '../../shared/api/types';
import { useStrings } from '../../shared/i18n/useStrings';
import { BookCover } from '../../shared/ui/BookCover/BookCover';
import { loginModalOpened, toastShown } from '../../shared/ui-state/uiSlice';
import { selectUser } from '../auth/authSlice';
import { useAddToLibraryMutation } from '../library/libraryApi';
import { coverUrl } from './coverUrl';
import './BookCard.scss';

type BookCardProps = {
  book: BookSummary;
  // Метка «можно читать». Нужна там, где в выдаче смешаны читаемые и нечитаемые книги
  // (поиск по всему Open Library); в коллекции читается всё, и метка была бы шумом.
  showReadable?: boolean;
};

// memo + стабильный key={externalId} у родителя: карточки не перерисовываются,
// когда меняется только состояние загрузки/наведения вокруг них.
export const BookCard = memo(function BookCard({ book, showReadable = false }: BookCardProps) {
  const { t } = useStrings();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [addToLibrary, { isLoading }] = useAddToLibraryMutation();

  const quickAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    // Кнопка живёт внутри Link — не даём клику провалиться в навигацию.
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      dispatch(toastShown(t.toastGuestAdd));
      dispatch(loginModalOpened());
      return;
    }

    try {
      await addToLibrary({ provider: book.provider, externalId: book.externalId }).unwrap();
      dispatch(toastShown(t.toastWant));
    } catch (failure) {
      dispatch(toastShown(apiErrorMessage(failure) ?? t.actionError));
    }
  };

  return (
    <Link className="book-card" to={`/books/${book.provider}/${book.externalId}`}>
      <div className="book-card__cover-box">
        <BookCover
          className="book-card__cover"
          title={book.title}
          author={book.author}
          src={coverUrl(book, 'M')}
          width={150}
          decorative
        />
        {showReadable && book.isReadable && (
          <span className="book-card__badge">
            <BookOpen size={12} strokeWidth={2.4} aria-hidden="true" />
            {t.readable}
          </span>
        )}
        <button
          type="button"
          className="book-card__add"
          title={t.addToLibrary}
          aria-label={t.addToLibrary}
          disabled={isLoading}
          onClick={quickAdd}
        >
          <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      {/* Название обрезается до двух строк — полное остаётся в подсказке. */}
      <h3 className="book-card__title" title={book.title}>
        {book.title}
      </h3>
      <p className="book-card__author">{book.author || t.unknownAuthor}</p>
    </Link>
  );
});
