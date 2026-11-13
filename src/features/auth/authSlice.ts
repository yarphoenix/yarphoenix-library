import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TokenPair, User } from '../../shared/api/types';

const STORAGE_KEY = 'yarphoenix.auth';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

// Селекторам нужен только свой срез — описываем его структурно, без типа всего store.
type WithAuth = { auth: AuthState };

const empty: AuthState = { accessToken: null, refreshToken: null, user: null };

const loadSession = (): AuthState | null => {
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
  initialState: (): AuthState => loadSession() ?? empty,
  reducers: {
    sessionStarted(state, action: PayloadAction<TokenPair>) {
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
