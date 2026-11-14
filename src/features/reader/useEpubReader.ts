import ePub, { type Book, type Contents, type Location, type Rendition } from 'epubjs';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { useAppDispatch } from '../../app/hooks';
import { fetchWithAuth } from '../../shared/api/fetchWithAuth';
import { useUpdateProgressMutation } from '../library/libraryApi';
import { applyReaderStyles } from './epubStyles';
import type { ReaderSettings } from './readerSlice';

const PROGRESS_SAVE_DELAY_MS = 2000;
// Шаг разметки позиций в символах: по ней считается процент прочитанного.
const LOCATION_CHARS = 1000;
const MAX_SELECTION_CHARS = 600;

export type ReaderPhase = 'loading' | 'ready' | 'error';

// Секция spine — в типах epub.js коллекция секций не описана, берём только нужные поля.
type SpineSection = {
  linear: boolean;
  url?: string;
  href: string;
};

type Options = {
  bookId: string;
  // Позиция и прогресс на момент открытия; дальше читалка ведёт их сама.
  startCfi: string | null;
  startProgress: number;
  settings: ReaderSettings;
  onSelect: (text: string) => void;
};

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// В типах epub.js getContents() объявлен как один Contents, а возвращается массив открытых
// документов — сверяем на месте, а не верим объявлению.
const liveContents = (rendition: Rendition): Contents[] => {
  const contents: unknown = rendition.getContents();
  return Array.isArray(contents) ? (contents as Contents[]) : [];
};

// epub.js бросает исключение в destroy(), если читалку закрыли в момент открытия: менеджер
// страниц уже создан, но ещё не отрисован. Исключение в очистке эффекта уронило бы всё
// приложение, поэтому в этом случае закрываем rendition чуть позже — сразу после отрисовки
// (тогда отложенный показ книги в очереди epub.js тихо отменяется).
const closeBook = (book: Book): void => {
  const rendition: Rendition | undefined = book.rendition;
  try {
    book.destroy();
  } catch {
    rendition?.once('attached', () => rendition.destroy());
  }
};

/**
 * Жизненный цикл epub.js для одной книги: загрузка файла, показ с сохранённого места,
 * оформление по настройкам, листание и сохранение позиции.
 * Компонент-владелец должен монтироваться заново для другой книги (key по bookId).
 */
