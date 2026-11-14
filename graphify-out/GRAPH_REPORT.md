# Graph Report - yarphoenix-library  (2026-11-14)

## Corpus Check
- Corpus is ~46,925 words - fits in a single context window. You may not need a graph.

## Summary
- 422 nodes · 924 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Lint & Tooling Config
- App Shell & Assistant UI
- Layout & Header
- CI Workflow
- Reader & Epub Styling
- Book Page & Cards
- Dependency Manifest
- Catalog Page
- TypeScript Config
- Auth API & Types
- Prettier Config
- Base API & Reauth
- Catalog API & Tests
- Auth Slice
- npm Scripts
- Library API
- OpenAPI Schema
- Assistant API
- Vite Env Types
- Auth Hooks
- Book Query Hooks
- Library Hooks

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
- `Header()` --indirect_call--> `selectUser()`  [INFERRED]
  src/app/layout/Header.jsx → src/features/auth/authSlice.ts
- `LibraryPage()` --indirect_call--> `selectUser()`  [INFERRED]
  src/features/library/LibraryPage.jsx → src/features/auth/authSlice.ts
- `ReaderPage()` --indirect_call--> `selectUser()`  [INFERRED]
  src/features/reader/ReaderPage.tsx → src/features/auth/authSlice.ts
- `SettingsPage()` --indirect_call--> `selectUser()`  [INFERRED]
  src/features/settings/SettingsPage.jsx → src/features/auth/authSlice.ts
- `useStrings()` --indirect_call--> `selectLanguage()`  [INFERRED]
  src/shared/i18n/useStrings.ts → src/shared/ui-state/uiSlice.ts

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "Lint & Tooling Config"
Cohesion: 0.06
Nodes (45): devDependencies, eslint@^10.14.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.14.0, jsdom@^25.0.1, openapi-typescript@^7.13.0 (+37 more)

### Community 1 - "App Shell & Assistant UI"
Cohesion: 0.11
Nodes (25): react, react-router-dom, App(), useAppSelector, { useAskAssistantMutation }, AssistantPanel(), chipsFor(), templateLabel() (+17 more)

### Community 2 - "Layout & Header"
Cohesion: 0.10
Nodes (21): BareLayout(), Header(), initials(), Layout(), useDocumentTheme(), LoginModal(), Dictionary, en (+13 more)

### Community 3 - "CI Workflow"
Cohesion: 0.06
Nodes (36): runs-on, steps, concurrency, cancel-in-progress, group, environment, if, needs (+28 more)

### Community 4 - "Reader & Epub Styling"
Cohesion: 0.09
Nodes (26): absolutizeUrls(), APP_FONT_FAMILIES, applyReaderStyles(), buildReaderCss(), collectFontFaceCss(), chipClass(), Option, defaults (+18 more)

### Community 5 - "Book Page & Cards"
Cohesion: 0.15
Nodes (15): lucide-react, useAppDispatch, selectUser(), BookPage(), BookCard, BookCardProps, coverUrl(), LibraryCard() (+7 more)

### Community 6 - "Dependency Manifest"
Cohesion: 0.11
Nodes (19): dependencies, epubjs@^0.3.93, @fontsource/libre-baskerville@^5.2.5, @fontsource-variable/libre-franklin@^5.2.5, lucide-react@^1.23.0, react@^19.2.7, react-dom@^19.2.7, react-redux@^9.2.0 (+11 more)

### Community 7 - "Catalog Page"
Cohesion: 0.17
Nodes (10): CatalogPage(), CatalogSkeleton(), prefersReducedMotion(), shuffle(), GENRES, pageWindow(), Pagination(), useBooksPage() (+2 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, checkJs, isolatedModules, jsx, lib, module, moduleResolution (+11 more)

### Community 9 - "Auth API & Types"
Cohesion: 0.18
Nodes (15): authApi, BookSummary, ChangeEmailRequest, ChangePasswordRequest, ConfirmEmailChangeRequest, ConfirmEmailRequest, DeleteAccountRequest, LoginRequest (+7 more)

### Community 10 - "Prettier Config"
Cohesion: 0.11
Nodes (17): arrowParens, bracketSameLine, bracketSpacing, embeddedLanguageFormatting, endOfLine, htmlWhitespaceSensitivity, jsxSingleQuote, printWidth (+9 more)

### Community 11 - "Base API & Reauth"
Cohesion: 0.24
Nodes (12): baseQueryWithReAuth(), isAuthEndpoint(), rawBaseQuery, apiBaseUrl, ensureFreshSession(), performRefresh(), RefreshOutcome, requestNewTokens() (+4 more)

### Community 12 - "Catalog API & Tests"
Cohesion: 0.13
Nodes (11): authReducer, BooksQuery, catalogApi, emptyPage, fetchRef, isRefresh(), urlOf(), user (+3 more)

### Community 13 - "Auth Slice"
Cohesion: 0.20
Nodes (8): @reduxjs/toolkit@^2.8.2, @reduxjs/toolkit, authSlice, AuthState, empty, readStoredSession(), Session, WithAuth

### Community 14 - "npm Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, format:check, gen:api, lint, preview (+2 more)

### Community 15 - "Library API"
Cohesion: 0.29
Nodes (6): libraryApi, ProgressUpdate, ShelfPatch, LibraryBook, LibraryStats, UpdateShelfRequest

### Community 16 - "OpenAPI Schema"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 17 - "Assistant API"
Cohesion: 0.40
Nodes (4): assistantApi, baseApi, AskAssistantRequest, AssistantAnswer

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
  These have ≤1 connection - possible missing edges. (Counts symbols only; 163 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Shell & Assistant UI` to `Lint & Tooling Config`, `Layout & Header`, `Reader & Epub Styling`, `Book Page & Cards`, `Dependency Manifest`, `Catalog Page`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
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
  _4 weakly-connected nodes found - possible missing edges._
- **Should `Lint & Tooling Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06292517006802721 - nodes in this community are weakly interconnected._
- **Why does `@reduxjs/toolkit` connect `Auth Slice` to `Lint & Tooling Config`, `Layout & Header`, `Reader & Epub Styling`, `Book Page & Cards`, `Dependency Manifest`, `Base API & Reauth`, `Catalog API & Tests`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `App Shell & Assistant UI` be split into smaller, more focused modules?**
  _Cohesion score 0.11479591836734694 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `App Shell & Assistant UI` to `Lint & Tooling Config`, `Layout & Header`, `Book Page & Cards`, `Dependency Manifest`, `Catalog Page`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `Layout & Header` be split into smaller, more focused modules?**
  _Cohesion score 0.09871794871794871 - nodes in this community are weakly interconnected._