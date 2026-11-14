import { LoaderCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { apiErrorStatus } from '../../shared/api/errors';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { loginModalOpened } from '../../shared/ui-state/uiSlice';
import { selectUser } from '../auth/authSlice';
import { useGetLibraryBookQuery } from '../library/libraryApi';
import { ReaderNotice } from './ReaderNotice';
import { ReaderView } from './ReaderView';
import './ReaderPage.scss';

// Маршрут читалки. Решает, что показать: саму читалку или понятное объяснение, почему
// читать сейчас нельзя (гость, книги нет в библиотеке, нет файла, сбой загрузки).
export function ReaderPage() {
  const { bookId = '' } = useParams<{ bookId: string }>();
  const { t } = useStrings();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // Книга личной библиотеки — только для вошедших (ТЗ §4.4). currentData — запись именно
  // этого bookId: при смене адреса прошлую книгу не показываем.
  const {
    currentData: book,
    error,
    isError,
    refetch,
  } = useGetLibraryBookQuery(bookId, { skip: !user || !bookId });

  const toLibrary = () => navigate('/library');

  if (!user) {
    return (
      <ReaderNotice title={t.readerGuestTitle} text={t.readerGuestText}>
        <Button variant="primary" onClick={() => dispatch(loginModalOpened())}>
          {t.login}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t.back}
        </Button>
      </ReaderNotice>
    );
  }

  // Книга уже загружена — показываем её, даже если фоновое обновление записи не удалось:
  // сбой рефетча после сохранения прогресса не должен закрывать читалку.
  if (book) {
    if (!book.hasReadableFile) {
      return (
        <ReaderNotice title={t.readerNoFileTitle} text={t.readerNoFileText}>
          <Button variant="primary" onClick={toLibrary}>
            {t.toLibrary}
          </Button>
        </ReaderNotice>
      );
    }
    return <ReaderView key={book.bookId} book={book} />;
  }

  if (!bookId || (isError && apiErrorStatus(error) === 404)) {
    return (
      <ReaderNotice title={t.readerNotFoundTitle} text={t.readerNotFoundText}>
        <Button variant="primary" onClick={toLibrary}>
          {t.toLibrary}
        </Button>
      </ReaderNotice>
    );
  }

  if (isError) {
    return (
      <ReaderNotice title={t.readerErrorTitle} text={t.bookError}>
        <Button variant="primary" onClick={() => refetch()}>
          {t.retry}
        </Button>
        <Button variant="secondary" onClick={toLibrary}>
          {t.toLibrary}
        </Button>
      </ReaderNotice>
    );
  }

  return (
    <div className="reader reader--notice">
      <div className="reader__status" role="status">
        <LoaderCircle className="reader__spinner" size={22} aria-hidden="true" />
        {t.preparingBook}
      </div>
    </div>
  );
}
