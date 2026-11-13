# YarPhoenix Library — фронтенд

Веб-сервис для чтения книг: каталог, личная библиотека, читалка EPUB и AI-ассистент.
Это **фронтенд** (React + Vite). Бэкенд (ASP.NET Core, модульный монолит) — в
[отдельном репозитории](https://github.com/yarphoenix/yarphoenix-library-api).

> Портфолио-проект. Цель — показать инженерную зрелость: осознанно простая архитектура,
> честная работа с внешними данными и с юридической чистотой (два «мира» контента, см. ниже),
> а не набор баззвордов.

## Скриншоты

| Каталог | Страница книги | Читалка + ассистент |
|---|---|---|
| ![Каталог](docs/screenshots/catalog.png) | ![Книга](docs/screenshots/book.png) | ![Читалка](docs/screenshots/reader.png) |

| Библиотека | Настройки | Тёмная тема |
|---|---|---|
| ![Библиотека](docs/screenshots/library.png) | ![Настройки](docs/screenshots/settings.png) | ![Тёмная тема](docs/screenshots/catalog-dark.png) |

## Стек

- **React 19 + Vite 7**, react-router-dom.
- **Redux Toolkit / RTK Query** — серверные данные через RTK Query, клиентский UI-стейт в slices.
- **SCSS (BEM)**, дизайн-токены в CSS-переменных, light/dark темы.
- **epub.js** — рендер EPUB в собственной читалке.
- **lucide-react** — иконки (эмодзи запрещены дизайн-системой).
- **Vitest + Testing Library** — юнит-тесты.

## Два мира контента

Ключевой инвариант домена: приложение работает с **двумя типами контента**, которые почти
не пересекаются.

- **Мир A — Каталог.** Метаданные из Open Library (обложки, описания, поиск). Только витрина
  и вишлист, без текста.
- **Мир B — Личная библиотека.** Полный текст: PD-книги с Internet Archive или загруженные
  пользователем EPUB. Только здесь работают читалка, прогресс, стрик и AI-ассистент.

Читалку и ассистента разблокирует **не полка, а наличие файла** (`hasReadableFile`). PD-книгу
из каталога можно «Читать» — бэкенд по клику докачивает EPUB с Internet Archive в хранилище
(«золотой случай»: одна запись получает и метаданные, и файл).

## AI-ассистент без спойлеров

Ассистент отвечает на вопросы по ходу чтения (значение слова, перевод, «объясни»,
«кто эти персонажи»). Анти-спойлер — **на уровне данных**: сервер обрезает контекст по
текущей позиции чтения (CFI), модель физически не видит непрочитанного. Клиент лишь шлёт
CFI и выделение; сам контекст собирает сервер.

## Структура (feature-sliced)

```
src/app/        store, роутер, layout (Header, тема)
src/features/   catalog, book, auth, library, reader, settings, assistant — по фиче
src/shared/     api/ (базовый query + reauth), i18n/ (RU+EN), ui/ (Button, Input, …), ui-state/ (uiSlice)
src/styles/     дизайн-токены (CSS-переменные) + база
```

## Производительность каталога

Пагинация без «мигания» страницы: `page`/`q`/`genre` живут в URL (`useSearchParams`);
RTK Query кэширует каждую страницу; `useBooksPage` удерживает предыдущие данные при загрузке
(грид димится классом `--loading`, а не размонтируется); карточки в `memo` с key по id;
обложки Open Library размера `M` с `loading="lazy"` и плейсхолдером.

## i18n

Все строки — пары RU/EN в `src/shared/i18n/strings.js`. Язык хранится в localStorage
и в профиле пользователя. Тема (light/dark) — там же, по умолчанию из `prefers-color-scheme`.

## Локальный запуск

```bash
npm install
npm run dev          # дев-сервер на :3000, /api проксируется на бэкенд 127.0.0.1:5080
npm run build        # прод-сборка в dist/
npm test             # юнит-тесты (Vitest)
npx prettier --check "src/**/*.{js,jsx,scss,css}"
```

Для авторизованных страниц нужен запущенный бэкенд (см. его README). Быстрый вход —
dev-пользователь `reader@example.com` / `password123`.

## Деплой

GitHub Pages через `.github/workflows/frontend.yml`: prettier → тесты → build → deploy на
push в main/master. `VITE_BASE=/yarphoenix-library/` и SPA-трюк `404.html` — в пайплайне;
`VITE_API_URL` берётся из repo variable `API_URL`. Пошагово — в
[docs/DEPLOY.md бэкенда](https://github.com/yarphoenix/yarphoenix-library-api/blob/main/docs/DEPLOY.md).
