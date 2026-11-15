import { describe, expect, it } from 'vitest';

import { countLabel } from './plural';
import type { PluralForms } from './strings';

const BOOKS_RU: PluralForms = { one: 'книга', few: 'книги', many: 'книг', other: 'книги' };
const BOOKS_EN: PluralForms = { one: 'book', other: 'books' };

// Intl разделяет разряды неразрывным пробелом — в ожиданиях пишем обычный.
const plainSpaces = (text: string): string => text.replace(/\s/g, ' ');

describe('countLabel', () => {
  it.each([
    [1, '1 книга'],
    [2, '2 книги'],
    [5, '5 книг'],
    [11, '11 книг'],
    [21, '21 книга'],
    [24, '24 книги'],
    [0, '0 книг'],
  ])('выбирает русскую форму для %i', (count, expected) => {
    expect(countLabel('ru', count, BOOKS_RU)).toBe(expected);
  });

  it('в английском различает только единственное и множественное число', () => {
    expect(countLabel('en', 1, BOOKS_EN)).toBe('1 book');
    expect(countLabel('en', 2, BOOKS_EN)).toBe('2 books');
    expect(countLabel('en', 0, BOOKS_EN)).toBe('0 books');
  });

  it('разделяет разряды по правилам языка', () => {
    expect(plainSpaces(countLabel('ru', 1885, BOOKS_RU))).toBe('1 885 книг');
    expect(countLabel('en', 1885, BOOKS_EN)).toBe('1,885 books');
  });

  it('без редкой формы берёт общую', () => {
    expect(countLabel('ru', 3, { one: 'том', other: 'тома' })).toBe('3 тома');
  });
});
