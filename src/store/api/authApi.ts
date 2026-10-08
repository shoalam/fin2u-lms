import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type { User } from '../authSlice';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface RegisterInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  gender?: string;
  email: string;
  password: string;
  role?: 'student' | 'mentor';
}
export interface RegisterResponse {
  message: string;
  email: string;
  isEmailVerified?: boolean;
  user?: User;
  token?: string;
}
export interface LoginInput { email: string; password: string; }
export interface ForgotPasswordInput { email: string; }
export interface ResetPasswordInput { email: string; token: string; password: string; }
export interface VerifyResetTokenResponse { valid: boolean; email?: string; name?: string; }
export interface VerifyEmailInput { token: string; email?: string; }
export interface VerifyEmailResponse { message: string; token: string; user: User; }
export interface ResendVerificationInput { email: string; }
export interface ResendVerificationResponse { message: string; }
export interface SendOtpInput {
  email: string;
  purpose?: 'signin' | 'register' | 'checkout';
  name?: string;
}
export interface SendOtpResponse {
  message: string;
  email: string;
  expiresInMinutes: number;
  devOtpCode?: string;
}
export interface VerifyOtpInput {
  email: string;
  code: string;
  rememberMe?: boolean;
  name?: string;
  role?: 'student' | 'mentor';
}
export interface VerifyOtpResponse {
  message: string;
  token: string;
  isNewUser: boolean;
  user: User;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (b) => ({
    sendOtp: b.mutation<SendOtpResponse, SendOtpInput>({
      query: (body) => ({ url: '/send-otp', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    verifyOtp: b.mutation<VerifyOtpResponse, VerifyOtpInput>({
      query: (body) => ({ url: '/verify-otp', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    register: b.mutation<RegisterResponse, RegisterInput>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    login: b.mutation<{ user: User; token: string; message: string }, LoginInput>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    verifyEmail: b.mutation<VerifyEmailResponse, VerifyEmailInput>({
      query: (body) => ({ url: '/verify-email', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    resendVerification: b.mutation<ResendVerificationResponse, ResendVerificationInput>({
      query: (body) => ({ url: '/resend-verification', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    getMe: b.query<{ user: User }, void>({
      query: () => '/me',
      transformResponse: (res: any) => res.data ?? res,
    }),
    updateMe: b.mutation<{ user: User }, Partial<User & { bio: string; headline: string; website: string }>>({
      query: (body) => ({ url: '/me', method: 'PUT', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    forgotPassword: b.mutation<{ message: string; devResetUrl?: string }, ForgotPasswordInput>({
      query: (body) => ({ url: '/forgot-password', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
    verifyResetToken: b.query<VerifyResetTokenResponse, { email: string; token: string }>({
      query: ({ email, token }) => `/verify-reset-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      transformResponse: (res: any) => res.data ?? res,
    }),
    resetPassword: b.mutation<{ message: string }, ResetPasswordInput>({
      query: (body) => ({ url: '/reset-password', method: 'POST', body }),
      transformResponse: (res: any) => res.data ?? res,
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useForgotPasswordMutation,
  useVerifyResetTokenQuery,
  useResetPasswordMutation,
} = authApi;

