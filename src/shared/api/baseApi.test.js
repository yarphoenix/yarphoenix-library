// @vitest-environment node
// Node-окружение: единый undici fetch/Request/AbortSignal (jsdom-версии конфликтуют
// с undici Request). DOM здесь не нужен — тест чисто про логику baseQuery.
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authReducer } from '../../features/auth/authSlice';
import { catalogApi } from '../../features/catalog/catalogApi';
import { baseApi } from './baseApi';

// fetchBaseQuery захватывает global fetch на этапе загрузки модуля, поэтому ставим
// делегирующий fetch ДО импортов (vi.hoisted), а сам мок подменяем в каждом тесте.
const fetchRef = vi.hoisted(() => {
  const ref = { fn: () => Promise.reject(new Error('fetch not set')) };
  globalThis.fetch = (...args) => ref.fn(...args);

  // authSlice трогает localStorage уже на этапе загрузки (loadSession) — в node-окружении
  // его нет, поэтому ставим in-memory заглушку до импортов.
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  return ref;
});

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const makeStore = (authState) =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    preloadedState: { auth: authState },
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('baseApi reauth', () => {
  it('refreshes tokens on 401 and retries the original request', async () => {
    const fetchMock = vi
      .fn()
      // Исходный запрос → 401 (access-token протух).
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      // Обновление пары токенов.
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'new', refreshToken: 'r2', user: { id: 'u1' } }),
      )
      // Повтор исходного запроса — уже с новым токеном.
      .mockResolvedValueOnce(jsonResponse({ items: [{ externalId: 'ok' }], total: 1 }));
    fetchRef.fn = fetchMock;

    const store = makeStore({ accessToken: 'old', refreshToken: 'r1', user: { id: 'u1' } });
    const result = await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 1 }));

    expect(result.data).toEqual({ items: [{ externalId: 'ok' }], total: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0].url).toContain('auth/refresh');
    expect(store.getState().auth.accessToken).toBe('new');
  });

  it('ends the session when the refresh fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid' }, 401));
    fetchRef.fn = fetchMock;

    const store = makeStore({ accessToken: 'old', refreshToken: 'r1', user: { id: 'u1' } });
    // Другой arg (page: 2), чтобы не попасть в кэш прошлого теста.
    await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 2 }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getState().auth.accessToken).toBeNull();
  });
});
