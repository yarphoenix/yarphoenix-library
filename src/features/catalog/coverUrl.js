const COVERS = 'https://covers.openlibrary.org/b';

// size: 'S' | 'M' | 'L' — в сетке только 'M'/'S', 'L' — на странице книги.
// null → BookCover отрисует плейсхолдер (у части книг Open Library обложки нет).
export function coverUrl(book, size = 'M') {
  if (book.coverId) {
    return `${COVERS}/id/${book.coverId}-${size}.jpg`;
  }
  if (book.isbn) {
    return `${COVERS}/isbn/${book.isbn}-${size}.jpg`;
  }
  return null;
}
