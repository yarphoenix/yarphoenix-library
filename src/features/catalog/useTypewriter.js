import { useEffect, useState } from 'react';

const TYPE_MS = 42; // базовая скорость печати буквы
const TYPE_JITTER_MS = 45; // разброс — «печатает человек», а не машина
const VISIBLE_MS = 10000; // от начала печати до ухода фразы (ТЗ пользователя)
const MIN_HOLD_MS = 2500; // не уводить слишком быстро на длинных фразах
const EXIT_MS = 450; // длительность ухода вверх — синхронно с CSS-транзишеном
const COOLDOWN_MS = 1000; // пауза между фразами

const initial = { text: '', exiting: false, index: 0 };

// Печатающий плейсхолдер: печатает фразу по буквам, держит ~10с, уводит вверх,
// пауза 1с, следующая. phrases — массив { text, fill }. enabled=false → пусто.
export function useTypewriter(phrases, enabled) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (!enabled || phrases.length === 0) {
      setState(initial);
      return undefined;
    }

    let cancelled = false;
    let timer;
    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      let i = 0;
      while (!cancelled) {
        const phrase = phrases[i % phrases.length];

        for (let c = 1; c <= phrase.text.length; c += 1) {
          if (cancelled) return;
          setState({ text: phrase.text.slice(0, c), exiting: false, index: i });
          await wait(TYPE_MS + Math.random() * TYPE_JITTER_MS);
        }
        if (cancelled) return;

        const typedMs = phrase.text.length * (TYPE_MS + TYPE_JITTER_MS / 2);
        await wait(Math.max(MIN_HOLD_MS, VISIBLE_MS - typedMs));
        if (cancelled) return;

        setState((prev) => ({ ...prev, exiting: true }));
        await wait(EXIT_MS);
        if (cancelled) return;

        setState({ text: '', exiting: false, index: i });
        await wait(COOLDOWN_MS);
        i += 1;
      }
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, phrases]);

  const phrase = phrases.length ? phrases[state.index % phrases.length] : null;
  return { text: state.text, exiting: state.exiting, phrase };
}
