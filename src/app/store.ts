import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '../features/auth/authSlice';
import { readerReducer } from '../features/reader/readerSlice';
import { baseApi } from '../shared/api/baseApi';
import { uiReducer } from '../shared/ui-state/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    reader: readerReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
