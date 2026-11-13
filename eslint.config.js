import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Форматирование — зона Prettier; ESLint здесь ловит ошибки логики и правила хуков.
export default defineConfig([
  // schema.d.ts генерируется из OpenAPI (`npm run gen:api`) — руками не правится и не линтится.
  globalIgnores(['dist', 'coverage', 'src/shared/api/schema.d.ts']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Ядро ESLint не видит использование компонента в JSX — имена с заглавной не считаем мёртвыми.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // TypeScript: парсер и рекомендованные правила typescript-eslint поверх общих.
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      // Базовое правило не понимает типы и перегрузки — его заменяет версия typescript-eslint.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' },
      ],
      // Импорты типов — только через `import type` (то же требует verbatimModuleSyntax).
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    // Конфиги исполняются в Node, а не в браузере.
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
