import { Outlet } from 'react-router-dom';

import { LoginModal } from '../../features/auth/LoginModal';
import { Toast } from '../../shared/ui/Toast/Toast';
import { useDocumentTheme } from './useDocumentTheme';

// Оболочка полноэкранных маршрутов (читалка): без шапки, но с модалкой входа и тостами —
// иначе гостю негде войти, а сообщениям негде показаться.
export function BareLayout() {
  useDocumentTheme();

  return (
    <>
      <Outlet />
      <LoginModal />
      <Toast />
    </>
  );
}
