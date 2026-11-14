import { apiBaseUrl } from './config';
import { ensureFreshSession, selectSession, type SessionStore } from './session';

/**
 * Запрос к API в обход RTK Query — для бинарных ответов (файл книги), которым не место
 * в Redux-кэше. Авторизация и обновление сессии те же, что у baseApi: 401 → одно общее
 * обновление пары токенов → одна повторная попытка.
 *
 * Это thunk: `const response = await dispatch(fetchWithAuth('library/books/…/file'))`.
 */
export const fetchWithAuth =
  (path: string, init: RequestInit = {}) =>
  async (
    dispatch: SessionStore['dispatch'],
    getState: SessionStore['getState'],
  ): Promise<Response> => {
    const store: SessionStore = { dispatch, getState };

    const send = (token: string | null) => {
      const headers = new Headers(init.headers);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return fetch(`${apiBaseUrl}/${path}`, { ...init, headers });
    };

    const tokenUsed = selectSession(store).accessToken;
    const response = await send(tokenUsed);
    if (response.status !== 401 || !(await ensureFreshSession(store, tokenUsed))) {
      return response;
    }
    return send(selectSession(store).accessToken);
  };
