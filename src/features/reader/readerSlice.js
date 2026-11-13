import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'yarphoenix.reader';

// Настройки чтения — клиентское UI-состояние (ТЗ §6.1): тема, шрифт, размер.
const defaults = { theme: 'light', font: 'serif', fontSize: 'md' };

const load = () => {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return defaults;
  }
};

const persist = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ theme: state.theme, font: state.font, fontSize: state.fontSize }),
  );
};

const readerSlice = createSlice({
  name: 'reader',
  initialState: load,
  reducers: {
    themeChanged(state, action) {
      state.theme = action.payload;
      persist(state);
    },
    fontChanged(state, action) {
      state.font = action.payload;
      persist(state);
    },
    fontSizeChanged(state, action) {
      state.fontSize = action.payload;
      persist(state);
    },
  },
});

export const { themeChanged, fontChanged, fontSizeChanged } = readerSlice.actions;
export const selectReaderSettings = (state) => state.reader;
export const readerReducer = readerSlice.reducer;

// Палитры тем читалки (дизайн: light / sepia / dark).
export const READER_THEMES = {
  light: { background: '#f9f8f4', color: '#343434' },
  sepia: { background: '#f4ecd8', color: '#4a3f2e' },
  dark: { background: '#211f1c', color: '#d8d4cc' },
};

export const READER_FONTS = {
  serif: "'Libre Baskerville', Georgia, serif",
  sans: "'Libre Franklin Variable', -apple-system, Arial, sans-serif",
};

export const READER_SIZES = { sm: '95%', md: '110%', lg: '130%' };
