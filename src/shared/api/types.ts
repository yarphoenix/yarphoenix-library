// Контракт с бэкендом. Источник правды — schema.d.ts, который генерируется из OpenAPI
// (`npm run gen:api` при запущенном бэкенде). Здесь только короткие имена: руками DTO
// не описываем, иначе фронтенд снова начнёт читать поля, которых сервер не отдаёт.
import type { components } from './schema';

type Schemas = components['schemas'];

// --- Ответы ---
export type BookSummary = Schemas['BookSummaryResponse'];
export type BookList = Schemas['BookListResponse'];
export type BookDetails = Schemas['BookDetailsResponse'];
export type LibraryBook = Schemas['LibraryBookResponse'];
export type LibraryStats = Schemas['LibraryStatsResponse'];
export type User = Schemas['UserResponse'];
export type TokenPair = Schemas['TokenResponse'];
export type RegisterResult = Schemas['RegisterResponse'];
export type AssistantAnswer = Schemas['AssistantResponse'];

// --- Запросы ---
// Каталожная запись адресуется парой (provider, externalId) — ТЗ §4.1.
export type BookRef = Schemas['AddToLibraryRequest'];
export type UpdateShelfRequest = Schemas['UpdateShelfRequest'];
export type LoginRequest = Schemas['LoginRequest'];
export type RegisterRequest = Schemas['RegisterRequest'];
export type ConfirmEmailRequest = Schemas['ConfirmEmailRequest'];
export type ResetPasswordRequest = Schemas['ResetPasswordRequest'];
export type ChangePasswordRequest = Schemas['ChangePasswordRequest'];
export type ChangeEmailRequest = Schemas['ChangeEmailRequest'];
export type ConfirmEmailChangeRequest = Schemas['ConfirmEmailChangeRequest'];
export type DeleteAccountRequest = Schemas['DeleteAccountRequest'];
export type UpdateProfileRequest = Schemas['UpdateProfileRequest'];
export type AskAssistantRequest = Schemas['AskAssistantRequest'];
