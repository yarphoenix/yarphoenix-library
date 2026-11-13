/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API. Не задан или пустая строка → '/api' (dev-прокси Vite). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
