import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDeleteAvatarMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '../auth/authApi';
import { selectUser } from '../auth/authSlice';
import { GENRES } from '../catalog/genres';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import { Input } from '../../shared/ui/Input/Input';
import { languageChanged, toastShown } from '../../shared/ui-state/uiSlice';
import './SettingsPage.scss';

const initials = (nickname = '') =>
  nickname
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || '?';

// Настройки профиля (ТЗ §5.2.1): аватар, никнейм, жанры, язык, смена пароля.
export function SettingsPage() {
  const { t, lang } = useStrings();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [genres, setGenres] = useState(user?.favoriteGenres ?? []);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const avatarInputRef = useRef(null);
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: removingAvatar }] = useDeleteAvatarMutation();

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [changeEmail, { isLoading: changingEmail }] = useChangeEmailMutation();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  if (!user) {
    return (
      <section className="settings">
        <p className="settings__guest">{t.toastGuestAdd}</p>
      </section>
    );
  }

  const toggleGenre = (key) => {
    setGenres((prev) => (prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]));
  };

  const onAvatarPicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      await uploadAvatar(file).unwrap();
      dispatch(toastShown(t.toastSaved));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const removeAvatar = async () => {
    try {
      await deleteAvatar().unwrap();
      dispatch(toastShown(t.toastSaved));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const save = async () => {
    try {
      await updateProfile({ nickname, favoriteGenres: genres, uiLanguage: lang }).unwrap();
      dispatch(toastShown(t.toastSaved));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const submitPassword = async () => {
    if (!pwCurrent || !pwNew || pwNew !== pwConfirm) {
      dispatch(toastShown(t.confirmPassword));
      return;
    }
    try {
      // Логин-смена пароля требует текущий пароль — не токенный сброс (ТЗ §5.2.1).
      await changePassword({ currentPassword: pwCurrent, newPassword: pwNew }).unwrap();
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      dispatch(toastShown(t.toastPw));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const submitEmail = async () => {
    try {
      // Смена почты подтверждается по ссылке на НОВЫЙ адрес (ТЗ §5.2.1).
      await changeEmail({ newEmail, currentPassword: emailPassword }).unwrap();
      setNewEmail('');
      setEmailPassword('');
      dispatch(toastShown(t.emailChangeSent));
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      setDeleteOpen(false);
      dispatch(toastShown(t.toastDeleted));
      navigate('/');
    } catch (err) {
      dispatch(toastShown(err?.data?.message ?? t.catalogError));
    }
  };

  return (
    <section className="settings">
      <div className="settings__head">
        <h1 className="settings__title">{t.settingsTitle}</h1>
        <Button variant="primary" onClick={save} disabled={isLoading}>
          {t.save}
        </Button>
      </div>

      <div className="settings__card">
        <h2 className="settings__section">{t.account}</h2>

        <h3 className="settings__label">{t.avatar}</h3>
        <div className="settings__avatar">
          <span className="settings__avatar-preview">
            {user.avatarUrl ? (
              <img className="settings__avatar-img" src={user.avatarUrl} alt={user.nickname} />
            ) : (
              initials(user.nickname)
            )}
          </span>
          <div className="settings__avatar-controls">
            <div className="settings__avatar-buttons">
              <Button
                variant="secondary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar || removingAvatar}
              >
                {t.avatarUpload}
              </Button>
              {user.avatarUrl && (
                <button
                  type="button"
                  className="settings__avatar-remove"
                  onClick={removeAvatar}
                  disabled={uploadingAvatar || removingAvatar}
                >
                  {t.avatarRemove}
                </button>
              )}
            </div>
            <p className="settings__hint">{t.avatarHint}</p>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="settings__avatar-input"
            onChange={onAvatarPicked}
          />
        </div>

        <div className="settings__nickname">
          <Input
            label={t.nickname}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <h3 className="settings__label">{t.favGenres}</h3>
        <p className="settings__hint">{t.favGenresHint}</p>
        <div className="settings__genres">
          {GENRES.map((genre) => (
            <label key={genre.key} className="settings__genre">
              <input
                type="checkbox"
                checked={genres.includes(genre.key)}
                onChange={() => toggleGenre(genre.key)}
              />
              <span>{genre[lang]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings__card">
        <h2 className="settings__section">{t.security}</h2>
        <div className="settings__passwords">
          <Input
            label={t.currentPassword}
            type="password"
            autoComplete="current-password"
            value={pwCurrent}
            onChange={(e) => setPwCurrent(e.target.value)}
          />
          <span />
          <Input
            label={t.newPassword}
            type="password"
            autoComplete="new-password"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
          />
          <Input
            label={t.confirmPassword}
            type="password"
            autoComplete="new-password"
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          disabled={changingPassword || !pwCurrent || !pwNew || pwNew !== pwConfirm}
          onClick={submitPassword}
        >
          {t.changePassword}
        </Button>
      </div>

      <div className="settings__card">
        <h2 className="settings__section">{t.email}</h2>
        <p className="settings__current-email">{user.email}</p>
        <div className="settings__passwords">
          <Input
            label={t.newEmail}
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            label={t.currentPassword}
            type="password"
            autoComplete="current-password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          disabled={changingEmail || !newEmail || !emailPassword}
          onClick={submitEmail}
        >
          {t.changeEmail}
        </Button>
      </div>

      <div className="settings__card">
        <h2 className="settings__section">{t.preferences}</h2>
        <h3 className="settings__label">{t.language}</h3>
        <div className="settings__langs">
          <button
            type="button"
            className={`settings__lang ${lang === 'en' ? 'settings__lang--active' : ''}`}
            onClick={() => dispatch(languageChanged('en'))}
          >
            English
          </button>
          <button
            type="button"
            className={`settings__lang ${lang === 'ru' ? 'settings__lang--active' : ''}`}
            onClick={() => dispatch(languageChanged('ru'))}
          >
            Русский
          </button>
        </div>
      </div>

      <div className="settings__card settings__card--danger">
        <h2 className="settings__section">{t.dangerZone}</h2>
        <p className="settings__hint">{t.deleteWarn}</p>
        <button type="button" className="settings__delete" onClick={() => setDeleteOpen(true)}>
          {t.deleteProfile}
        </button>
      </div>

      {deleteOpen && (
        <div className="settings__modal" onClick={() => setDeleteOpen(false)}>
          <div className="settings__modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="settings__modal-title">{t.deleteConfirmTitle}</h3>
            <p className="settings__hint">{t.deleteWarn}</p>
            <Input
              label={t.password}
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="settings__modal-actions">
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                {t.cancel}
              </Button>
              <button
                type="button"
                className="settings__delete"
                disabled={deleting || !deletePassword}
                onClick={confirmDelete}
              >
                {t.deleteForever}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
