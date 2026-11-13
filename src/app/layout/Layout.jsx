import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import { LoginModal } from '../../features/auth/LoginModal';
import { Toast } from '../../shared/ui/Toast/Toast';
import { selectTheme } from '../../shared/ui-state/uiSlice';
import { Header } from './Header';

export function Layout() {
  const theme = useSelector(selectTheme);

  // Общесайтовая тема живёт на <html> через data-theme (ТЗ: токены в CSS-переменных).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Header />
      <Outlet />
      <LoginModal />
      <Toast />
    </>
  );
}
