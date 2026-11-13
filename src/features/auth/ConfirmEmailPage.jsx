import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { loginModalOpened } from '../../shared/ui-state/uiSlice';
import { useConfirmEmailMutation } from './authApi';
import './AuthPage.scss';

// Страница из письма-подтверждения (ТЗ §5.2): бэкенд шлёт ссылку
// {frontend}/confirm-email?userId=..&token=.. — подтверждаем один раз при заходе.
export function ConfirmEmailPage() {
  const { t } = useStrings();
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmEmail] = useConfirmEmailMutation();
  const [status, setStatus] = useState('pending');
  const started = useRef(false);

  const userId = params.get('userId');
  const token = params.get('token');

  useEffect(() => {
    // StrictMode монтирует дважды — подтверждаем ровно один раз.
    if (started.current) {
      return;
    }
    started.current = true;

    if (!userId || !token) {
      setStatus('error');
      return;
    }
    confirmEmail({ userId, token })
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [confirmEmail, userId, token]);

  const openLogin = () => {
    navigate('/');
    dispatch(loginModalOpened());
  };

  const message =
    status === 'pending' ? t.confirmPending : status === 'success' ? t.confirmOk : t.confirmFail;
  const messageClass =
    status === 'success'
      ? 'auth-page__message auth-page__message--success'
      : status === 'error'
        ? 'auth-page__message auth-page__message--error'
        : 'auth-page__message';

  return (
    <section className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">{t.confirmTitle}</h1>
        <p className={messageClass}>{message}</p>
        {status === 'success' && (
          <Button variant="primary" className="auth-page__action" onClick={openLogin}>
            {t.goToLogin}
          </Button>
        )}
      </div>
    </section>
  );
}
