import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';

import { useStrings } from '../../shared/i18n/useStrings';
import { useTypewriter, type TypewriterPhrase } from './useTypewriter';
import './CatalogSearch.scss';

const DEBOUNCE_MS = 400;
// Сколько названий книг из выдачи подмешивать в подсказки.
const BOOK_HINTS = 6;

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Фишер–Йейтс: перемешиваем подсказки, чтобы порядок не был предсказуемым.
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    const picked = copy[j];
    if (current !== undefined && picked !== undefined) {
      copy[i] = picked;
      copy[j] = current;
    }
  }
  return copy;
}

type CatalogSearchProps = {
  // Запрос из адресной строки — источник правды.
  query: string;
  onQueryChange: (query: string) => void;
  // Названия книг из текущей выдачи — для подсказок «Что насчёт "…"?».
  suggestions: string[];
};

// Строка поиска каталога: ввод уходит в адрес с задержкой, а пустое поле «печатает» подсказки.
export function CatalogSearch({ query, onQueryChange, suggestions }: CatalogSearchProps) {
  const { t } = useStrings();
  const [input, setInput] = useState(query);
  const [focused, setFocused] = useState(false);

  // Адрес поменялся извне («назад», сброс фильтров) — подтягиваем поле к нему в том же рендере.
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInput(query);
  }

  useEffect(() => {
    if (input === query) {
      return undefined;
    }
    const timer = setTimeout(() => onQueryChange(input), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input, query, onQueryChange]);

  // Статичные фразы и реальные книги из выдачи (их название по Tab подставляется в поиск).
  const phrases = useMemo(() => {
    const statics: TypewriterPhrase[] = t.searchHints.map((text) => ({ text, fill: null }));
    const books: TypewriterPhrase[] = suggestions.slice(0, BOOK_HINTS).map((title) => ({
      text: t.searchBookHint.replace('%s', title),
      fill: title,
    }));
    return shuffle([...statics, ...books]);
  }, [t, suggestions]);

  const reduceMotion = useMemo(() => prefersReducedMotion(), []);
  const typewriterOn = input === '' && !reduceMotion;
  const ghost = useTypewriter(phrases, typewriterOn);
  const showGhost = typewriterOn && ghost.text !== '';
  // Название, которое подставит Tab: только пока поле в фокусе, пусто и подсказка на экране.
  const fill = focused && showGhost ? (ghost.phrase?.fill ?? null) : null;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && fill) {
      event.preventDefault();
      setInput(fill);
    }
  };

  return (
    <div className="catalog-search">
      <Search className="catalog-search__icon" size={19} strokeWidth={2} aria-hidden="true" />
      <div className="catalog-search__field">
        <input
          className="catalog-search__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder={typewriterOn ? '' : t.search}
          aria-label={t.search}
          type="search"
        />
        {showGhost && (
          <div
            className={`catalog-search__ghost ${ghost.exiting ? 'catalog-search__ghost--exiting' : ''}`}
            aria-hidden="true"
          >
            <span className="catalog-search__ghost-text">{ghost.text}</span>
            {!focused && <span className="catalog-search__caret" />}
          </div>
        )}
      </div>
      {fill && <kbd className="catalog-search__tab">{t.searchTab}</kbd>}
      {input && (
        <button
          type="button"
          className="catalog-search__clear"
          onClick={() => setInput('')}
          aria-label={t.searchClear}
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
