import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type { User } from '../authSlice';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface PublicProfileResponse {
  user: User;
  groups: Array<{
    _id: string;
    name: string;
    slug: string;
    avatar?: string;
    cover?: string;
    type: string;
    membersCount: number;
    description?: string;
  }>;
  courses: Array<{
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
    level?: string;
    ratingAvg?: number;
    ratingCount?: number;
  }>;
  connectionStatus: 'none' | 'self' | 'pending_sent' | 'pending_received' | 'connected' | 'blocked';
  connectionId?: string;
  isBlocked: boolean;
}

export interface MyConnectionsResponse {
  connected: Array<{
    connectionId: string;
    user: User;
    connectedAt: string;
  }>;
  incomingPending: Array<{
    connectionId: string;
    user: User;
    receivedAt: string;
  }>;
  outgoingPending: Array<{
    connectionId: string;
    user: User;
    sentAt: string;
  }>;
}

export type ReportReason =
  | 'Harassment'
  | 'Inappropriate'
  | 'Misinformation'
  | 'Offensive'
  | 'Suspicious'
  | 'Other';

export interface ReportItem {
  _id: string;
  reporter: User;
  targetType: 'post' | 'comment' | 'group' | 'user' | 'message';
  targetId: string;
  targetTitle?: string;
  targetAuthor?: User;
  reason: ReportReason;
  note?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolvedBy?: User;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const socialApi = createApi({
  reducerPath: 'socialApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PublicProfile', 'Connections', 'Blocks', 'Reports'],
  endpoints: (b) => ({
    getPublicProfile: b.query<PublicProfileResponse, string>({
      query: (userId) => `/users/${userId}/public-profile`,
      transformResponse: (res: any) => res.data,
      providesTags: (result, error, id) => [{ type: 'PublicProfile', id }],
    }),

    getMyConnections: b.query<MyConnectionsResponse, void>({
      query: () => '/connections/my',
      transformResponse: (res: any) => res.data,
      providesTags: ['Connections'],
    }),

    getConnectionStatus: b.query<
      { status: 'none' | 'self' | 'pending_sent' | 'pending_received' | 'connected' | 'blocked'; connectionId?: string },
      string
    >({
      query: (userId) => `/connections/status/${userId}`,
      transformResponse: (res: any) => res.data,
      providesTags: (result, error, id) => [{ type: 'Connections', id }],
    }),

    sendConnectionRequest: b.mutation<any, string>({
      query: (userId) => ({
        url: `/connections/request/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['Connections', { type: 'PublicProfile', id: id }, { type: 'Connections', id: id }],
    }),

    acceptConnection: b.mutation<any, { connectionId: string; targetUserId?: string }>({
      query: ({ connectionId }) => ({
        url: `/connections/${connectionId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { targetUserId }) => [
        'Connections',
        ...(targetUserId ? [{ type: 'PublicProfile' as const, id: targetUserId }, { type: 'Connections' as const, id: targetUserId }] : []),
      ],
    }),

    declineConnection: b.mutation<any, { connectionId: string; targetUserId?: string }>({
      query: ({ connectionId }) => ({
        url: `/connections/${connectionId}/decline`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { targetUserId }) => [
        'Connections',
        ...(targetUserId ? [{ type: 'PublicProfile' as const, id: targetUserId }, { type: 'Connections' as const, id: targetUserId }] : []),
      ],
    }),

    removeConnection: b.mutation<any, string>({
      query: (userId) => ({
        url: `/connections/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => ['Connections', { type: 'PublicProfile', id: id }, { type: 'Connections', id: id }],
    }),

    // Block endpoints
    blockUser: b.mutation<any, { userId: string; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/blocks/${userId}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { userId }) => [
        'Blocks',
        'Connections',
        { type: 'PublicProfile', id: userId },
        { type: 'Connections', id: userId },
      ],
    }),

    unblockUser: b.mutation<any, string>({
      query: (userId) => ({
        url: `/blocks/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Blocks',
        'Connections',
        { type: 'PublicProfile', id: id },
        { type: 'Connections', id: id },
      ],
    }),

    getMyBlockedUsers: b.query<any[], void>({
      query: () => '/blocks/list',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['Blocks'],
    }),

    // Report endpoints
    submitReport: b.mutation<
      any,
      {
        targetType: 'post' | 'comment' | 'group' | 'user' | 'message';
        targetId: string;
        targetTitle?: string;
        targetAuthor?: string;
        reason: ReportReason;
        note?: string;
      }
    >({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reports'],
    }),

    getAdminReports: b.query<
      { reports: ReportItem[]; total: number; page: number; pages: number },
      { status?: string; targetType?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.targetType) queryParams.set('targetType', params.targetType);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        const qs = queryParams.toString();
        return qs ? `/reports?${qs}` : '/reports';
      },
      transformResponse: (res: any) => res.data,
      providesTags: ['Reports'],
    }),

    updateReportStatus: b.mutation<any, { id: string; status: string; adminNotes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/reports/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetPublicProfileQuery,
  useGetMyConnectionsQuery,
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionMutation,
  useDeclineConnectionMutation,
  useRemoveConnectionMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetMyBlockedUsersQuery,
  useSubmitReportMutation,
  useGetAdminReportsQuery,
  useUpdateReportStatusMutation,
} = socialApi;
