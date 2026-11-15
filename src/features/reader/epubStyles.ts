import type { Contents } from 'epubjs';

import { READER_FONTS, READER_SIZES, READER_THEMES, type ReaderSettings } from './readerSlice';

const STYLE_KEY = 'yarphoenix-reader';
const FONTS_KEY = 'yarphoenix-reader-fonts';

// Метка элемента, который издание спрятало за левый край страницы (см. tameOffscreenElements).
const OFFSCREEN_ATTRIBUTE = 'data-yarphoenix-offscreen';
const SCANNED_ATTRIBUTE = 'data-yarphoenix-scanned';
// `left: -999em` и `-9999px` — это тысячи пикселей; обычная вёрстка так далеко не уходит.
const OFFSCREEN_LEFT_PX = -1000;

// Семейства из READER_FONTS, которые приложение подключает через @fontsource.
const APP_FONT_FAMILIES = ['Libre Baskerville', 'Libre Franklin Variable'];

/**
 * Оформление текста книги под настройки читалки. Каждая страница книги — отдельный документ
 * в iframe, стили приложения туда не попадают, поэтому тема передаётся явным CSS.
 */
export function buildReaderCss(settings: ReaderSettings): string {
  const theme = READER_THEMES[settings.theme];
  const font = READER_FONTS[settings.font];
  const size = READER_SIZES[settings.fontSize];

  return [
    `html, body { background: ${theme.background} !important; }`,
    `body { color: ${theme.color} !important; font-family: ${font} !important; font-size: ${size} !important; line-height: 1.75 !important; }`,
    // У книжных стилей свои цвета и фоны для абзацев, заголовков, таблиц — в тёмной теме
    // это тёмный текст на тёмном фоне. Всё содержимое наследует цвет темы.
    'body * { color: inherit !important; background-color: transparent !important; }',
    'p, li, blockquote, dd, dt, td, th, div, span, h1, h2, h3, h4, h5, h6 { font-family: inherit !important; }',
    // Ссылки потеряли собственный цвет — оставляем их различимыми.
    'a { text-decoration: underline; }',
    // Спрятанное изданием за край страницы прячем обрезкой: текст остаётся доступным экранной
    // читалке, но больше не растягивает раздел (см. tameOffscreenElements).
    `[${OFFSCREEN_ATTRIBUTE}] { left: auto !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip-path: inset(50%) !important; white-space: nowrap !important; }`,
  ].join('\n');
}

/**
 * Часть изданий (например, Standard Ebooks) прячет служебные заголовки для экранных читалок
 * приёмом `position: absolute; left: -999em`. epub.js считает ширину раздела по прямоугольнику,
 * охватывающему всё содержимое, поэтому спрятанный заголовок растягивает раздел из двух страниц
 * на десятки пустых. Такие элементы помечаются, а правило из buildReaderCss возвращает их на
 * место и скрывает обрезкой.
 */
export function tameOffscreenElements(doc: Document): void {
  const view = doc.defaultView;
  const root = doc.documentElement;
  // Документ размечается один раз: смена настроек чтения расположение элементов не меняет.
  if (!view || !doc.body || root.hasAttribute(SCANNED_ATTRIBUTE)) {
    return;
  }
  root.setAttribute(SCANNED_ATTRIBUTE, '');

  for (const element of Array.from(doc.body.querySelectorAll('*'))) {
    const style = view.getComputedStyle(element);
    const positioned = style.position === 'absolute' || style.position === 'fixed';
    if (positioned && Number.parseFloat(style.left) < OFFSCREEN_LEFT_PX) {
      element.setAttribute(OFFSCREEN_ATTRIBUTE, '');
    }
  }
}

// Адреса файлов шрифтов в правилах заданы относительно таблицы стилей приложения;
// в документе книги им не от чего отсчитываться, поэтому делаем их абсолютными.
const absolutizeUrls = (css: string, base: string): string =>
  css.replace(/url\((["']?)(.*?)\1\)/g, (match, _quote: string, url: string) => {
    try {
      return `url("${new URL(url, base).href}")`;
    } catch {
      return match;
    }
  });

// Правила @font-face наших шрифтов из стилей приложения — без них в iframe вместо
// Libre Baskerville / Libre Franklin показываются запасные Georgia и Arial.
function collectFontFaceCss(): string {
  const rules: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      // Таблица с другого origin: её правила недоступны, и наших шрифтов там нет.
      continue;
    }

    const base = sheet.href ?? document.baseURI;
    for (const rule of Array.from(cssRules)) {
      if (!(rule instanceof CSSFontFaceRule)) {
        continue;
      }
      const family = rule.style.getPropertyValue('font-family');
      if (APP_FONT_FAMILIES.some((name) => family.includes(name))) {
        rules.push(absolutizeUrls(rule.cssText, base));
      }
    }
  }

  return rules.join('\n');
}

let fontFaceCss = '';

/** Подключает шрифты приложения и оформление темы к одному документу книги. */
export function applyReaderStyles(contents: Contents, settings: ReaderSettings): void {
  // До стилей темы: проход смотрит на расположение элементов, заданное самим изданием.
  tameOffscreenElements(contents.document);

  // Пустой результат не запоминаем: стили приложения могли ещё не загрузиться.
  fontFaceCss ||= collectFontFaceCss();
  if (fontFaceCss) {
    void contents.addStylesheetCss(fontFaceCss, FONTS_KEY);
  }
  void contents.addStylesheetCss(buildReaderCss(settings), STYLE_KEY);
}
