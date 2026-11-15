import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import './ErrorNotice.scss';

type ErrorNoticeProps = {
  message: string;
  // block — на месте содержимого, которое не загрузилось; banner — полоса над содержимым,
  // которое осталось на экране с прошлого раза.
  variant?: 'block' | 'banner';
  // Кнопки действий: повторить, перейти в другой режим.
  children?: ReactNode;
  className?: string;
};

// Сообщение об ошибке загрузки с действиями. Ошибка не должна выглядеть как «ничего нет»
// или прятаться за старыми данными — человек видит, что случилось и что можно сделать.
export function ErrorNotice({
  message,
  variant = 'block',
  children,
  className = '',
}: ErrorNoticeProps) {
  return (
    <div className={`error-notice error-notice--${variant} ${className}`} role="alert">
      <CircleAlert
        className="error-notice__icon"
        size={variant === 'block' ? 30 : 18}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <p className="error-notice__message">{message}</p>
      {children && <div className="error-notice__actions">{children}</div>}
    </div>
  );
}
