import { baseApi } from '../../shared/api/baseApi';
import type { AskAssistantRequest, AssistantAnswer } from '../../shared/api/types';

export const assistantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Бэкенд всегда отвечает 200: при недоступности Claude приходит
    // { available: false, message } — деградация без ошибки (ТЗ §8.3).
    askAssistant: builder.mutation<AssistantAnswer, AskAssistantRequest>({
      query: (payload) => ({ url: 'assistant/ask', method: 'POST', body: payload }),
    }),
  }),
});

export const { useAskAssistantMutation } = assistantApi;
