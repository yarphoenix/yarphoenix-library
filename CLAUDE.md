# YarPhoenix Library — Frontend

Портфолио-проект: веб-сервис для чтения книг с каталогом, личной библиотекой и AI-ассистентом.
Это **фронтенд**; бэкенд (ASP.NET Core) живёт в `C:\Users\yarik\RiderProjects\yarphoenix-library-api`.

Требования: ТЗ `C:\Users\yarik\Downloads\YarPhoenix-Library-TechSpec-EN.md` — архитектурные решения в нём
**приняты и не пересматриваются** (см. шапку документа). Перф-паттерны каталога:
`C:\Users\yarik\Downloads\Catalog-Performance-Guide.md`. Дизайн-система (токены, 16 компонентов, UI-кит
экранов): архив `C:\Users\yarik\OneDrive\Рабочий стол\Новая папка\YarPhoenix Library Design System.zip`.

## Стек и команды

React 19 + Vite 7, TypeScript 5.9 (strict; идёт поэтапная миграция с JS, `allowJs`), react-router-dom,
Redux Toolkit / RTK Query, SCSS (BEM), lucide-react, epub.js. TypeScript закреплён на ветке 5.x:
`openapi-typescript` требует `^5`, `typescript-eslint` — `<6.1`; обновлять до 6/7 только вместе с ними.

```bash
npm run dev          # дев-сервер на 3000; /api проксируется на бэкенд 127.0.0.1:5080
npm run build        # прод-сборка в dist/
npm run format:check # Prettier по src (js/jsx/ts/tsx/scss/css); то же гоняет CI
npm run lint         # ESLint (правила хуков React); CI падает на любой ошибке
npm run typecheck    # tsc --noEmit; CI падает на любой ошибке типов
npm test             # юнит-тесты (Vitest)
npm run gen:api      # перегенерировать src/shared/api/schema.d.ts из OpenAPI бэкенда (он должен быть запущен)
```

Бэкенд для локальной работы: `cd ../../RiderProjects/yarphoenix-library-api && docker compose up -d postgres minio && dotnet run --project src/YarPhoenix.Api` (порт 5080).

## Сеть на этой машине (важно)

- VPN/прокси включён всегда (`HTTP(S)_PROXY=127.0.0.1:10809`). Он влияет на резолвинг `localhost`,
  поэтому в vite.config.js стоит `server.host: true` и `strictPort` — **не убирать**; локальные адреса
  писать как `127.0.0.1`, не `localhost`. Для curl-диагностики: `curl --noproxy '*' ...`.
- openlibrary.org заблокирован провайдером — бэкенд ходит к нему (а также к gutenberg.org и
  standardebooks.org за текстами коллекции) только через прокси; фронтенда это не касается.

## Структура (feature-sliced, ТЗ §6)

```
src/app/        store.ts, hooks.ts, роутер (App.jsx), layout/ (Layout — с шапкой; BareLayout — полноэкранный, для читалки)
src/features/   catalog, book, auth, library, reader, settings, assistant — по фиче, не по типу
src/shared/     api/ (базовый query + reauth, schema.d.ts из OpenAPI, types.ts), i18n/ (strings.ts RU+EN, plural.ts), ui/ (Button, Input, BookCover, ErrorNotice, Toast), ui-state/ (uiSlice: язык, тосты, модалка входа)
src/styles/     дизайн-токены (CSS-переменные из дизайн-системы) + база
```

## Правила, которые здесь соблюдаются

- **Код-стайл и BEM**: `.claude/rules/code-style.md` (обязателен; Prettier зеркалит `.prettierrc.json`,
  но структуру CSS и BEM он не чинит — писать правильно сразу).
- **TypeScript**: новые и существенно переписываемые файлы — сразу `.ts/.tsx` (правила — в code-style.md §2.1).
  DTO бэкенда руками не описывать: брать из `src/shared/api/types.ts` (алиасы над сгенерированным
  `schema.d.ts`); после изменения контрактов бэкенда — `npm run gen:api` и закоммитить результат.
  В `.ts/.tsx` — `useAppDispatch`/`useAppSelector` из `src/app/hooks.ts`.
- **Состояние (ТЗ §6.1)**: серверные данные — только RTK Query (никаких ручных thunk-фетчей);
  клиентский UI-стейт — slices (`uiSlice`, `readerSlice`). Кэш RTK Query ключуется аргументом запроса.
- **Каталог (перф-гайд)**: `page`/`q`/`genre`/`scope` живут в URL, не в useState; читать и менять
  их только через `useCatalogParams` (умолчания в адрес не пишутся; смена запроса, жанра или
  режима сбрасывает страницу). `useBooksPage` держит предыдущие данные при загрузке (никаких
  «мигающих» размонтирований — грид димится классом `--loading`); карточки в `memo`, key — id
  книги; обложки Open Library размера `M` с `loading="lazy"`.
