import { Link } from 'react-router-dom';

import type { LibraryBook } from '../../shared/api/types';
import { useStrings } from '../../shared/i18n/useStrings';
import { BookCover } from '../../shared/ui/BookCover/BookCover';
import { coverUrl } from '../catalog/coverUrl';

type LibraryCardProps = { item: LibraryBook };

// Куда ведёт карточка. У каталожной книги есть страница описания. У загруженного своего EPUB
// её нет (файл не привязывается к общей каталожной записи) — такая книга открывается сразу
// в читалке. Книга без страницы и без файла никуда не ведёт.
const cardTarget = (item: LibraryBook): string | null => {
  if (item.provider && item.externalId) {
    return `/books/${item.provider}/${item.externalId}`;
  }
  return item.hasReadableFile ? `/reader/${item.bookId}` : null;
};

export function LibraryCard({ item }: LibraryCardProps) {
  const { t } = useStrings();
  const target = cardTarget(item);

  const card = (
    <>
      <BookCover
        title={item.title}
        author={item.author}
        src={coverUrl(item, 'M')}
        width={150}
        className="library__card-cover"
        decorative
      />
      <span className="library__card-title" title={item.title}>
        {item.title}
      </span>
      <span className="library__card-author">{item.author || t.unknownAuthor}</span>
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

  return target ? (
    <Link className="library__card" to={target}>
      {card}
    </Link>
  ) : (
    <div className="library__card">{card}</div>
  );
}
