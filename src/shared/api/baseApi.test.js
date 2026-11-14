// @vitest-environment node
// Node-окружение: единый undici fetch/Request/AbortSignal (jsdom-версии конфликтуют
// с undici Request). DOM здесь не нужен — тест чисто про логику запросов и сессии.
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authReducer } from '../../features/auth/authSlice';
import { catalogApi } from '../../features/catalog/catalogApi';
import { baseApi } from './baseApi';
import { fetchWithAuth } from './fetchWithAuth';

// fetchBaseQuery захватывает global fetch на этапе загрузки модуля, поэтому ставим
// делегирующий fetch ДО импортов (vi.hoisted), а сам мок подменяем в каждом тесте.
const fetchRef = vi.hoisted(() => {
  const ref = { fn: () => Promise.reject(new Error('fetch not set')) };
  globalThis.fetch = (...args) => ref.fn(...args);

  // authSlice трогает localStorage уже на этапе загрузки (readStoredSession) — в
  // node-окружении его нет, поэтому ставим in-memory заглушку до импортов.
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  return ref;
});

const STORAGE_KEY = 'yarphoenix.auth';
const user = { id: 'u1' };
const emptyPage = { items: [], total: 0 };

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

// fetchBaseQuery передаёт в fetch объект Request, остальной код — (url, init).
const urlOf = (input) => (typeof input === 'string' ? input : input.url);
const authOf = (input, init) =>
  typeof input === 'string'
    ? new Headers(init?.headers).get('authorization')
    : input.headers.get('authorization');
const isRefresh = (input) => urlOf(input).includes('auth/refresh');

const makeStore = (authState) =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    preloadedState: { auth: authState },
  });

const expiredSession = () => ({ accessToken: 'old', refreshToken: 'r1', user });

beforeEach(() => {
  // Сессия пишется в localStorage при каждом обновлении — тесты не должны видеть чужую.
  localStorage.clear();
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
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'new', refreshToken: 'r2', user }))
      // Повтор исходного запроса — уже с новым токеном.
      .mockResolvedValueOnce(jsonResponse({ items: [{ externalId: 'ok' }], total: 1 }));
    fetchRef.fn = fetchMock;

    const store = makeStore(expiredSession());
    const result = await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 1 }));

    expect(result.data).toEqual({ items: [{ externalId: 'ok' }], total: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(isRefresh(fetchMock.mock.calls[1][0])).toBe(true);
    expect(store.getState().auth.accessToken).toBe('new');
  });

  it('ends the session when the server rejects the refresh token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid' }, 401));
    fetchRef.fn = fetchMock;

    const store = makeStore(expiredSession());
    await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 2 }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getState().auth.accessToken).toBeNull();
  });

  it('keeps the session when the refresh endpoint is unreachable', async () => {
    // Сеть упала посреди обновления: о судьбе сессии ничего не известно — разлогинивать нельзя.
    fetchRef.fn = vi.fn(async (input) => {
      if (isRefresh(input)) {
        throw new TypeError('network down');
      }
      return jsonResponse({ message: 'unauthorized' }, 401);
    });

    const store = makeStore(expiredSession());
    const result = await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 3 }));

    expect(result.error.status).toBe(401);
    expect(store.getState().auth.refreshToken).toBe('r1');
  });

  it('runs a single refresh for concurrent 401s and retries every request', async () => {
    let refreshCalls = 0;
    fetchRef.fn = vi.fn(async (input, init) => {
      if (isRefresh(input)) {
        refreshCalls += 1;
        // Обновление идёт дольше, чем приходят остальные 401 — запросы обязаны его дождаться.
        await new Promise((resolve) => setTimeout(resolve, 20));
        return jsonResponse({ accessToken: 'new', refreshToken: 'r2', user });
      }
      return authOf(input, init) === 'Bearer new'
        ? jsonResponse(emptyPage)
        : jsonResponse({ message: 'unauthorized' }, 401);
    });

    const store = makeStore(expiredSession());
    const results = await Promise.all(
      [11, 12, 13].map((page) => store.dispatch(catalogApi.endpoints.getBooks.initiate({ page }))),
    );

    expect(refreshCalls).toBe(1);
    expect(results.map((result) => result.data)).toEqual([emptyPage, emptyPage, emptyPage]);
    expect(store.getState().auth.refreshToken).toBe('r2');
  });

  it('adopts a session refreshed in another tab instead of spending its own token', async () => {
    // Другая вкладка уже обновила пару: в localStorage новая, в памяти этой вкладки — старая.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: 'fromOtherTab', refreshToken: 'r9', user }),
    );
    let refreshCalls = 0;
    fetchRef.fn = vi.fn(async (input, init) => {
      if (isRefresh(input)) {
        refreshCalls += 1;
        return jsonResponse({ message: 'reused' }, 401);
      }
      return authOf(input, init) === 'Bearer fromOtherTab'
        ? jsonResponse(emptyPage)
        : jsonResponse({ message: 'unauthorized' }, 401);
    });

    const store = makeStore(expiredSession());
    const result = await store.dispatch(catalogApi.endpoints.getBooks.initiate({ page: 21 }));

    expect(refreshCalls).toBe(0);
    expect(result.data).toEqual(emptyPage);
    expect(store.getState().auth.refreshToken).toBe('r9');
  });
});

describe('fetchWithAuth', () => {
  it('sends the bearer token and returns the response as is', async () => {
    const fetchMock = vi.fn(async () => new Response('book-bytes'));
    fetchRef.fn = fetchMock;

    const store = makeStore({ accessToken: 'valid', refreshToken: 'r1', user });
    const response = await store.dispatch(fetchWithAuth('library/books/b1/file'));

    expect(await response.text()).toBe('book-bytes');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(urlOf(fetchMock.mock.calls[0][0])).toContain('library/books/b1/file');
    expect(authOf(...fetchMock.mock.calls[0])).toBe('Bearer valid');
  });

  it('refreshes the session on 401 and repeats the request with the new token', async () => {
    fetchRef.fn = vi.fn(async (input, init) => {
      if (isRefresh(input)) {
        return jsonResponse({ accessToken: 'new', refreshToken: 'r2', user });
      }
      return authOf(input, init) === 'Bearer new'
        ? new Response('book-bytes')
        : jsonResponse({ message: 'unauthorized' }, 401);
    });

    const store = makeStore(expiredSession());
    const response = await store.dispatch(fetchWithAuth('library/books/b1/file'));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('book-bytes');
    expect(store.getState().auth.accessToken).toBe('new');
  });

  it('returns the 401 to the caller when there is no session to refresh', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: 'unauthorized' }, 401));
    fetchRef.fn = fetchMock;

    const store = makeStore({ accessToken: null, refreshToken: null, user: null });
    const response = await store.dispatch(fetchWithAuth('library/books/b1/file'));

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
