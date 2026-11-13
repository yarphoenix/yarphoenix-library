import { baseApi } from '../../shared/api/baseApi';
import { sessionEnded, sessionStarted, userUpdated } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: 'auth/login', method: 'POST', body: credentials }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionStarted(data));
      },
    }),
    register: builder.mutation({
      query: (payload) => ({ url: 'auth/register', method: 'POST', body: payload }),
    }),
    confirmEmail: builder.mutation({
      query: (payload) => ({ url: 'auth/confirm-email', method: 'POST', body: payload }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({ url: 'auth/forgot-password', method: 'POST', body: { email } }),
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({ url: 'auth/reset-password', method: 'POST', body: payload }),
    }),
    logout: builder.mutation({
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
    updateProfile: builder.mutation({
      query: (profile) => ({ url: 'auth/profile', method: 'PUT', body: profile }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
      },
    }),
    changePassword: builder.mutation({
      query: (payload) => ({ url: 'auth/change-password', method: 'POST', body: payload }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionStarted(data));
      },
    }),
    changeEmail: builder.mutation({
      query: (payload) => ({ url: 'auth/change-email', method: 'POST', body: payload }),
    }),
    confirmEmailChange: builder.mutation({
      query: (payload) => ({ url: 'auth/confirm-email-change', method: 'POST', body: payload }),
    }),
    deleteAccount: builder.mutation({
      query: (payload) => ({ url: 'auth/delete-account', method: 'POST', body: payload }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(sessionEnded());
      },
    }),
    uploadAvatar: builder.mutation({
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
    deleteAvatar: builder.mutation({
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
