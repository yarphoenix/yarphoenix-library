// Жанровые фильтры каталога. key уходит на бэкенд (там мапится в subject Open Library).
export const GENRES = [
  { key: 'scifi', en: 'Science Fiction', ru: 'Научная фантастика' },
  { key: 'fantasy', en: 'Fantasy', ru: 'Фэнтези' },
  { key: 'fiction', en: 'Fiction', ru: 'Современная проза' },
  { key: 'classic', en: 'Classics', ru: 'Классика' },
  { key: 'thriller', en: 'Thriller', ru: 'Триллер' },
  { key: 'mystery', en: 'Mystery', ru: 'Детектив' },
  { key: 'mythology', en: 'Mythology', ru: 'Мифология' },
  { key: 'history', en: 'History', ru: 'История' },
  { key: 'memoir', en: 'Memoir', ru: 'Мемуары' },
  { key: 'selfdev', en: 'Self-development', ru: 'Саморазвитие' },
  { key: 'romance', en: 'Romance', ru: 'Роман' },
];

export const genreLabel = (key, lang) => {
  const genre = GENRES.find((g) => g.key === key);
  return genre ? genre[lang] : key;
};
