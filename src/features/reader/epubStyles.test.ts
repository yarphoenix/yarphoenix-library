import { describe, expect, it } from 'vitest';

import { buildReaderCss, tameOffscreenElements } from './epubStyles';
import type { ReaderSettings } from './readerSlice';

const OFFSCREEN = 'data-yarphoenix-offscreen';
const HIDDEN_BY_EDITION = 'position: absolute; left: -9999px';

type Fixture = { tag: string; id: string; style?: string; text: string };

// Документ раздела книги — как у epub.js, в собственном iframe: стили считаются только
// у документа, показанного в окне.
const bookDocument = (elements: Fixture[]): Document => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    throw new Error('jsdom did not create a document for the iframe');
  }
  elements.forEach((fixture) => addElement(doc, fixture));
  return doc;
};

const addElement = (doc: Document, { tag, id, style, text }: Fixture): void => {
  const element = doc.createElement(tag);
  element.id = id;
  element.textContent = text;
  if (style) {
    element.setAttribute('style', style);
  }
  doc.body.append(element);
};

const isMarked = (doc: Document, id: string): boolean =>
  doc.getElementById(id)?.hasAttribute(OFFSCREEN) ?? false;

describe('tameOffscreenElements', () => {
  it('помечает заголовок, спрятанный изданием за левый край страницы', () => {
    const doc = bookDocument([
      { tag: 'h2', id: 'hidden', style: HIDDEN_BY_EDITION, text: 'Imprint' },
      { tag: 'p', id: 'text', text: 'This ebook is the product of many hours of work.' },
    ]);

    tameOffscreenElements(doc);

    expect(isMarked(doc, 'hidden')).toBe(true);
    expect(isMarked(doc, 'text')).toBe(false);
  });

  it('не трогает обычное позиционирование', () => {
    const doc = bookDocument([
      { tag: 'p', id: 'note', style: 'position: absolute; left: -20px', text: '*' },
      { tag: 'p', id: 'shifted', style: 'position: relative; left: -9999px', text: 'text' },
    ]);

    tameOffscreenElements(doc);

    expect(isMarked(doc, 'note')).toBe(false);
    expect(isMarked(doc, 'shifted')).toBe(false);
  });

  it('размечает документ один раз', () => {
    const doc = bookDocument([{ tag: 'p', id: 'text', text: 'Text' }]);
    tameOffscreenElements(doc);

    addElement(doc, { tag: 'h2', id: 'late', style: HIDDEN_BY_EDITION, text: 'Late' });
    tameOffscreenElements(doc);

    expect(isMarked(doc, 'late')).toBe(false);
  });
});

describe('buildReaderCss', () => {
  it('скрывает помеченные элементы обрезкой, а не выносом за край', () => {
    const settings: ReaderSettings = { theme: 'light', font: 'serif', fontSize: 'md' };

    const css = buildReaderCss(settings);

    expect(css).toContain(`[${OFFSCREEN}]`);
    expect(css).toContain('left: auto !important');
    expect(css).toContain('clip-path: inset(50%) !important');
  });
});
