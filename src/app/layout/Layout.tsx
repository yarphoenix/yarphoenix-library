import { Outlet } from 'react-router-dom';

import { LoginModal } from '../../features/auth/LoginModal';
import { Toast } from '../../shared/ui/Toast/Toast';
import { Header } from './Header';
import { useDocumentTheme } from './useDocumentTheme';

export function Layout() {
  useDocumentTheme();

  return (
    <>
      <Header />
      <Outlet />
      <LoginModal />
      <Toast />
    </>
  );
}
