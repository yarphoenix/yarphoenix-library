import { useState } from 'react';

import './BookCover.scss';

// Число оттенков «переплёта» — модификаторы book-cover--tone-N в BookCover.scss.
const TONE_COUNT = 5;

// Оттенок выбирается по названию: у одной книги заглушка всегда одного цвета.
const toneOf = (title: string): number => {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) % 997;
  }
  return (hash % TONE_COUNT) + 1;
};

type BookCoverProps = {
  title: string;
  author?: string | null;
  // null — обложки нет, сразу рисуем заглушку.
  src: string | null;
  width?: number;
  className?: string;
  // Рядом уже стоит название текстом (карточка в сетке) — обложка его не дублирует
  // для экранной читалки.
  decorative?: boolean;
};

// Обложка книги с фиксированными размерами (нет layout shift). Когда картинки нет или она
// не загрузилась, вместо неё — типографская заглушка с названием и автором.
export function BookCover({
  title,
  author,
  src,
  width = 150,
  className = '',
  decorative = false,
}: BookCoverProps) {
  // Запоминаем адрес, который не загрузился, а не сам факт сбоя: компонент остаётся на месте,
  // когда на странице меняется книга, и у новой обложки должна быть своя попытка.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const height = Math.round(width * 1.5);

  if (!src || src === failedSrc) {
    return (
      <div
        className={`book-cover book-cover--placeholder book-cover--tone-${toneOf(title)} ${className}`}
        style={{ width, height, fontSize: Math.round(width / 11) }}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : title}
        aria-hidden={decorative || undefined}
      >
        <span className="book-cover__title">{title}</span>
        {author && <span className="book-cover__author">{author}</span>}
      </div>
    );
  }

  return (
    <img
      className={`book-cover ${className}`}
      src={src}
      alt={decorative ? '' : title}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}
