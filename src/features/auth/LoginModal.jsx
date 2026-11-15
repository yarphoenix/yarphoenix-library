import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { Input } from '../../shared/ui/Input/Input';
import { loginModalClosed, selectLoginModalOpen, toastShown } from '../../shared/ui-state/uiSlice';
import { useForgotPasswordMutation, useLoginMutation, useRegisterMutation } from './authApi';
import './LoginModal.scss';

export function LoginModal() {
  const open = useSelector(selectLoginModalOpen);
  const dispatch = useDispatch();
  const { t } = useStrings();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();
  const [forgotPassword, { isLoading: sendingReset }] = useForgotPasswordMutation();
  const busy = loggingIn || registering || sendingReset;

  if (!open) {
    return null;
  }

  const close = () => {
    dispatch(loginModalClosed());
    setError(null);
    setNotice(null);
    setPassword('');
    setMode('login');
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === 'forgot') {
        // Ответ всегда одинаковый — не раскрываем, существует ли адрес (ТЗ §5.2).
        await forgotPassword(email).unwrap();
        setNotice(t.forgotSent);
        return;
      }
      if (mode === 'register') {
        await register({ email, password, nickname: nickname || null }).unwrap();
      }
      // Регистрация сразу продолжается входом — отдельного шага не нужно.
      await login({ email, password }).unwrap();
      dispatch(toastShown(t.toastIn));
      close();
    } catch (err) {
      const fallback =
        mode === 'forgot' ? t.actionError : mode === 'register' ? t.registerError : t.loginError;
      setError(err?.data?.message ?? fallback);
    }
  };

  const title = mode === 'forgot' ? t.forgotTitle : t.loginTitle;
  const subtitle = mode === 'forgot' ? t.forgotSub : t.loginSub;

  return (
    <div className="login-modal" onClick={close}>
      <div className="login-modal__card" onClick={(event) => event.stopPropagation()}>
        <h2 className="login-modal__title">{title}</h2>
        <p className="login-modal__subtitle">{subtitle}</p>

        <form className="login-modal__form" onSubmit={submit}>
          {mode === 'register' && (
            <Input
              label={t.nickname}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="nickname"
            />
          )}
          <Input
            label={t.email}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPh}
            autoComplete="email"
          />
          {mode !== 'forgot' && (
            <Input
              label={t.password}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPh}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          )}

          {mode === 'login' && (
            <button
              type="button"
              className="login-modal__forgot"
              onClick={() => switchMode('forgot')}
            >
              {t.forgotLink}
            </button>
          )}

          {error && <p className="login-modal__error">{error}</p>}
          {notice && <p className="login-modal__notice">{notice}</p>}

          <Button type="submit" variant="primary" disabled={busy} className="login-modal__submit">
            {mode === 'register' ? t.createAccount : mode === 'forgot' ? t.forgotSend : t.signIn}
          </Button>
        </form>

        {mode === 'forgot' ? (
          <button type="button" className="login-modal__switch" onClick={() => switchMode('login')}>
            {t.backToLogin}
          </button>
        ) : (
          <button
            type="button"
            className="login-modal__switch"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? t.noAccount : t.haveAccount}
          </button>
        )}
      </div>
    </div>
  );
}
