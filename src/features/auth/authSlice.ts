import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '../../shared/api/types';

const STORAGE_KEY = 'yarphoenix.auth';

// Действующая сессия: пара токенов и профиль. Ответ бэкенда (TokenPair) ей соответствует.
export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

// Селекторам нужен только свой срез — описываем его структурно, без типа всего store.
type WithAuth = { auth: AuthState };

const empty: AuthState = { accessToken: null, refreshToken: null, user: null };

// Сессия из localStorage. Нужна не только при старте: по ней видно, что пару токенов
// уже обновила другая вкладка (см. shared/api/session.ts).
export const readStoredSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthState> | null;
    return parsed?.accessToken && parsed.refreshToken && parsed.user
      ? {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          user: parsed.user,
        }
      : null;
  } catch {
    return null;
  }
};

const persist = (state: AuthState) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
    }),
  );
};

const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => readStoredSession() ?? empty,
  reducers: {
    sessionStarted(state, action: PayloadAction<Session>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      persist(state);
    },
    sessionEnded(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    userUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
  },
});

export const { sessionStarted, sessionEnded, userUpdated } = authSlice.actions;

export const selectUser = (state: WithAuth) => state.auth.user;
export const selectIsAuthed = (state: WithAuth) => Boolean(state.auth.accessToken);

export const authReducer = authSlice.reducer;
