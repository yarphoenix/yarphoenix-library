import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'yarphoenix.language';
const THEME_KEY = 'yarphoenix.theme';

const initialLanguage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'ru' ? saved : 'ru';
};

const initialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  // Первый заход — уважаем системную настройку.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    language: initialLanguage(),
    theme: initialTheme(),
    toast: null,
    loginModalOpen: false,
  },
  reducers: {
    languageChanged(state, action) {
      state.language = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
    themeChanged(state, action) {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
    },
    loginModalOpened(state) {
      state.loginModalOpen = true;
    },
    loginModalClosed(state) {
      state.loginModalOpen = false;
    },
    toastShown(state, action) {
      state.toast = action.payload;
    },
    toastDismissed(state) {
      state.toast = null;
    },
  },
});

export const {
  languageChanged,
  themeChanged,
  toastShown,
  toastDismissed,
  loginModalOpened,
  loginModalClosed,
} = uiSlice.actions;

export const selectLanguage = (state) => state.ui.language;
export const selectTheme = (state) => state.ui.theme;
export const selectToast = (state) => state.ui.toast;
export const selectLoginModalOpen = (state) => state.ui.loginModalOpen;

export const uiReducer = uiSlice.reducer;
