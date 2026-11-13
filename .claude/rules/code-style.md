# Code Style — YarPhoenix Library (Frontend)

Target path in the repo: `.claude/rules/code-style.md`
Stack: TypeScript (migrating from JavaScript), React.js, react-router-dom, Redux Toolkit / RTK Query, CSS/SCSS.

Write code that already conforms to these rules — don't rely on a formatter to fix it afterward.
Formatting rules mirror `.prettierrc.json` (Prettier-enforced). The CSS structure rules and BEM
are conventions Prettier does **not** enforce — apply them by hand.

---

## 1. JavaScript / TypeScript / JSX formatting (mirrors Prettier)

- **Indentation:** 2 spaces, never tabs.
- **Line width:** wrap around 100 characters.
- **Semicolons:** always.
- **Quotes:** single quotes in JS/TS (`'text'`); double quotes for JSX attributes (`<div className="card">`).
- **Trailing commas:** everywhere they're valid (multiline objects, arrays, params, imports).
- **Object braces:** spaces inside — `{ foo: 1 }`, not `{foo:1}`.
- **Arrow functions:** always parenthesize the parameter — `(x) => x`, not `x => x`.
- **JSX:** the closing `>` of a multiline tag goes on its own line; multiple attributes may share lines (no one-attribute-per-line rule).
- **Line endings:** LF.

## 2. React conventions

- Function components only; hooks for state and effects.
- One component per file; the file name matches the component (PascalCase).
- Keep server state in **RTK Query** hooks; keep client-only UI state in Redux slices or local `useState`. Do not hand-write fetch thunks for server data.
- Feature-sliced structure: group files by feature, not by type.

### 2.1. TypeScript

The codebase is being migrated from JavaScript to TypeScript file by file (`allowJs` is on,
`strict` is on). `npm run typecheck` runs in CI.

- **New files are `.ts` / `.tsx`.** When you substantially rewrite a `.js` / `.jsx` file, convert
  it in the same change. Don't convert files you aren't otherwise touching.
- **No `any`, no `// @ts-ignore`.** If a type genuinely can't be expressed, use `unknown` and
  narrow it, or `// @ts-expect-error` with the reason on the same line.
- **Backend DTOs come from the OpenAPI schema, never hand-written.** Import them from
  `src/shared/api/types.ts` (short aliases over the generated `schema.d.ts`). After a backend
  contract change run `npm run gen:api` (the backend must be running) and commit the result.
  Never edit `schema.d.ts` by hand.
- Use `type` for DTOs, props and unions; keep `interface` for declaration merging
  (e.g. `ImportMetaEnv`).
- Type-only imports use `import type` or inline `type` specifiers (`verbatimModuleSyntax`
  enforces this).
- In `.ts` / `.tsx` use `useAppDispatch` / `useAppSelector` from `src/app/hooks.ts`, not the
  untyped react-redux hooks.
- RTK Query endpoints declare both generics: `builder.query<Result, Arg>(...)`.
- Don't use `as` to silence the compiler. A cast is acceptable only at a trust boundary
  (parsed JSON, `getState()` inside the base query) and should narrow to the smallest type needed;
  validate untrusted values (e.g. `localStorage`) instead of casting them.

## 3. CSS / SCSS structure (NOT enforced by Prettier — apply manually)

These are explicit project rules. Prettier preserves them but will not create them, so write them correctly the first time.

### 3.1. One declaration per line
Every property on its own line. Never pack multiple declarations onto one line.

```css
/* correct */
.card {
  display: flex;
  gap: 16px;
  color: var(--text);
}

/* wrong */
.card { display: flex; gap: 16px; color: var(--text); }
```

### 3.2. One blank line between rulesets
Separate every selector block from the next with exactly one blank line.

```css
.card {
  display: flex;
}

.card__title {
  font-weight: 600;
}

.card--featured {
  border-color: var(--accent);
}
```

## 4. BEM naming for classes

Name every class by **BEM** — Block, Element, Modifier.

- **Block** — a standalone component: `.card`, `.search-bar`, `.book-reader`.
- **Element** — a part of a block, joined with `__`: `.card__title`, `.card__cover`, `.search-bar__input`.
- **Modifier** — a variant/state, joined with `--`: `.card--featured`, `.button--disabled`, `.card__title--muted`.

Rules:
- Block and element names are kebab-case (`.book-reader__page-number`).
- An element belongs to its block: write `.card__title`, never `.card .title` for the same concept.
- Modifiers do not stand alone — always apply alongside the base class in markup: `class="card card--featured"`.
- Don't chain elements of elements (`.card__body__title`) — BEM is flat: `.card__body-title`.

### SCSS nesting form
In SCSS, use `&` to keep BEM readable without repeating the block:

```scss
.card {
  display: flex;

  &__title {
    font-weight: 600;
  }

  &--featured {
    border-color: var(--accent);
  }
}
```

Note: the "blank line between rulesets" rule (§3.2) also applies between nested `&__…` blocks, as shown above.
