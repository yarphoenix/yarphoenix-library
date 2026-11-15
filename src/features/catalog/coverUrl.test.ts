import { describe, expect, it } from 'vitest';

import { coverUrl } from './coverUrl';

describe('coverUrl', () => {
  it('просит у Open Library ошибку, а не пустую картинку, когда обложки нет', () => {
    expect(coverUrl({ coverId: 8739161 })).toBe(
      'https://covers.openlibrary.org/b/id/8739161-M.jpg?default=false',
    );
  });

  it('подставляет запрошенный размер', () => {
    expect(coverUrl({ coverId: 42 }, 'L')).toContain('/42-L.jpg');
  });

  it.each([null, undefined, 0, -1])('не строит адрес для coverId = %s', (coverId) => {
    expect(coverUrl({ coverId })).toBeNull();
  });
});
