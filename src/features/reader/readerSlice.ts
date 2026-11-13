import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'yarphoenix.reader';

// Палитры тем читалки (дизайн: light / sepia / dark). Значения уходят в iframe epub.js,
// где CSS-переменные приложения недоступны, поэтому здесь конкретные цвета.
export const READER_THEMES = {
  light: { background: '#f9f8f4', color: '#343434' },
  sepia: { background: '#f4ecd8', color: '#4a3f2e' },
  dark: { background: '#211f1c', color: '#d8d4cc' },
} as const;

export const READER_FONTS = {
  serif: "'Libre Baskerville', Georgia, serif",
  sans: "'Libre Franklin Variable', -apple-system, Arial, sans-serif",
} as const;

export const READER_SIZES = { sm: '95%', md: '110%', lg: '130%' } as const;

export type ReaderTheme = keyof typeof READER_THEMES;
export type ReaderFont = keyof typeof READER_FONTS;
export type ReaderFontSize = keyof typeof READER_SIZES;

// Настройки чтения — клиентское UI-состояние (ТЗ §6.1): тема, шрифт, размер.
export type ReaderSettings = {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: ReaderFontSize;
};

const defaults: ReaderSettings = { theme: 'light', font: 'serif', fontSize: 'md' };

const isKeyOf = <T extends object>(map: T, value: unknown): value is keyof T =>
  typeof value === 'string' && Object.hasOwn(map, value);

// В localStorage может лежать что угодно (старая версия, ручная правка): неизвестное
// значение заменяем дефолтом, иначе читалка получила бы тему, которой нет в палитре.
const load = (): ReaderSettings => {
  try {
    const saved = (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {}) as Record<
      string,
      unknown
    >;
    const { theme, font, fontSize } = saved;
    return {
      theme: isKeyOf(READER_THEMES, theme) ? theme : defaults.theme,
      font: isKeyOf(READER_FONTS, font) ? font : defaults.font,
      fontSize: isKeyOf(READER_SIZES, fontSize) ? fontSize : defaults.fontSize,
    };
  } catch {
    return defaults;
  }
};

const persist = (state: ReaderSettings) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ theme: state.theme, font: state.font, fontSize: state.fontSize }),
  );
};

const readerSlice = createSlice({
  name: 'reader',
  initialState: load,
  reducers: {
    themeChanged(state, action: PayloadAction<ReaderTheme>) {
      state.theme = action.payload;
      persist(state);
    },
    fontChanged(state, action: PayloadAction<ReaderFont>) {
      state.font = action.payload;
      persist(state);
    },
    fontSizeChanged(state, action: PayloadAction<ReaderFontSize>) {
      state.fontSize = action.payload;
      persist(state);
    },
  },
});

export const { themeChanged, fontChanged, fontSizeChanged } = readerSlice.actions;
export const selectReaderSettings = (state: { reader: ReaderSettings }) => state.reader;
export const readerReducer = readerSlice.reducer;
