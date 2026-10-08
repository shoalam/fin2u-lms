import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { courseApi } from './api/courseApi';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { enrollmentApi } from './api/enrollmentApi';
import { quizApi } from './api/quizApi';
import { groupApi } from './api/groupApi';
import { adminApi } from './api/adminApi';
import { messageApi } from './api/messageApi';
import { uploadApi } from './api/uploadApi';
import { paymentApi } from './api/paymentApi';
import { socialApi } from './api/socialApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [groupApi.reducerPath]: groupApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [socialApi.reducerPath]: socialApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      courseApi.middleware,
      authApi.middleware,
      userApi.middleware,
      enrollmentApi.middleware,
      quizApi.middleware,
      groupApi.middleware,
      adminApi.middleware,
      messageApi.middleware,
      uploadApi.middleware,
      paymentApi.middleware,
      socialApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
