import ePub from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { AssistantPanel } from '../assistant/AssistantPanel';
import { useStrings } from '../../shared/i18n/useStrings';
import { useGetLibraryBookQuery, useUpdateProgressMutation } from '../library/libraryApi';
import {
  fontChanged,
  fontSizeChanged,
  READER_FONTS,
  READER_SIZES,
  READER_THEMES,
  selectReaderSettings,
  themeChanged,
} from './readerSlice';
import './ReaderPage.scss';

const PROGRESS_SAVE_DELAY_MS = 2000;

// `||`, а не `??`: незаданная repo-переменная приходит в сборку пустой строкой.
const apiBase = import.meta.env.VITE_API_URL || '/api';

export function ReaderPage() {
  const { bookId } = useParams();
  const { t } = useStrings();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const settings = useSelector(selectReaderSettings);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const { data: book } = useGetLibraryBookQuery(bookId);
  const [updateProgress] = useUpdateProgressMutation();

  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const saveTimerRef = useRef(null);
  // Текущая позиция чтения — для CFI-обрезки контекста ассистента (ТЗ §7.2).
  const currentCfiRef = useRef(null);

  const [percent, setPercent] = useState(null);
  const [aaOpen, setAaOpen] = useState(false);
  const [error, setError] = useState(null);
  // Состояние панели ассистента изолировано от рендера книги (ТЗ §6.5).
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selection, setSelection] = useState('');

  // Сохраняем стартовый CFI один раз: rendition не должен пересоздаваться
  // при обновлении данных книги после первого сохранения прогресса.
  const [initialCfi, setInitialCfi] = useState(null);
  if (book && initialCfi === null) {
    setInitialCfi({ cfi: book.cfiPosition ?? undefined });
  }

  useEffect(() => {
    if (!viewerRef.current || !accessToken || !initialCfi || bookRef.current) {
      return undefined;
    }

    let disposed = false;

    const open = async () => {
      try {
        const response = await fetch(`${apiBase}/library/books/${bookId}/file`, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error(`file request failed: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        if (disposed) {
          return;
        }

        // epub.js рисует текст на клиенте из уже загруженного файла —
        // путь рендера не зависит от AI-модуля (ТЗ §6.3).
        const epubBook = ePub(buffer);
        bookRef.current = epubBook;

        // Часть EPUB (особенно сканы Internet Archive, §5.1.2) содержит «висячие»
        // ссылки в spine — itemref на id, которого нет в manifest. epub.js оставляет
        // у такой секции пустой url и падает при рендере/подсчёте локаций
        // («Cannot read properties of undefined (reading 'indexOf')»). Помечаем такие
        // секции нелинейными — читалка их пропускает при показе, навигации и generate.
        // Индексы spine (а значит и сохранённые CFI-позиции) при этом не сдвигаются.
        await epubBook.ready;
        if (disposed) {
          return;
        }
        epubBook.spine.spineItems
          .filter((section) => !section.url)
          .forEach((section) => {
            section.linear = false;
          });

        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Стартуем с сохранённой позиции; при первом открытии — с первой линейной
        // секции с текстом, минуя навигационную страницу-ToC (у таких сканов она
        // часто пустая, иначе книга открывалась бы на пустой странице).
        let startTarget = initialCfi.cfi;
        if (!startTarget) {
          const navPath = epubBook.packaging?.navPath;
          const firstContent = epubBook.spine.spineItems.find(
            (section) => section.linear && section.url && section.href !== navPath,
          );
          startTarget = firstContent?.href;
        }

        try {
          await rendition.display(startTarget);
        } catch {
          // Позиция могла указывать на пропущенную секцию — открываем с начала.
          await rendition.display();
        }
        await epubBook.locations.generate(1000);

        rendition.on('relocated', (location) => {
          currentCfiRef.current = location.start.cfi;
          const fraction = epubBook.locations.percentageFromCfi(location.start.cfi) ?? 0;
          const progress = Math.round(fraction * 1000) / 10;
          setPercent(Math.round(progress));

          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            updateProgress({ bookId, cfiPosition: location.start.cfi, progress });
          }, PROGRESS_SAVE_DELAY_MS);
        });

        // Выделение текста → шаблоны ассистента для выделенного (ТЗ §7.1).
        rendition.on('selected', (cfiRange, contents) => {
          const text = contents.window.getSelection()?.toString().trim();
          if (text) {
            setSelection(text.slice(0, 600));
            setAssistantOpen(true);
          }
        });

        rendition.on('keydown', handleKeys);
        document.addEventListener('keydown', handleKeys);
      } catch (err) {
        if (!disposed) {
          setError(err.message ?? 'failed to open');
        }
      }
    };

    const handleKeys = (event) => {
      if (event.key === 'ArrowRight') {
        renditionRef.current?.next();
      }
      if (event.key === 'ArrowLeft') {
        renditionRef.current?.prev();
      }
    };

    open();

    return () => {
      disposed = true;
      clearTimeout(saveTimerRef.current);
      document.removeEventListener('keydown', handleKeys);
      bookRef.current?.destroy();
      bookRef.current = null;
      renditionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, accessToken, book !== undefined]);

  // Применение темы/шрифта/размера к rendition.
  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) {
      return;
    }
    const theme = READER_THEMES[settings.theme];
    rendition.themes.default({
      body: {
        background: `${theme.background} !important`,
        color: `${theme.color} !important`,
        'font-family': `${READER_FONTS[settings.font]} !important`,
        'line-height': '1.75 !important',
      },
      p: { color: `${theme.color} !important` },
    });
    rendition.themes.fontSize(READER_SIZES[settings.fontSize]);
  }, [settings, percent]);

  const theme = READER_THEMES[settings.theme];

  return (
    <div className="reader" style={{ background: theme.background }}>
      <header className="reader__bar">
        <button
          type="button"
          className="reader__back"
          onClick={() => navigate(book ? `/books/${book.provider}/${book.externalId}` : '/library')}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t.readerBack}
        </button>

        <div className="reader__title-box">
          <div className="reader__title">{book?.title}</div>
          {percent !== null && <div className="reader__percent">{percent}%</div>}
        </div>

        <button
          type="button"
          className={`reader__assistant-btn ${assistantOpen ? 'reader__assistant-btn--active' : ''}`}
          onClick={() => setAssistantOpen((v) => !v)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
          </svg>
          <span>{t.assistantTitle}</span>
        </button>

        <div className="reader__aa-box">
          <button type="button" className="reader__aa" onClick={() => setAaOpen((v) => !v)}>
            Aa
          </button>
          {aaOpen && (
            <div className="reader__aa-menu">
              <div className="reader__aa-label">{t.font}</div>
              <div className="reader__aa-row">
                <SettingChip
                  active={settings.font === 'serif'}
                  onClick={() => dispatch(fontChanged('serif'))}
                >
                  {t.fontSerif}
                </SettingChip>
                <SettingChip
                  active={settings.font === 'sans'}
                  onClick={() => dispatch(fontChanged('sans'))}
                >
                  {t.fontSans}
                </SettingChip>
              </div>
              <div className="reader__aa-label">{t.theme}</div>
              <div className="reader__aa-row">
                <SettingChip
                  active={settings.theme === 'light'}
                  onClick={() => dispatch(themeChanged('light'))}
                >
                  {t.themeLight}
                </SettingChip>
                <SettingChip
                  active={settings.theme === 'sepia'}
                  onClick={() => dispatch(themeChanged('sepia'))}
                >
                  {t.themeSepia}
                </SettingChip>
                <SettingChip
                  active={settings.theme === 'dark'}
                  onClick={() => dispatch(themeChanged('dark'))}
                >
                  {t.themeDark}
                </SettingChip>
              </div>
              <div className="reader__aa-label">{t.textSize}</div>
              <div className="reader__aa-row">
                <SettingChip
                  active={settings.fontSize === 'sm'}
                  onClick={() => dispatch(fontSizeChanged('sm'))}
                >
                  {t.sizeS}
                </SettingChip>
                <SettingChip
                  active={settings.fontSize === 'md'}
                  onClick={() => dispatch(fontSizeChanged('md'))}
                >
                  {t.sizeM}
                </SettingChip>
                <SettingChip
                  active={settings.fontSize === 'lg'}
                  onClick={() => dispatch(fontSizeChanged('lg'))}
                >
                  {t.sizeL}
                </SettingChip>
              </div>
            </div>
          )}
        </div>
      </header>

      {error ? (
        <p className="reader__error">{t.bookError}</p>
      ) : (
        <div className="reader__stage">
          <button
            type="button"
            className="reader__nav reader__nav--prev"
            onClick={() => renditionRef.current?.prev()}
            aria-label={t.prev}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="reader__viewer" ref={viewerRef} />
          <button
            type="button"
            className="reader__nav reader__nav--next"
            onClick={() => renditionRef.current?.next()}
            aria-label={t.next}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {assistantOpen && (
        <AssistantPanel
          bookId={bookId}
          selection={selection}
          getCfi={() => currentCfiRef.current}
          onClearSelection={() => setSelection('')}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </div>
  );
}

function SettingChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`reader__chip ${active ? 'reader__chip--active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
