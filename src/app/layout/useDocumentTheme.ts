import { useEffect } from 'react';

import { selectTheme } from '../../shared/ui-state/uiSlice';
import { useAppSelector } from '../hooks';

// Общесайтовая тема живёт на <html> через data-theme (токены — CSS-переменные).
// Нужен каждой оболочке маршрутов: при прямом заходе в читалку обычный Layout не монтируется.
export function useDocumentTheme(): void {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
