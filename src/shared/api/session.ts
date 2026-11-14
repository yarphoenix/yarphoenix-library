import type { UnknownAction } from '@reduxjs/toolkit';

import {
  readStoredSession,
  sessionEnded,
  sessionStarted,
  type AuthState,
} from '../../features/auth/authSlice';
import { apiBaseUrl } from './config';
import type { TokenPair } from './types';

// Слою API из всего состояния нужна только сессия. Тип описан структурно: сам store
// зависит от baseApi, и импорт RootState сюда замкнул бы типы в кольцо.
type WithAuth = { auth: AuthState };

// Минимум от store для работы с сессией: подходит и `api` из baseQuery, и аргументы thunk-а.
export type SessionStore = {
  getState: () => unknown;
  dispatch: (action: UnknownAction) => unknown;
};

export const selectSession = (store: Pick<SessionStore, 'getState'>): AuthState =>
  (store.getState() as WithAuth).auth;

const REFRESH_LOCK = 'yarphoenix.auth.refresh';

type RefreshOutcome =
  | { kind: 'refreshed'; tokens: TokenPair }
  // Сервер отверг refresh-токен: сессии больше нет.
  | { kind: 'rejected' }
  // Сеть или сервер недоступны: о судьбе сессии ничего не известно, закрывать её нельзя.
  | { kind: 'unavailable' };

async function requestNewTokens(refreshToken: string): Promise<RefreshOutcome> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (response.ok) {
      return { kind: 'refreshed', tokens: (await response.json()) as TokenPair };
    }
    return response.status === 400 || response.status === 401
      ? { kind: 'rejected' }
      : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}

async function performRefresh(store: SessionStore): Promise<boolean> {
  const { refreshToken } = selectSession(store);
  if (!refreshToken) {
    return false;
  }

  // Пока мы ждали блокировку, пару могла обновить другая вкладка — тогда в localStorage уже
  // новая. Берём её и не предъявляем свой, уже погашенный, refresh-токен: повторное
  // предъявление сервер считает кражей и закрывает все сессии пользователя.
  const stored = readStoredSession();
  if (stored && stored.refreshToken !== refreshToken) {
    store.dispatch(sessionStarted(stored));
    return true;
  }

  const outcome = await requestNewTokens(refreshToken);
  if (outcome.kind === 'refreshed') {
    store.dispatch(sessionStarted(outcome.tokens));
    return true;
  }
  if (outcome.kind === 'rejected') {
    store.dispatch(sessionEnded());
  }
  return false;
}

// Web Locks сериализует обновление между вкладками. Там, где API нет, остаётся защита
// в пределах вкладки (refreshInFlight).
async function withCrossTabLock(task: () => Promise<boolean>): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return task();
  }
  return await navigator.locks.request(REFRESH_LOCK, task);
}

// Одно обновление на вкладку: все запросы, получившие 401 одновременно, ждут один и тот же
// промис, а не шлют refresh каждый сам за себя.
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Вызывается после ответа 401. `tokenUsed` — access-токен, с которым ушёл неудачный запрос.
 * Возвращает true, если в store теперь свежая сессия и запрос стоит повторить.
 */
export function ensureFreshSession(
  store: SessionStore,
  tokenUsed: string | null,
): Promise<boolean> {
  const { accessToken, refreshToken } = selectSession(store);

  // Пока запрос летел, сессию уже обновили — повторяем с новым токеном, без второго refresh.
  if (accessToken && accessToken !== tokenUsed) {
    return Promise.resolve(true);
  }
  if (!refreshToken) {
    return Promise.resolve(false);
  }

  refreshInFlight ??= withCrossTabLock(() => performRefresh(store)).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
