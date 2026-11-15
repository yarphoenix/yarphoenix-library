import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BookCover } from './BookCover';

const COVER = 'https://covers.example/1-M.jpg';
const OTHER_COVER = 'https://covers.example/2-M.jpg';

describe('BookCover', () => {
  it('без адреса обложки набирает заглушку из названия и автора', () => {
    render(<BookCover title="Emma" author="Jane Austen" src={null} />);

    expect(screen.getByRole('img', { name: 'Emma' })).toHaveClass('book-cover--placeholder');
    expect(screen.getByText('Jane Austen')).toBeInTheDocument();
  });

  it('показывает заглушку, когда картинка не загрузилась', () => {
    render(<BookCover title="Emma" src={COVER} />);
    const image = screen.getByRole('img', { name: 'Emma' });
    expect(image.tagName).toBe('IMG');

    fireEvent.error(image);

    expect(screen.getByRole('img', { name: 'Emma' })).toHaveClass('book-cover--placeholder');
  });

  it('даёт новой обложке свою попытку после сбоя предыдущей', () => {
    const { rerender } = render(<BookCover title="Emma" src={COVER} />);
    fireEvent.error(screen.getByRole('img', { name: 'Emma' }));

    rerender(<BookCover title="Persuasion" src={OTHER_COVER} />);

    expect(screen.getByRole('img', { name: 'Persuasion' })).toHaveAttribute('src', OTHER_COVER);
  });

  it('в декоративном режиме не дублирует название для экранной читалки', () => {
    const { container, rerender } = render(<BookCover title="Emma" src={COVER} decorative />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');

    rerender(<BookCover title="Emma" src={null} decorative />);
    expect(container.querySelector('.book-cover--placeholder')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
