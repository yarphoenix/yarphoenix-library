# Graph Report - yarphoenix-library  (2026-11-15)

## Corpus Check
- 80 files · ~52,389 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .scss 19, (none) 2)

## Summary
- 526 nodes · 1154 edges · 29 communities (25 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `64aa5a98`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- eslint.config.js
- useStrings.ts
- Layout & Header
- CI Workflow
- Reader & Epub Styling
- Book Page & Cards
- dependencies
- CatalogPage.tsx
- TypeScript Config
- types.ts
- Prettier Config
- authSlice.ts
- YarPhoenix Library — фронтенд
- devDependencies
- npm Scripts
- package.json
- OpenAPI Schema
- vitest
- Code Style — YarPhoenix Library (Frontend)
- Auth Hooks
- Book Query Hooks
- Library Hooks
- catalogApi.ts
- screenshots/README.md
- CatalogPage.test.tsx
- CatalogSearch.tsx
- useCatalogParams.ts
- YarPhoenix Library — Frontend
- Pagination.tsx

## God Nodes (most connected - your core abstractions)
1. `useStrings()` - 38 edges
2. `react` - 27 edges
3. `Button()` - 23 edges
4. `react-router-dom` - 21 edges
5. `compilerOptions` - 18 edges
6. `CatalogPage()` - 17 edges
7. `useAppSelector` - 16 edges
8. `LibraryPage()` - 14 edges
9. `selectUser()` - 13 edges
10. `BookPage()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Правила, которые здесь соблюдаются` --references--> `coverUrl()`  [INFERRED]
  AGENTS.md → src/features/catalog/coverUrl.ts
- `Правила, которые здесь соблюдаются` --references--> `coverUrl()`  [INFERRED]
  CLAUDE.md → src/features/catalog/coverUrl.ts
- `Правила, которые здесь соблюдаются` --references--> `useCatalogParams()`  [INFERRED]
  AGENTS.md → src/features/catalog/useCatalogParams.ts
- `Правила, которые здесь соблюдаются` --references--> `useCatalogParams()`  [INFERRED]
  CLAUDE.md → src/features/catalog/useCatalogParams.ts
- `Правила, которые здесь соблюдаются` --references--> `countLabel()`  [INFERRED]
  AGENTS.md → src/shared/i18n/plural.ts

## Import Cycles
- None detected.

## Communities (29 total, 4 thin omitted)

### Community 0 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint@^10.14.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.14.0, typescript-eslint@^8.72.2, eslint, @eslint/js (+4 more)

### Community 1 - "useStrings.ts"
Cohesion: 0.13
Nodes (17): { useAskAssistantMutation }, AssistantPanel(), chipsFor(), templateLabel(), truncate(), countLabel(), NUMBERS, pickForm() (+9 more)

### Community 2 - "Layout & Header"
Cohesion: 0.08
Nodes (27): react, react-redux, react-router-dom, App(), BareLayout(), Header(), initials(), Layout() (+19 more)

### Community 3 - "CI Workflow"
Cohesion: 0.06
Nodes (36): runs-on, steps, concurrency, cancel-in-progress, group, environment, if, needs (+28 more)

### Community 4 - "Reader & Epub Styling"
Cohesion: 0.07
Nodes (38): YarPhoenix Library — Frontend, Деплой (ТЗ §11), Правила, которые здесь соблюдаются, Проверка в браузере, Сеть на этой машине (важно), Стек и команды, Структура (feature-sliced, ТЗ §6), Правила, которые здесь соблюдаются (+30 more)

### Community 5 - "Book Page & Cards"
Cohesion: 0.11
Nodes (30): lucide-react, useAppDispatch, useAppSelector, selectUser(), BookPage(), BookCard, BookCardProps, CoverSize (+22 more)

### Community 6 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @fontsource/libre-baskerville@^5.2.5, @fontsource-variable/libre-franklin@^5.2.5, lucide-react@^1.23.0, react@^19.2.7, react-dom@^19.2.7, react-redux@^9.2.0, react-router-dom@^7.6.0 (+5 more)

### Community 7 - "CatalogPage.tsx"
Cohesion: 0.26
Nodes (6): CatalogPage(), CatalogSkeleton(), GENRES, ScopeSwitch(), ErrorNotice(), ErrorNoticeProps

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, checkJs, isolatedModules, jsx, lib, module, moduleResolution (+11 more)

### Community 9 - "types.ts"
Cohesion: 0.08
Nodes (29): assistantApi, authApi, libraryApi, ProgressUpdate, ShelfPatch, { dispatch }, openLibrary(), reader (+21 more)

### Community 10 - "Prettier Config"
Cohesion: 0.11
Nodes (17): arrowParens, bracketSameLine, bracketSpacing, embeddedLanguageFormatting, endOfLine, htmlWhitespaceSensitivity, jsxSingleQuote, printWidth (+9 more)

### Community 11 - "authSlice.ts"
Cohesion: 0.08
Nodes (29): AppDispatch, RootState, store, authReducer, authSlice, AuthState, empty, readStoredSession() (+21 more)

### Community 12 - "YarPhoenix Library — фронтенд"
Cohesion: 0.17
Nodes (11): AI-ассистент без спойлеров, i18n, YarPhoenix Library — фронтенд, Два мира контента, Деплой, Каталог: два режима, Локальный запуск, Скриншоты (+3 more)

### Community 13 - "devDependencies"
Cohesion: 0.12
Nodes (15): devDependencies, jsdom@^25.0.1, openapi-typescript@^7.13.0, prettier@^3.5.0, @testing-library/jest-dom@^6.9.1, @types/react@^19.3.0, typescript@^5.9.3, vite@^7.0.0 (+7 more)

### Community 14 - "npm Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, format:check, gen:api, lint, preview (+2 more)

### Community 15 - "package.json"
Cohesion: 0.15
Nodes (12): sass@^1.86.0, @testing-library/dom@^10.4.1, @types/node@^26.6.6, @types/react-dom@^19.3.0, name, private, type, version (+4 more)

### Community 16 - "OpenAPI Schema"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 17 - "vitest"
Cohesion: 0.40
Nodes (4): @vitejs/plugin-react@^5.0.0, vitest@^3.2.7, @vitejs/plugin-react, vitest

### Community 18 - "Code Style — YarPhoenix Library (Frontend)"
Cohesion: 0.15
Nodes (11): 1. JavaScript / TypeScript / JSX formatting (mirrors Prettier), 2.1. TypeScript, 2. React conventions, 3.1. One declaration per line, 3.2. One blank line between rulesets, 3. CSS / SCSS structure (NOT enforced by Prettier — apply manually), 4. BEM naming for classes, Code Style — YarPhoenix Library (Frontend) (+3 more)

### Community 22 - "catalogApi.ts"
Cohesion: 0.21
Nodes (7): BooksQuery, catalogApi, CatalogScope, ScopeSwitchProps, BookDetails, BookList, BookRef

### Community 24 - "CatalogPage.test.tsx"
Cohesion: 0.20
Nodes (10): Производительность каталога, BooksPage, CatalogState, emma, lastQuery(), openCatalog(), refetch, showCatalog() (+2 more)

### Community 25 - "CatalogSearch.tsx"
Cohesion: 0.31
Nodes (8): CatalogSearch(), CatalogSearchProps, prefersReducedMotion(), shuffle(), initial, TypewriterPhrase, TypewriterState, useTypewriter()

### Community 26 - "useCatalogParams.ts"
Cohesion: 0.33
Nodes (7): @testing-library/react@^16.3.2, @testing-library/react, Change, parsePage(), setOrDelete(), renderAt(), useCatalogParams()

### Community 27 - "YarPhoenix Library — Frontend"
Cohesion: 0.25
Nodes (7): graphify, YarPhoenix Library — Frontend, Деплой (ТЗ §11), Проверка в браузере, Сеть на этой машине (важно), Стек и команды, Структура (feature-sliced, ТЗ §6)

### Community 28 - "Pagination.tsx"
Cohesion: 0.50
Nodes (4): PageItem, pageWindow(), Pagination(), PaginationProps

## Knowledge Gaps
- **4 isolated node(s):** `{ useGetBooksQuery, useGetBookQuery }`, `{
  useGetShelfQuery,
  useLookupBookQuery,
  useGetLibraryBookQuery,
  useUploadBookMutation,
  useGetLibraryStatsQuery,
  useAddToLibraryMutation,
  useStartReadingMutation,
  useUpdateShelfMutation,
  useRemoveFromLibraryMutation,
  useUpdateProgressMutation,
}`, `{ useAskAssistantMutation }`, `{
  useLoginMutation,
  useRegisterMutation,
  useConfirmEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangeEmailMutation,
  useConfirmEmailChangeMutation,
  useDeleteAccountMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
}`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Layout & Header` to `useStrings.ts`, `Reader & Epub Styling`, `Book Page & Cards`, `dependencies`, `CatalogPage.tsx`, `package.json`, `catalogApi.ts`, `CatalogSearch.tsx`, `useCatalogParams.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `{ useGetBooksQuery, useGetBookQuery }`, `{
  useGetShelfQuery,
  useLookupBookQuery,
  useGetLibraryBookQuery,
  useUploadBookMutation,
  useGetLibraryStatsQuery,
  useAddToLibraryMutation,
  useStartReadingMutation,
  useUpdateShelfMutation,
  useRemoveFromLibraryMutation,
  useUpdateProgressMutation,
}`, `{ useAskAssistantMutation }` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useStrings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Why does `useBooksPage()` connect `CatalogPage.test.tsx` to `Reader & Epub Styling`, `catalogApi.ts`, `CatalogPage.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Layout & Header` be split into smaller, more focused modules?**
  _Cohesion score 0.07932692307692307 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Layout & Header` to `Book Page & Cards`, `dependencies`, `types.ts`, `package.json`, `CatalogPage.test.tsx`, `useCatalogParams.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `CI Workflow` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._