export function useEpubReader(viewerRef: RefObject<HTMLDivElement | null>, options: Options) {
  const { bookId, settings, onSelect } = options;
  const dispatch = useAppDispatch();
  const [updateProgress] = useUpdateProgressMutation();

  const [phase, setPhase] = useState<ReaderPhase>('loading');
  // До готовности разметки позиций показываем сохранённый прогресс, а не пустое место.
  const [percent, setPercent] = useState(() => Math.round(options.startProgress));
  const [attempt, setAttempt] = useState(0);

  const renditionRef = useRef<Rendition | null>(null);
  // Текущая позиция чтения — для CFI-обрезки контекста ассистента (ТЗ §7.2).
  const currentCfiRef = useRef<string | null>(null);
  // Значения «на момент открытия» фиксируем: запись книги в кэше обновляется после каждого
  // сохранения прогресса, и читалка не должна из-за этого пересоздаваться.
  const startRef = useRef({ cfi: options.startCfi, progress: options.startProgress });
  // Свежие настройки и обработчик выделения — для колбэков epub.js, которые живут дольше рендера.
  const settingsRef = useRef(settings);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Смена темы, шрифта или размера: переоформляем уже открытые страницы. Новые страницы
  // получают стили при загрузке — через хук контента ниже.
  useEffect(() => {
    settingsRef.current = settings;
    const rendition = renditionRef.current;
    if (rendition) {
      liveContents(rendition).forEach((contents) => applyReaderStyles(contents, settings));
    }
  }, [settings]);

  useEffect(() => {
    const container = viewerRef.current;
    if (!container) {
      return undefined;
    }

    let disposed = false;
    const controller = new AbortController();
    let book: Book | null = null;
    let progress = startRef.current.progress;
    let firstLocation = true;
    let userHasMoved = false;
    let saveTimer: number | undefined;
    let pending: { cfiPosition: string; progress: number } | null = null;

    const flush = () => {
      window.clearTimeout(saveTimer);
      if (pending) {
        void updateProgress({ bookId, ...pending });
        pending = null;
      }
    };

    const scheduleSave = (cfi: string) => {
      pending = { cfiPosition: cfi, progress };
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(flush, PROGRESS_SAVE_DELAY_MS);
    };

    // Процент считается по разметке позиций. Пока она не готова, держим последний известный
    // процент: записать ноль значило бы откатить сохранённый прогресс.
    const measure = (cfi: string) => {
      if (!book || book.locations.length() === 0) {
        return;
      }
      const fraction = book.locations.percentageFromCfi(cfi);
      if (Number.isFinite(fraction)) {
        progress = Math.round(fraction * 1000) / 10;
        setPercent(Math.round(progress));
      }
    };

    const onRelocated = (location: Location) => {
      // Событие могло быть в пути, когда читалку уже закрыли: книга к этому моменту разобрана.
      if (disposed) {
        return;
      }
      const cfi = location.start.cfi;
      currentCfiRef.current = cfi;
      measure(cfi);

      // Первое событие — само открытие книги на сохранённом месте: сохранять нечего.
      if (firstLocation) {
        firstLocation = false;
        return;
      }
      userHasMoved = true;
      scheduleSave(cfi);
    };

    const onSelected = (_cfiRange: string, contents: Contents) => {
      const text = contents.window.getSelection()?.toString().trim();
      if (text) {
        onSelectRef.current(text.slice(0, MAX_SELECTION_CHARS));
      }
    };

    // Стрелки листают книгу, но не тогда, когда человек печатает (вопрос ассистенту).
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) {
        return;
      }
      if (event.key === 'ArrowRight') {
        void renditionRef.current?.next();
      } else if (event.key === 'ArrowLeft') {
        void renditionRef.current?.prev();
      }
    };

    // Вкладку закрывают или сворачивают — таймера можно не дождаться, сохраняем сразу.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };

    const open = async () => {
      try {
        const response = await dispatch(
          fetchWithAuth(`library/books/${bookId}/file`, { signal: controller.signal }),
        );
        if (!response.ok) {
          throw new Error(`Book file request failed with status ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        if (disposed) {
          return;
        }

        // epub.js рисует текст на клиенте из уже загруженного файла — путь рендера
        // не зависит от AI-модуля (ТЗ §6.3).
        const opened = ePub(buffer);
        book = opened;
        await opened.ready;
        if (disposed) {
          return;
        }

        // У части EPUB в spine есть «висячие» itemref — на id, которого нет в manifest.
        // epub.js оставляет такой секции пустой url и падает на ней при показе и разметке
        // позиций. Помечаем их нелинейными: читалка их пропускает, а индексы spine (и с ними
        // сохранённые CFI) не сдвигаются.
        const sections: SpineSection[] = [];
        opened.spine.each((section: SpineSection) => {
          if (!section.url) {
            section.linear = false;
          }
          sections.push(section);
        });

        const rendition = opened.renderTo(container, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Оформление и подписки — до первого показа: иначе первая страница появляется
        // в стилях самой книги, а первое событие о позиции теряется.
        rendition.hooks.content.register((contents: Contents) =>
          applyReaderStyles(contents, settingsRef.current),
        );
        rendition.on('relocated', onRelocated);
        rendition.on('selected', onSelected);
        rendition.on('keydown', onKeyDown);

        // Стартуем с сохранённой позиции; при первом открытии — с первой секции с текстом,
        // минуя страницу навигации (иначе книга может открыться на пустой странице).
        const navPath = opened.packaging.navPath;
        const firstContent = sections.find(
          (section) => section.linear && section.url && section.href !== navPath,
        );
        const target = startRef.current.cfi ?? firstContent?.href;

        try {
          await rendition.display(target);
        } catch {
          // Сохранённая позиция могла указывать на пропущенную секцию — открываем с начала.
          await rendition.display();
        }
        if (disposed) {
          return;
        }
        setPhase('ready');

        // Разметка позиций идёт в фоне и не задерживает показ текста. Когда она готова,
        // уточняем процент — и досохраняем его, если за это время уже листали.
        opened.locations.generate(LOCATION_CHARS).then(
          () => {
            const cfi = currentCfiRef.current;
            if (disposed || !cfi) {
              return;
            }
            measure(cfi);
            if (userHasMoved) {
              scheduleSave(cfi);
            }
          },
          () => {
            // Без разметки не будет процента — читать это не мешает.
          },
        );
      } catch (error) {
        if (!disposed) {
          console.error('Reader failed to open the book', error);
          setPhase('error');
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    void open();

    return () => {
      disposed = true;
      controller.abort();
      // Уходим со страницы раньше, чем сработал таймер, — последняя позиция не должна пропасть.
      flush();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      renditionRef.current = null;
      if (book) {
        closeBook(book);
      }
    };
  }, [attempt, bookId, dispatch, updateProgress, viewerRef]);

  const next = useCallback(() => {
    void renditionRef.current?.next();
  }, []);

  const prev = useCallback(() => {
    void renditionRef.current?.prev();
  }, []);

  const getCfi = useCallback(() => currentCfiRef.current, []);

  const retry = useCallback(() => {
    setPhase('loading');
    setAttempt((value) => value + 1);
  }, []);

  return { phase, percent, next, prev, getCfi, retry };
}
