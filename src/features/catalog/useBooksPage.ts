import { useState } from 'react';

import { useGetBooksQuery, type BooksQuery } from './catalogApi';

// Держит на экране последний непустой результат, пока грузится следующая страница, —
// сетка не размонтируется в пустоту (паттерн keepPreviousData).
export function useBooksPage(args: BooksQuery) {
  const result = useGetBooksQuery(args);
  const [previous, setPrevious] = useState(result.data);

  // Запоминаем свежий результат прямо в рендере (а не эффектом): без лишнего прохода
  // рендера с устаревшим `previous`.
  if (result.data !== undefined && result.data !== previous) {
    setPrevious(result.data);
  }

  return { ...result, data: result.data ?? previous };
}
