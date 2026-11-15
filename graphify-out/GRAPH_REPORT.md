# Graph Report - yarphoenix-library  (2026-11-15)

## Corpus Check
- 67 files · ~47,919 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .scss 16, (none) 2)

## Summary
- 468 nodes · 980 edges · 26 communities (19 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8978bcd3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- eslint.config.js
- AssistantPanel.jsx
- Layout & Header
- CI Workflow
- Reader & Epub Styling
- Book Page & Cards
- dependencies
- Catalog Page
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
- @testing-library/jest-dom
- screenshots/README.md
- @types/node@^26.6.6
- @types/react@^19.3.0

## God Nodes (most connected - your core abstractions)
1. `useStrings()` - 30 edges
2. `react` - 23 edges
3. `Button()` - 23 edges
4. `compilerOptions` - 18 edges
5. `react-router-dom` - 17 edges
6. `react-redux` - 13 edges
7. `useAppSelector` - 13 edges
8. `selectUser()` - 13 edges
9. `BookPage()` - 13 edges
10. `App()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Производительность каталога` --references--> `useBooksPage()`  [INFERRED]
  README.md → src/features/catalog/useBooksPage.ts
- `Правила, которые здесь соблюдаются` --references--> `fetchWithAuth()`  [INFERRED]
  AGENTS.md → src/shared/api/fetchWithAuth.ts
- `Правила, которые здесь соблюдаются` --references--> `fetchWithAuth()`  [INFERRED]
  CLAUDE.md → src/shared/api/fetchWithAuth.ts
- `Правила, которые здесь соблюдаются` --references--> `useBooksPage()`  [INFERRED]
  AGENTS.md → src/features/catalog/useBooksPage.ts
- `Правила, которые здесь соблюдаются` --references--> `useBooksPage()`  [INFERRED]
  CLAUDE.md → src/features/catalog/useBooksPage.ts

## Import Cycles
- None detected.

## Communities (26 total, 7 thin omitted)

### Community 0 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint@^10.14.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.14.0, typescript-eslint@^8.72.2, eslint, @eslint/js (+4 more)

### Community 1 - "AssistantPanel.jsx"
Cohesion: 0.53
Nodes (5): { useAskAssistantMutation }, AssistantPanel(), chipsFor(), templateLabel(), truncate()

### Community 2 - "Layout & Header"
Cohesion: 0.07
Nodes (31): react, react-redux, react-router-dom, App(), BareLayout(), Header(), initials(), Layout() (+23 more)

### Community 3 - "CI Workflow"
Cohesion: 0.06
Nodes (36): runs-on, steps, concurrency, cancel-in-progress, group, environment, if, needs (+28 more)

### Community 4 - "Reader & Epub Styling"
Cohesion: 0.08
Nodes (30): epubjs@^0.3.93, epubjs, absolutizeUrls(), APP_FONT_FAMILIES, applyReaderStyles(), buildReaderCss(), collectFontFaceCss(), tameOffscreenElements() (+22 more)

### Community 5 - "Book Page & Cards"
Cohesion: 0.12
Nodes (26): lucide-react, useAppDispatch, useAppSelector, selectUser(), BookPage(), BookCard, BookCardProps, coverUrl() (+18 more)

### Community 6 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, @fontsource/libre-baskerville@^5.2.5, @fontsource-variable/libre-franklin@^5.2.5, lucide-react@^1.23.0, react@^19.2.7, react-dom@^19.2.7, react-redux@^9.2.0, react-router-dom@^7.6.0 (+3 more)

### Community 7 - "Catalog Page"
Cohesion: 0.22
Nodes (9): CatalogPage(), CatalogSkeleton(), prefersReducedMotion(), shuffle(), GENRES, pageWindow(), Pagination(), initial (+1 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, checkJs, isolatedModules, jsx, lib, module, moduleResolution (+11 more)

### Community 9 - "types.ts"
Cohesion: 0.08
Nodes (30): assistantApi, authApi, BooksQuery, catalogApi, libraryApi, ProgressUpdate, ShelfPatch, baseApi (+22 more)

### Community 10 - "Prettier Config"
Cohesion: 0.11
Nodes (17): arrowParens, bracketSameLine, bracketSpacing, embeddedLanguageFormatting, endOfLine, htmlWhitespaceSensitivity, jsxSingleQuote, printWidth (+9 more)

### Community 11 - "authSlice.ts"
Cohesion: 0.08
Nodes (32): @reduxjs/toolkit@^2.8.2, @reduxjs/toolkit, AppDispatch, RootState, store, authReducer, authSlice, AuthState (+24 more)

### Community 12 - "YarPhoenix Library — фронтенд"
Cohesion: 0.07
Nodes (27): YarPhoenix Library — Frontend, Деплой (ТЗ §11), Правила, которые здесь соблюдаются, Проверка в браузере, Сеть на этой машине (важно), Стек и команды, Структура (feature-sliced, ТЗ §6), graphify (+19 more)

### Community 13 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, jsdom@^25.0.1, openapi-typescript@^7.13.0, @testing-library/dom@^10.4.1, @testing-library/react@^16.3.2, typescript@^5.9.3, vite@^7.0.0, jsdom (+5 more)

### Community 14 - "npm Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, format:check, gen:api, lint, preview (+2 more)

### Community 15 - "package.json"
Cohesion: 0.18
Nodes (10): prettier@^3.5.0, sass@^1.86.0, @types/react-dom@^19.3.0, name, private, type, version, prettier (+2 more)

### Community 16 - "OpenAPI Schema"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 17 - "vitest"
Cohesion: 0.40
Nodes (4): @vitejs/plugin-react@^5.0.0, vitest@^3.2.7, @vitejs/plugin-react, vitest

### Community 18 - "Code Style — YarPhoenix Library (Frontend)"
Cohesion: 0.15
Nodes (11): 1. JavaScript / TypeScript / JSX formatting (mirrors Prettier), 2.1. TypeScript, 2. React conventions, 3.1. One declaration per line, 3.2. One blank line between rulesets, 3. CSS / SCSS structure (NOT enforced by Prettier — apply manually), 4. BEM naming for classes, Code Style — YarPhoenix Library (Frontend) (+3 more)

## Knowledge Gaps
- **4 isolated node(s):** `{ useAskAssistantMutation }`, `{
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
}`, `{ useGetBooksQuery, useGetBookQuery }`, `{
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
}`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Layout & Header` to `AssistantPanel.jsx`, `Reader & Epub Styling`, `Book Page & Cards`, `dependencies`, `Catalog Page`, `types.ts`, `package.json`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `{ useAskAssistantMutation }`, `{
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
}`, `{ useGetBooksQuery, useGetBookQuery }` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Layout & Header` be split into smaller, more focused modules?**
  _Cohesion score 0.06873706004140787 - nodes in this community are weakly interconnected._
- **Why does `@reduxjs/toolkit` connect `authSlice.ts` to `Layout & Header`, `Reader & Epub Styling`, `Book Page & Cards`, `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `CI Workflow` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Why does `useBooksPage()` connect `YarPhoenix Library — фронтенд` to `types.ts`, `Catalog Page`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `Reader & Epub Styling` be split into smaller, more focused modules?**
  _Cohesion score 0.07804878048780488 - nodes in this community are weakly interconnected._