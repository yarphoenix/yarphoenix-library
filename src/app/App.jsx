import { Route, Routes } from 'react-router-dom';

import { BookPage } from '../features/book/BookPage';
import { ConfirmEmailPage } from '../features/auth/ConfirmEmailPage';
import { ConfirmEmailChangePage } from '../features/auth/ConfirmEmailChangePage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { LibraryPage } from '../features/library/LibraryPage';
import { ReaderPage } from '../features/reader/ReaderPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { BareLayout } from './layout/BareLayout';
import { Layout } from './layout/Layout';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="books/:provider/:externalId" element={<BookPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="confirm-email" element={<ConfirmEmailPage />} />
        <Route path="confirm-email-change" element={<ConfirmEmailChangePage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      {/* Читалка — полноэкранная: без шапки, но с модалкой входа и тостами. */}
      <Route element={<BareLayout />}>
        <Route path="reader/:bookId" element={<ReaderPage />} />
      </Route>
    </Routes>
  );
}
