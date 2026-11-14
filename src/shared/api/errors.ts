// Разбор ошибок RTK Query (`unwrap()` бросает FetchBaseQueryError или SerializedError).
// Работаем с `unknown` и сужаем сами: в catch тип ошибки не известен.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** HTTP-статус ответа; undefined для сетевых и прочих ошибок без статуса. */
export function apiErrorStatus(error: unknown): number | undefined {
  return isRecord(error) && typeof error.status === 'number' ? error.status : undefined;
}

/**
 * Текст ошибки от бэкенда: `{ message }` у бизнес-ошибок или `title` у ProblemDetails.
 * undefined — показываем свою локализованную строку.
 */
export function apiErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error) || !isRecord(error.data)) {
    return undefined;
  }
  const { message, title } = error.data;
  if (typeof message === 'string' && message) {
    return message;
  }
  return typeof title === 'string' && title ? title : undefined;
}
