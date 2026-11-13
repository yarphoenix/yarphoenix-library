import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { Input } from '../../shared/ui/Input/Input';
import { loginModalOpened } from '../../shared/ui-state/uiSlice';
import { useResetPasswordMutation } from './authApi';
import './AuthPage.scss';

// Страница из письма сброса пароля (ТЗ §5.2): {frontend}/reset-password?userId=..&token=..
export function ResetPasswordPage() {
  const { t } = useStrings();
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('form');
  const [error, setError] = useState(null);

  const userId = params.get('userId');
  const token = params.get('token');

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!userId || !token) {
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setError(t.confirmPassword);
      return;
    }
    try {
      await resetPassword({ userId, token, newPassword: password }).unwrap();
      setStatus('success');
    } catch (err) {
      setError(err?.data?.message ?? t.resetFail);
    }
  };

  const openLogin = () => {
    navigate('/');
    dispatch(loginModalOpened());
  };

  return (
    <section className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">{t.resetTitle}</h1>

        {status === 'success' ? (
          <>
            <p className="auth-page__message auth-page__message--success">{t.resetOk}</p>
            <Button variant="primary" className="auth-page__action" onClick={openLogin}>
              {t.goToLogin}
            </Button>
          </>
        ) : status === 'error' ? (
          <p className="auth-page__message auth-page__message--error">{t.resetFail}</p>
        ) : (
          <>
            <p className="auth-page__message">{t.resetSub}</p>
            <form className="auth-page__form" onSubmit={submit}>
              <Input
                label={t.newPassword}
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label={t.confirmPassword}
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <p className="auth-page__message auth-page__message--error">{error}</p>}
              <Button
                type="submit"
                variant="primary"
                className="auth-page__action"
                disabled={isLoading}
              >
                {t.resetSubmit}
              </Button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