- **Обложки**: адрес — только через `coverUrl`. Он добавляет `?default=false`: без него Open
  Library на отсутствующую обложку отвечает пустой картинкой 1×1 с кодом 200, `onError` не
  срабатывает и `BookCover` не рисует типографскую заглушку (название и автор на «переплёте»).
  В карточках, где название стоит рядом текстом, обложка идёт с `decorative`.
- **Два мира контента (ТЗ §1.1)**: каталог — метаданные/витрина; читалка и ассистент работают
  только при `hasReadableFile` (файл в MinIO). Кнопка «Читать» и панель ассистента не должны
  появляться у книг без файла. Не «улучшать» слиянием миров. У загруженного пользователем EPUB
  каталожной страницы нет (файл не привязывается к общей записи) — его карточка в библиотеке
  ведёт сразу в читалку (`LibraryCard`).
- **Читаемая коллекция** (решение владельца, отступление от ТЗ §5.1.2 — источник текстов не
  Internet Archive, а Standard Ebooks / Project Gutenberg): `GET /catalog/books` по умолчанию
  отдаёт только книги, которые можно читать, из БД бэкенда; `scope=all` — живой поиск по всему
  Open Library, где читаемые помечены `isReadable`. Режим выбирает переключатель «Можно читать /
  Вся Open Library» (`ScopeSwitch`, параметр `scope` в URL); метка «можно читать» на карточке
  нужна только в `scope=all` — в коллекции читается всё. Язык интерфейса в запрос каталога не
  отправляется и выдачу не фильтрует. Темы и описания приходят уже очищенными — на фронтенде
  чистку не дублировать.
- **i18n**: все строки, включая подписи для экранной читалки (`aria-label`), — в
  `src/shared/i18n/strings.ts` парой RU/EN (парность ключей проверяет tsc); язык в localStorage
  (`yarphoenix.language`) и в профиле пользователя. Число с подписью («1 885 книг найдено») —
  только через `countLabel` из `plural.ts`: формы слова лежат в словаре как
  `forms({ one, few, many, other })`.
- **Auth**: токены в localStorage `yarphoenix.auth`; refresh-ротация — в `src/shared/api/session.ts`:
  один refresh на все параллельные 401 и на все вкладки (`navigator.locks` + перечитывание сессии
  из localStorage). 401 → одна попытка refresh → повтор запроса; logout — только если сервер отверг
  refresh-токен (сбой сети или 5xx сессию не рвут). Запросы мимо RTK Query (файл книги) — через
  `fetchWithAuth`, не голым `fetch`.
- **Читалка**: жизненный цикл epub.js — в `features/reader/useEpubReader.ts`. Эффект открытия книги
  не должен зависеть от токена, настроек и записи книги в кэше — иначе книга пересоздаётся и позиция
  откатывается. Оформление текста — только через `epubStyles.ts` (хук `rendition.hooks.content`),
  не через `rendition.themes`. Закрытие книги — через `closeBook` (голый `book.destroy()` может
  бросить исключение и уронить приложение).
- **Данные на страницах одной сущности** (книга, читалка): брать `currentData`, а не `data`, и
  считать загрузкой `isFetching` без данных — иначе при смене книги видна прошлая, а после ошибки
  не показывается скелетон. То же для полки библиотеки (`currentData` полки, а не `data`).
- **Ошибки и пустые состояния**: «не загрузилось», «загружается» и «пусто» — три разных экрана.
  Ошибку загрузки показывать через `shared/ui/ErrorNotice` с кнопкой «Повторить»: `block` — когда
  показать нечего, `banner` — над данными, оставшимися с прошлого раза (прямо сказать, что они
  прежние, и не показывать по ним счётчики). Запасной текст ошибки у каждой фичи свой
  (`catalogError`, `libraryError`, `uploadError`, `settingsError`, `loginError`, …), а не один
  на всё приложение.
- **Дизайн**: только токены (`var(--...)`), без сырых hex; иконки — lucide-react (эмодзи запрещены
  дизайн-системой); serif (Libre Baskerville) для заголовков, sans (Libre Franklin) для UI.

## Деплой (ТЗ §11)

GitHub Pages через `.github/workflows/frontend.yml`: prettier-check → lint → typecheck → тесты → build → deploy на push в main/master.
`VITE_BASE=/yarphoenix-library/` и SPA-трюк `404.html` уже в пайплайне; `VITE_API_URL` берётся из
repo variables (Settings → Variables → API_URL). Роутер берёт basename из `import.meta.env.BASE_URL`.

## Проверка в браузере

Превью-сервер настроен в `.claude/launch.json` (имя `frontend`). Быстрый вход для проверки
авторизованных страниц: POST `/api/auth/login` с `reader@example.com` / `password123` (dev-юзер),
положить ответ в localStorage `yarphoenix.auth` и перезагрузить страницу.

Читалку проверять при **видимой** панели браузера: epub.js работает через `requestAnimationFrame`,
в скрытой панели кадров нет и книга «вечно готовится» — это не баг приложения.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
