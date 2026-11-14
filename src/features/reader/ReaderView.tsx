import { ChevronLeft, ChevronRight, LoaderCircle, Sparkles } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import type { LibraryBook } from '../../shared/api/types';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { AssistantPanel } from '../assistant/AssistantPanel';
import { ReaderNotice } from './ReaderNotice';
import { ReaderSettingsMenu } from './ReaderSettingsMenu';
import { READER_THEMES, selectReaderSettings } from './readerSlice';
import { useEpubReader } from './useEpubReader';

type Props = {
  book: LibraryBook;
};

// Читалка одной книги из библиотеки. Монтируется заново для другой книги (key у родителя),
// поэтому всё состояние здесь относится ровно к одной книге.
export function ReaderView({ book }: Props) {
  const { t } = useStrings();
  const navigate = useNavigate();
  const settings = useAppSelector(selectReaderSettings);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Состояние панели ассистента изолировано от рендера книги (ТЗ §6.5).
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selection, setSelection] = useState('');

  // Выделение текста → шаблоны ассистента для выделенного (ТЗ §7.1).
  const handleSelect = useCallback((text: string) => {
    setSelection(text);
    setAssistantOpen(true);
  }, []);

  const reader = useEpubReader(viewerRef, {
    bookId: book.bookId,
    startCfi: book.cfiPosition,
    startProgress: book.progress,
    settings,
    onSelect: handleSelect,
  });

  // У загруженной пользователем книги может не быть каталожной записи — тогда выход в библиотеку.
  const hasCatalogPage = Boolean(book.provider && book.externalId);
  const leave = () =>
    navigate(hasCatalogPage ? `/books/${book.provider}/${book.externalId}` : '/library');

  if (reader.phase === 'error') {
    return (
      <ReaderNotice title={t.readerErrorTitle} text={t.readerErrorText}>
        <Button variant="primary" onClick={reader.retry}>
          {t.retry}
        </Button>
        <Button variant="secondary" onClick={leave}>
          {t.back}
        </Button>
      </ReaderNotice>
    );
  }

  const theme = READER_THEMES[settings.theme];
  const isReady = reader.phase === 'ready';

  return (
    <div className="reader" style={{ background: theme.background, color: theme.color }}>
      <header className="reader__bar">
        <button type="button" className="reader__back" onClick={leave}>
          <ChevronLeft size={17} strokeWidth={2.2} aria-hidden="true" />
          {hasCatalogPage ? t.readerBack : t.toLibrary}
        </button>

        <div className="reader__title-box">
          <div className="reader__title">{book.title}</div>
          <div className="reader__percent">{reader.percent}%</div>
        </div>

        <button
          type="button"
          className={`reader__assistant-btn ${assistantOpen ? 'reader__assistant-btn--active' : ''}`}
          aria-pressed={assistantOpen}
          onClick={() => setAssistantOpen((value) => !value)}
        >
          <Sparkles size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{t.assistantTitle}</span>
        </button>

        <ReaderSettingsMenu />
      </header>

      <div className="reader__stage">
        <button
          type="button"
          className="reader__nav reader__nav--prev"
          onClick={reader.prev}
          disabled={!isReady}
          aria-label={t.prev}
        >
          <ChevronLeft size={20} strokeWidth={2.2} aria-hidden="true" />
        </button>

        <div className="reader__viewer" ref={viewerRef} />

        <button
          type="button"
          className="reader__nav reader__nav--next"
          onClick={reader.next}
          disabled={!isReady}
          aria-label={t.next}
        >
          <ChevronRight size={20} strokeWidth={2.2} aria-hidden="true" />
        </button>

        {!isReady && (
          <div className="reader__status" role="status">
            <LoaderCircle className="reader__spinner" size={22} aria-hidden="true" />
            {t.preparingBook}
          </div>
        )}
      </div>

      {assistantOpen && (
        <AssistantPanel
          bookId={book.bookId}
          selection={selection}
          getCfi={reader.getCfi}
          onClearSelection={() => setSelection('')}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </div>
  );
}
