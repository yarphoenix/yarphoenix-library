import { useState } from 'react';

import './BookCover.scss';

const PLACEHOLDER_COLORS = ['#fdc48f', '#ddd5c6', '#ffe1c2', '#ece7dd', '#a8a39a', '#f0b98a'];

const colorFromTitle = (title = '') => {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) % 997;
  }
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
};

// Обложка книги с фиксированными размерами (нет layout shift) и плейсхолдером
// для книг без обложки — в Open Library их заметная доля.
export function BookCover({ title, src, width = 150, className = '' }) {
  const [failed, setFailed] = useState(false);
  const height = Math.round(width * 1.5);

  if (!src || failed) {
    return (
      <div
        className={`book-cover book-cover--placeholder ${className}`}
        style={{ width, height, background: colorFromTitle(title) }}
        role="img"
        aria-label={title}
      >
        <span className="book-cover__letter">{(title || '?').trim().charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className={`book-cover ${className}`}
      src={src}
      alt={title}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
