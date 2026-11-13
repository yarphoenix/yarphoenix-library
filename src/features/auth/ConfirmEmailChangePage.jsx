import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { loginModalOpened } from '../../shared/ui-state/uiSlice';
import { useConfirmEmailChangeMutation } from './authApi';
import './AuthPage.scss';

// Подтверждение смены почты (ТЗ §5.2.1): ссылка {frontend}/confirm-email-change
// приходит на НОВЫЙ адрес; смена гасит сессии, поэтому дальше — повторный вход.
export function ConfirmEmailChangePage() {
  const { t } = useStrings();
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmEmailChange] = useConfirmEmailChangeMutation();
  const [status, setStatus] = useState('pending');
  const started = useRef(false);

  const userId = params.get('userId');
  const token = params.get('token');
  const email = params.get('email');

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    if (!userId || !token || !email) {
      setStatus('error');
      return;
    }
    confirmEmailChange({ userId, token, newEmail: email })
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [confirmEmailChange, userId, token, email]);

  const openLogin = () => {
    navigate('/');
    dispatch(loginModalOpened());
  };

  const message =
    status === 'pending'
      ? t.confirmPending
      : status === 'success'
        ? t.emailChangedOk
        : t.confirmFail;
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
