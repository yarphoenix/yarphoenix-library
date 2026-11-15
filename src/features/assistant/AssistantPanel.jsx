import { useEffect, useRef, useState } from 'react';

import { useStrings } from '../../shared/i18n/useStrings';
import { useAskAssistantMutation } from './assistantApi';
import './AssistantPanel.scss';

// Панель ассистента — изолированный кусок UI со своим состоянием (ТЗ §6.5):
// читалка рендерит текст и ничего не знает о состоянии панели.
export function AssistantPanel({ bookId, selection, getCfi, onClearSelection, onClose }) {
  const { t, lang } = useStrings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ask, { isLoading }] = useAskAssistantMutation();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async ({ template, question }) => {
    const aboutLabel =
      template === 'ask'
        ? question
        : `${templateLabel(template, t)}${selection ? ` · «${truncate(selection)}»` : ''}`;

    setMessages((prev) => [...prev, { from: 'user', text: aboutLabel }]);
    setInput('');

    try {
      const response = await ask({
        bookId,
        template,
        selection: selection || null,
        context: null,
        question: question || null,
        language: lang,
        // Текущая позиция — сервер режет по ней контекст (анти-спойлер, ТЗ §7.2).
        cfi: getCfi?.() ?? null,
      }).unwrap();

      setMessages((prev) => [
        ...prev,
        response.available
          ? { from: 'assistant', text: response.answer }
          : { from: 'assistant', text: response.message, degraded: true },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: 'assistant', text: err?.data?.message ?? t.assistantError, degraded: true },
      ]);
    }
  };

  const sendFree = () => {
    const question = input.trim();
    if (question && !isLoading) {
      send({ template: 'ask', question });
    }
  };

  return (
    <aside className="assistant">
      <header className="assistant__head">
        <div className="assistant__title-row">
          <svg
            width="18"
            height="18"
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
          <h2 className="assistant__title">{t.assistantTitle}</h2>
          <button
            type="button"
            className="assistant__close"
            onClick={onClose}
            aria-label={t.cancel}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <span className="assistant__badge">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t.assistantSub}
        </span>
      </header>

      <div className="assistant__messages" ref={scrollRef}>
        {messages.length === 0 && <p className="assistant__greeting">{t.assistantGreeting}</p>}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`assistant__row ${message.from === 'user' ? 'assistant__row--user' : ''}`}
          >
            <div
              className={`assistant__bubble assistant__bubble--${message.from} ${
                message.degraded ? 'assistant__bubble--degraded' : ''
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && <p className="assistant__thinking">{t.thinking}</p>}
      </div>

      <footer className="assistant__composer">
        {selection && (
          <div className="assistant__selection">
            <span className="assistant__selection-text">«{truncate(selection, 70)}»</span>
            <button
              type="button"
              className="assistant__selection-clear"
              onClick={onClearSelection}
              aria-label={t.cancel}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {selection && (
          <div className="assistant__chips">
            {chipsFor(selection).map((template) => (
              <button
                key={template}
                type="button"
                className="assistant__chip"
                disabled={isLoading}
                onClick={() => send({ template })}
              >
                {templateLabel(template, t)}
              </button>
            ))}
          </div>
        )}

        <div className="assistant__input-row">
          <textarea
            className="assistant__input"
            rows={1}
            value={input}
            placeholder={t.askPh}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendFree();
              }
            }}
          />
          <button
            type="button"
            className="assistant__send"
            disabled={isLoading || !input.trim()}
            onClick={sendFree}
            aria-label={t.send}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </footer>
    </aside>
  );
}

const truncate = (text, max = 40) => (text.length > max ? `${text.slice(0, max)}…` : text);

const templateLabel = (template, t) =>
  ({
    meaning: t.selWhatMeans,
    translate: t.selTranslate,
    explain: t.selExplain,
    authorMeans: t.selAuthorMean,
    reference: t.selReference,
    summarize: t.selSummarize,
    scene: t.selWhat,
    characters: t.selWho,
  })[template] ?? template;

// Набор шаблонов по длине выделения (ТЗ §7.1): слово/термин → значение и перевод;
// фраза → объяснение, смысл автора, отсылка; абзац → пересказ, сцена, персонажи.
const chipsFor = (selection) => {
  const words = selection.trim().split(/\s+/).length;
  if (words <= 2) {
    return ['meaning', 'translate'];
  }
  if (words <= 20) {
    return ['explain', 'authorMeans', 'reference'];
  }
  return ['summarize', 'scene', 'characters'];
};
