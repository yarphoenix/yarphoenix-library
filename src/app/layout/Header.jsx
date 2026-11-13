import { Library, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../../features/auth/authApi';
import { selectUser } from '../../features/auth/authSlice';
import logo from '../../shared/assets/yarphoenix-logo.svg';
import { useStrings } from '../../shared/i18n/useStrings';
import { Button } from '../../shared/ui/Button/Button';
import {
  languageChanged,
  loginModalOpened,
  selectLanguage,
  selectTheme,
  themeChanged,
  toastShown,
} from '../../shared/ui-state/uiSlice';
import './Header.scss';

const initials = (nickname = '') =>
  nickname
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || '?';

export function Header() {
  const { t } = useStrings();
  const language = useSelector(selectLanguage);
  const theme = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logout] = useLogoutMutation();

  // Библиотека — единственная страница с полноширинным лейаутом (сайдбар прижат
  // к краю вьюпорта, не в центрированную колонку, как каталог/книга/настройки).
  // Шапка на ней остаётся полноширинной, чтобы лого совпадало с краем сайдбара.
  const isFullWidthPage = location.pathname.startsWith('/library');

  const doLogout = async () => {
    setMenuOpen(false);
    const refreshToken = JSON.parse(localStorage.getItem('yarphoenix.auth') ?? '{}')?.refreshToken;
    await logout(refreshToken);
    dispatch(toastShown(t.toastOut));
    navigate('/');
  };

  return (
    <header className="header">
      <div className={`header__inner ${isFullWidthPage ? 'header__inner--full' : ''}`}>
        <Link to="/" className="header__logo-link">
          <img
            className="header__logo"
            src={logo}
            alt="YarPhoenix Library"
            width={182}
            height={40}
          />
        </Link>

        <div className="header__spacer" />

        <button
          type="button"
          className="header__theme"
          onClick={() => dispatch(themeChanged(theme === 'dark' ? 'light' : 'dark'))}
          aria-label={t.theme}
          title={t.theme}
        >
          {theme === 'dark' ? (
            <Sun size={18} strokeWidth={1.9} />
          ) : (
            <Moon size={18} strokeWidth={1.9} />
          )}
        </button>

        <div className="header__lang">
          <button
            type="button"
            className={`header__lang-option ${language === 'en' ? 'header__lang-option--active' : ''}`}
            onClick={() => dispatch(languageChanged('en'))}
          >
            EN
          </button>
          <button
            type="button"
            className={`header__lang-option ${language === 'ru' ? 'header__lang-option--active' : ''}`}
            onClick={() => dispatch(languageChanged('ru'))}
          >
            RU
          </button>
        </div>

        {user ? (
          <div
            className="header__account"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className={`header__avatar ${user.avatarUrl ? 'header__avatar--image' : ''}`}
              onClick={() => navigate('/settings')}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user.avatarUrl ? (
                <img className="header__avatar-img" src={user.avatarUrl} alt={user.nickname} />
              ) : (
                initials(user.nickname)
              )}
            </button>

            {menuOpen && (
              <div className="header__menu" role="menu">
                <div className="header__menu-profile">
                  <span className="header__menu-signed">{t.signedInAs}</span>
                  <span className="header__menu-name">{user.nickname}</span>
                  <span className="header__menu-email">{user.email}</span>
                </div>
                <Link
                  to="/settings"
                  className="header__menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={17} strokeWidth={1.9} />
                  {t.menuSettings}
                </Link>
                <Link
                  to="/library"
                  className="header__menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Library size={17} strokeWidth={1.9} />
                  {t.menuLibrary}
                </Link>
                <div className="header__menu-divider" />
                <button
                  type="button"
                  className="header__menu-item header__menu-item--logout"
                  onClick={doLogout}
                >
                  <LogOut size={17} strokeWidth={1.9} />
                  {t.logout}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={() => dispatch(loginModalOpened())}>
            {t.login}
          </Button>
        )}
      </div>
    </header>
  );
}
