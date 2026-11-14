import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';

import { apiBaseUrl } from './config';
import { ensureFreshSession, selectSession } from './session';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, api) => {
    const token = selectSession(api).accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Эндпоинты, для которых 401 — ответ по существу, а не «протух access token».
const isAuthEndpoint = (args: string | FetchArgs): boolean =>
  typeof args === 'object' && /^auth\/(login|refresh|register)/.test(args.url);

// 401 → общее на все запросы обновление пары токенов (shared/api/session.ts) и одна
// повторная попытка. Сервер отверг refresh-токен → сессия закрывается.
const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const tokenUsed = selectSession(api).accessToken;
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !isAuthEndpoint(args) &&
    (await ensureFreshSession(api, tokenUsed))
  ) {
    result = await rawBaseQuery(args, api, extraOptions);
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
