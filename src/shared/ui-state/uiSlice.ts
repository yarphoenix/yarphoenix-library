import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Language } from '../i18n/strings';

const STORAGE_KEY = 'yarphoenix.language';
const THEME_KEY = 'yarphoenix.theme';

export type Theme = 'light' | 'dark';

export type UiState = {
  language: Language;
  theme: Theme;
  // Текст всплывающего уведомления; null — тост скрыт.
  toast: string | null;
  loginModalOpen: boolean;
};

// Селекторам нужен только свой срез — описываем его структурно, без типа всего store.
type WithUi = { ui: UiState };

const initialLanguage = (): Language => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'ru' ? saved : 'ru';
};

const initialTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  // Первый заход — уважаем системную настройку.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: UiState = {
  language: initialLanguage(),
  theme: initialTheme(),
  toast: null,
  loginModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    languageChanged(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
    themeChanged(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
    },
    loginModalOpened(state) {
      state.loginModalOpen = true;
    },
    loginModalClosed(state) {
      state.loginModalOpen = false;
    },
    toastShown(state, action: PayloadAction<string>) {
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

export const selectLanguage = (state: WithUi) => state.ui.language;
export const selectTheme = (state: WithUi) => state.ui.theme;
export const selectToast = (state: WithUi) => state.ui.toast;
export const selectLoginModalOpen = (state: WithUi) => state.ui.loginModalOpen;

export const uiReducer = uiSlice.reducer;
