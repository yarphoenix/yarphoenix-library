import type { ReactNode } from 'react';

type Props = {
  title: string;
  text?: string;
  // Кнопки действий: войти, повторить, вернуться.
  children?: ReactNode;
};

// Полноэкранное сообщение читалки: гость, книги нет в библиотеке, нет файла, ошибка открытия.
// Вместо пустого экрана человек видит, что случилось и что можно сделать.
export function ReaderNotice({ title, text, children }: Props) {
  return (
    <div className="reader reader--notice">
      <div className="reader__notice" role="status">
        <h1 className="reader__notice-title">{title}</h1>
        {text && <p className="reader__notice-text">{text}</p>}
        {children && <div className="reader__notice-actions">{children}</div>}
      </div>
    </div>
  );
}
