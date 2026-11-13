import { baseApi } from '../../shared/api/baseApi';
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  ConfirmEmailRequest,
  DeleteAccountRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  ResetPasswordRequest,
  TokenPair,
  UpdateProfileRequest,
  User,
} from '../../shared/api/types';
import { sessionEnded, sessionStarted, userUpdated } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenPair, LoginRequest>({
      query: (credentials) => ({ url: 'auth/login', method: 'POST', body: credentials }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionStarted(data));
      },
    }),
    register: builder.mutation<RegisterResult, RegisterRequest>({
      query: (payload) => ({ url: 'auth/register', method: 'POST', body: payload }),
    }),
    confirmEmail: builder.mutation<void, ConfirmEmailRequest>({
      query: (payload) => ({ url: 'auth/confirm-email', method: 'POST', body: payload }),
    }),
    // Аргумент — email.
    forgotPassword: builder.mutation<void, string>({
      query: (email) => ({ url: 'auth/forgot-password', method: 'POST', body: { email } }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (payload) => ({ url: 'auth/reset-password', method: 'POST', body: payload }),
    }),
    // Аргумент — refresh-токен текущей сессии.
    logout: builder.mutation<void, string>({
      query: (refreshToken) => ({ url: 'auth/logout', method: 'POST', body: { refreshToken } }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Сессию закрываем в любом случае — сервер мог быть недоступен.
        try {
          await queryFulfilled;
        } finally {
          dispatch(sessionEnded());
        }
      },
    }),
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (profile) => ({ url: 'auth/profile', method: 'PUT', body: profile }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
      },
    }),
    changePassword: builder.mutation<TokenPair, ChangePasswordRequest>({
      query: (payload) => ({ url: 'auth/change-password', method: 'POST', body: payload }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionStarted(data));
      },
    }),
    changeEmail: builder.mutation<void, ChangeEmailRequest>({
      query: (payload) => ({ url: 'auth/change-email', method: 'POST', body: payload }),
    }),
    confirmEmailChange: builder.mutation<void, ConfirmEmailChangeRequest>({
      query: (payload) => ({ url: 'auth/confirm-email-change', method: 'POST', body: payload }),
    }),
    deleteAccount: builder.mutation<void, DeleteAccountRequest>({
      query: (payload) => ({ url: 'auth/delete-account', method: 'POST', body: payload }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(sessionEnded());
      },
    }),
    uploadAvatar: builder.mutation<User, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: 'auth/avatar', method: 'POST', body: form };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
      },
    }),
    deleteAvatar: builder.mutation<User, void>({
      query: () => ({ url: 'auth/avatar', method: 'DELETE' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
      },
    }),
  }),
});

export const {
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
} = authApi;
