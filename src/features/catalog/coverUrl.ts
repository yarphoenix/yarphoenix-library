const COVERS = 'https://covers.openlibrary.org/b';

// В сетке — 'M', на странице книги — 'L'.
export type CoverSize = 'S' | 'M' | 'L';

/**
 * Адрес обложки Open Library; null — обложки нет, BookCover нарисует типографскую заглушку.
 *
 * `default=false` обязателен: без него на отсутствующую обложку сервер отвечает пустой
 * картинкой 1×1 с кодом 200, `onError` не срабатывает и на месте обложки остаётся пустой
 * прямоугольник. С параметром приходит 404.
 */
export function coverUrl(book: { coverId?: number | null }, size: CoverSize = 'M'): string | null {
  const { coverId } = book;
  return coverId && coverId > 0 ? `${COVERS}/id/${coverId}-${size}.jpg?default=false` : null;
}
