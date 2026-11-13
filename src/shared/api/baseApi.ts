import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';

import { sessionEnded, sessionStarted, type AuthState } from '../../features/auth/authSlice';
import type { TokenPair } from './types';

// В dev запросы идут через прокси Vite (/api → 127.0.0.1:5080);
// в проде базовый URL бэкенда зашивается в сборку через VITE_API_URL (ТЗ §11.3).
const baseUrl = import.meta.env.VITE_API_URL || '/api';

// Слою API из всего состояния нужна только сессия. Тип описан структурно: сам store
// зависит от baseApi, и импорт RootState сюда замкнул бы типы в кольцо.
type WithAuth = { auth: AuthState };

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as WithAuth).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Эндпоинты, для которых 401 — ответ по существу, а не «протух access token».
const isAuthEndpoint = (args: string | FetchArgs): boolean =>
  typeof args === 'object' && /^auth\/(login|refresh|register)/.test(args.url);

// 401 → одна попытка обновить пару токенов и повторить исходный запрос;
// refresh не удался → сессия закрывается.
const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const { refreshToken } = (api.getState() as WithAuth).auth;
  if (result.error?.status === 401 && refreshToken && !isAuthEndpoint(args)) {
    const refresh = await rawBaseQuery(
      { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
      api,
      extraOptions,
    );

    if (refresh.data) {
      api.dispatch(sessionStarted(refresh.data as TokenPair));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(sessionEnded());
    }
  }

  return result;
};

// Единый API-слой: фичи добавляют эндпоинты через injectEndpoints.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Profile', 'Library', 'LibraryStats'],
  endpoints: () => ({}),
});
