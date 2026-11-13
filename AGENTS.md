# YarPhoenix Library — Frontend

Портфолио-проект: веб-сервис для чтения книг с каталогом, личной библиотекой и AI-ассистентом.
Это **фронтенд**; бэкенд (ASP.NET Core) живёт в `C:\Users\yarik\RiderProjects\yarphoenix-library-api`.

Требования: ТЗ `C:\Users\yarik\Downloads\YarPhoenix-Library-TechSpec-EN.md` — архитектурные решения в нём
**приняты и не пересматриваются** (см. шапку документа). Перф-паттерны каталога:
`C:\Users\yarik\Downloads\Catalog-Performance-Guide.md`. Дизайн-система (токены, 16 компонентов, UI-кит
экранов): архив `C:\Users\yarik\OneDrive\Рабочий стол\Новая папка\YarPhoenix Library Design System.zip`.

## Стек и команды

React 19 + Vite 7, react-router-dom, Redux Toolkit / RTK Query, SCSS (BEM), lucide-react, epub.js.

```bash
npm run dev          # дев-сервер на 3000; /api проксируется на бэкенд 127.0.0.1:5080
npm run build        # прод-сборка в dist/
npx prettier --check "src/**/*.{js,jsx,scss,css}"   # то же гоняет CI
```

Бэкенд для локальной работы: `cd ../../RiderProjects/yarphoenix-library-api && docker compose up -d postgres minio && dotnet run --project src/YarPhoenix.Api` (порт 5080).

## Сеть на этой машине (важно)

- VPN/прокси включён всегда (`HTTP(S)_PROXY=127.0.0.1:10809`). Он влияет на резолвинг `localhost`,
  поэтому в vite.config.js стоит `server.host: true` и `strictPort` — **не убирать**; локальные адреса
  писать как `127.0.0.1`, не `localhost`. Для curl-диагностики: `curl --noproxy '*' ...`.
- openlibrary.org/archive.org заблокированы провайдером — ходят только через прокси (бэкенд-задача).

## Структура (feature-sliced, ТЗ §6)

```
src/app/        store.js, роутер, layout (Header)
src/features/   catalog, book, auth, library, reader, settings, assistant — по фиче, не по типу
src/shared/     api/ (базовый query + reauth), i18n/ (strings.js RU+EN), ui/ (Button, Input, BookCover, Toast), ui-state/ (uiSlice: язык, тосты, модалка входа)
src/styles/     дизайн-токены (CSS-переменные из дизайн-системы) + база
```

## Правила, которые здесь соблюдаются

- **Код-стайл и BEM**: `.Codex/rules/code-style.md` (обязателен; Prettier зеркалит `.prettierrc.json`,
  но структуру CSS и BEM он не чинит — писать правильно сразу).
- **Состояние (ТЗ §6.1)**: серверные данные — только RTK Query (никаких ручных thunk-фетчей);
  клиентский UI-стейт — slices (`uiSlice`, `readerSlice`). Кэш RTK Query ключуется аргументом запроса.
- **Каталог (перф-гайд)**: `page`/`q`/`genre` живут в URL (`useSearchParams`), не в useState;
  `useBooksPage` держит предыдущие данные при загрузке (никаких «мигающих» размонтирований —
  грид димится классом `--loading`); карточки в `memo`, key — id книги; обложки Open Library
  размера `M` с `loading="lazy"` и плейсхолдером (часть записей OL без обложек — это норма).
- **Два мира контента (ТЗ §1.1)**: каталог — метаданные/витрина; читалка и ассистент работают
  только при `hasReadableFile` (файл в MinIO). Кнопка «Читать» и панель ассистента не должны
  появляться у книг без файла. Не «улучшать» слиянием миров.
- **i18n**: все строки — в `src/shared/i18n/strings.js` парой RU/EN; язык в localStorage
  (`yarphoenix.language`) и в профиле пользователя.
- **Auth**: токены в localStorage `yarphoenix.auth`; refresh-ротация в базовом query
  (`src/shared/api`); 401 → одна попытка refresh → logout.
- **Дизайн**: только токены (`var(--...)`), без сырых hex; иконки — lucide-react (эмодзи запрещены
  дизайн-системой); serif (Libre Baskerville) для заголовков, sans (Libre Franklin) для UI.

## Деплой (ТЗ §11)

GitHub Pages через `.github/workflows/frontend.yml`: prettier-check → build → deploy на push в main/master.
`VITE_BASE=/yarphoenix-library/` и SPA-трюк `404.html` уже в пайплайне; `VITE_API_URL` берётся из
repo variables (Settings → Variables → API_URL). Роутер берёт basename из `import.meta.env.BASE_URL`.

## Проверка в браузере

Превью-сервер настроен в `.Codex/launch.json` (имя `frontend`). Быстрый вход для проверки
авторизованных страниц: POST `/api/auth/login` с `reader@example.com` / `password123` (dev-юзер),
положить ответ в localStorage `yarphoenix.auth` и перезагрузить страницу.
