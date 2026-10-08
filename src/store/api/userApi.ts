import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type { User } from '../authSlice';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (b) => ({
    getMembers: b.query<
      { users: User[]; pagination?: any },
      { role?: string; search?: string; page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.set('role', params.role);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', params.page.toString());
        const qs = queryParams.toString();
        return qs ? `/?${qs}` : '/';
      },
      providesTags: ['User'],
    }),
    getMentors: b.query<User[], void>({
      query: () => '/mentors',
      transformResponse: (res: any) => (Array.isArray(res) ? res : res.data ?? res.mentors ?? []),
    }),
    getUser: b.query<User, string>({
      query: (id) => `/${id}`,
      transformResponse: (res: any) => res.data ?? res.user ?? res,
    }),
    updateUser: b.mutation<User, { id: string } & Partial<User>>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body }),
      transformResponse: (res: any) => res.data ?? res.user ?? res,
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetMembersQuery, useGetMentorsQuery, useGetUserQuery, useUpdateUserMutation } =
  userApi;
