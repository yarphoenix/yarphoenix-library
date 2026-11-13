import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'yarphoenix.auth';

const loadSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.accessToken && parsed?.refreshToken && parsed?.user ? parsed : null;
  } catch {
    return null;
  }
};

const persist = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
    }),
  );
};

const empty = { accessToken: null, refreshToken: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: () => loadSession() ?? empty,
  reducers: {
    // payload — TokenResponse бэкенда: { accessToken, refreshToken, user, expiresIn }.
    sessionStarted(state, action) {
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
    userUpdated(state, action) {
      state.user = action.payload;
      persist(state);
    },
  },
});

export const { sessionStarted, sessionEnded, userUpdated } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthed = (state) => Boolean(state.auth.accessToken);

export const authReducer = authSlice.reducer;
