import { useEffect, useState } from 'react';

import { useGetBooksQuery } from './catalogApi';

// Держит на экране последний непустой результат, пока грузится следующая страница, —
// сетка не размонтируется в пустоту (паттерн keepPreviousData).
export function useBooksPage(args) {
  const result = useGetBooksQuery(args);
  const [previous, setPrevious] = useState(result.data);

  useEffect(() => {
    if (result.data !== undefined) {
      setPrevious(result.data);
    }
  }, [result.data]);

  return { ...result, data: result.data ?? previous };
}
