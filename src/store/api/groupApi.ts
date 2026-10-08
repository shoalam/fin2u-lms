import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface GroupMemberRole {
  user: string | { _id: string; name: string; avatar?: string; email?: string; headline?: string; role?: string };
  role: 'organizer' | 'moderator' | 'member';
  isCourseSubscriber?: boolean;
  joinedAt: string;
}

export interface GroupInvitation {
  _id: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  email?: string;
  name?: string;
  invitedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  role?: string;
  createdAt: string;
}

export interface GroupForumTopic {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  views?: number;
  repliesCount?: number;
  isPinned?: boolean;
  isClosed?: boolean;
  createdAt: string;
}

export interface GroupZoomMeeting {
  _id: string;
  title: string;
  topic?: string;
  meetingId: string;
  passcode?: string;
  joinUrl: string;
  startTime?: string;
  duration?: number;
  hostName?: string;
  status?: 'upcoming' | 'live' | 'ended';
  createdAt: string;
}

export interface GroupMembershipRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
    headline?: string;
    role?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface GroupSettings {
  invitations: 'all' | 'mods' | 'organizers';
  activityFeed: 'all' | 'mods' | 'organizers';
  groupMessages: 'all' | 'mods' | 'organizers';
  groupType: string;
  enableForum: boolean;
  forumName?: string;
  enableZoom: boolean;
  zoomAccountId?: string;
  zoomMeetingUrl?: string;
  zoomMeetingId?: string;
  zoomTopic?: string;
}

export interface Group {
  _id: string;
  name: string;
  slug: string;
  description: string;
  avatar?: string;
  cover?: string;
  type: 'public' | 'private' | 'hidden';
  creator: {
    _id: string;
    name: string;
    avatar?: string;
    headline?: string;
    role?: string;
    email?: string;
  };
  organizers?: any[];
  moderators?: any[];
  members: any[];
  memberRoles?: GroupMemberRole[];
  memberCount: number;
  settings?: GroupSettings;
  invitations?: GroupInvitation[];
  membershipRequests?: GroupMembershipRequest[];
  forumTopics?: GroupForumTopic[];
  zoomMeetings?: GroupZoomMeeting[];
  createdAt: string;
}

export interface GroupPost {
  _id: string;
  group: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    headline?: string;
    role?: string;
  };
  content: string;
  media?: string[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  hasLiked?: boolean;
  createdAt: string;
}

export interface GroupComment {
  _id: string;
  post: string;
  group: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    headline?: string;
    role?: string;
  };
  content: string;
  createdAt: string;
}

export const groupApi = createApi({
  reducerPath: 'groupApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/groups`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Group', 'GroupPost', 'GroupComment'],
  endpoints: (b) => ({
    getGroups: b.query<
      {
        groups: Group[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      },
      { page?: number; limit?: number; search?: string; type?: string } | void
    >({
      query: (params) => {
        if (!params) return '/';
        const sp = new URLSearchParams();
        if (params.page) sp.set('page', params.page.toString());
        if (params.limit) sp.set('limit', params.limit.toString());
        if (params.search) sp.set('search', params.search);
        if (params.type && params.type !== 'all') sp.set('type', params.type);
        const qs = sp.toString();
        return qs ? `/?${qs}` : '/';
      },
      transformResponse: (res: any) => {
        const payload = res?.data ?? res;
        if (payload?.groups) {
          return {
            groups: payload.groups,
            pagination: payload.pagination || {
              total: payload.groups.length,
              page: 1,
              limit: 9,
              pages: Math.ceil(payload.groups.length / 9) || 1,
            },
          };
        }
        if (Array.isArray(payload)) {
          return {
            groups: payload,
            pagination: {
              total: payload.length,
              page: 1,
              limit: 9,
              pages: Math.ceil(payload.length / 9) || 1,
            },
          };
        }
        return {
          groups: [],
          pagination: { total: 0, page: 1, limit: 9, pages: 1 },
        };
      },
      providesTags: ['Group'],
    }),
    getGroupBySlug: b.query<Group, string>({
      query: (slug) => `/${slug}`,
      transformResponse: (res: any) => res.data ?? res.group ?? res,
      providesTags: ['Group'],
    }),
    createGroup: b.mutation<Group, Partial<Group>>({
      query: (body) => ({ url: '/', method: 'POST', body }),
      invalidatesTags: ['Group'],
    }),
    updateGroup: b.mutation<Group, { id: string; data: Partial<Group> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Group'],
    }),
    deleteGroup: b.mutation<any, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Group'],
    }),
    joinGroup: b.mutation<any, string>({
      query: (id) => ({ url: `/${id}/join`, method: 'POST' }),
      invalidatesTags: ['Group'],
    }),
    leaveGroup: b.mutation<any, string>({
      query: (id) => ({ url: `/${id}/leave`, method: 'POST' }),
      invalidatesTags: ['Group'],
    }),
    requestAccess: b.mutation<any, string>({
      query: (id) => ({ url: `/${id}/request-access`, method: 'POST' }),
      invalidatesTags: ['Group'],
    }),
    cancelMembershipRequest: b.mutation<any, string>({
      query: (id) => ({ url: `/${id}/request-access`, method: 'DELETE' }),
      invalidatesTags: ['Group'],
    }),
    respondMembershipRequest: b.mutation<any, { groupId: string; requestId: string; action: 'approve' | 'reject' }>({
      query: ({ groupId, requestId, action }) => ({
        url: `/${groupId}/requests/${requestId}/respond`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: ['Group'],
    }),

    // --- Member & Role Management ---
    removeMember: b.mutation<any, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({
        url: `/${groupId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group'],
    }),
    updateMemberRole: b.mutation<any, { groupId: string; userId: string; role?: string; isCourseSubscriber?: boolean }>({
      query: ({ groupId, userId, ...body }) => ({
        url: `/${groupId}/members/${userId}/role`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),

    // --- Invitations ---
    inviteMembers: b.mutation<any, { groupId: string; userIds?: string[]; email?: string; name?: string; role?: string }>({
      query: ({ groupId, ...body }) => ({
        url: `/${groupId}/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),
    cancelInvitation: b.mutation<any, { groupId: string; inviteId: string }>({
      query: ({ groupId, inviteId }) => ({
        url: `/${groupId}/invitations/${inviteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group'],
    }),
    acceptInvitation: b.mutation<any, { groupId: string }>({
      query: ({ groupId }) => ({
        url: `/${groupId}/invitations/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Group'],
    }),
    declineInvitation: b.mutation<any, { groupId: string }>({
      query: ({ groupId }) => ({
        url: `/${groupId}/invitations/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['Group'],
    }),

    // --- Forum & Zoom Topics ---
    createForumTopic: b.mutation<any, { groupId: string; title: string; content: string }>({
      query: ({ groupId, ...body }) => ({
        url: `/${groupId}/forum-topics`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),
    createZoomMeeting: b.mutation<any, { groupId: string; title: string; topic?: string; meetingId: string; passcode?: string; joinUrl: string; startTime?: string; duration?: number; hostName?: string }>({
      query: ({ groupId, ...body }) => ({
        url: `/${groupId}/zoom-meetings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),

    // --- Posts & Likes ---
    getGroupPosts: b.query<GroupPost[], string>({
      query: (groupIdOrSlug) => `/${groupIdOrSlug}/posts`,
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['GroupPost'],
    }),
    createGroupPost: b.mutation<GroupPost, { groupId: string; content: string; media?: string[] }>({
      query: ({ groupId, ...body }) => ({
        url: `/${groupId}/posts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupPost'],
    }),
    toggleLikePost: b.mutation<{ liked: boolean; likesCount: number }, string>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['GroupPost'],
    }),
    deleteGroupPost: b.mutation<any, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupPost'],
    }),

    // --- Forum Discussion Threads ---
    getForumTopics: b.query<{ topics: GroupForumTopic[]; pagination: any }, { groupId: string; page?: number; limit?: number }>({
      query: ({ groupId, page = 1, limit = 20 }) => `/${groupId}/forum-topics?page=${page}&limit=${limit}`,
      transformResponse: (res: any) => res.data ?? { topics: [], pagination: { total: 0 } },
      providesTags: ['Group'],
    }),
    getForumTopic: b.query<GroupForumTopic, string>({
      query: (topicId) => `/forum-topics/${topicId}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Group'],
    }),
    getForumReplies: b.query<{ replies: any[]; pagination: any }, { topicId: string; page?: number; limit?: number }>({
      query: ({ topicId, page = 1, limit = 50 }) => `/forum-topics/${topicId}/replies?page=${page}&limit=${limit}`,
      transformResponse: (res: any) => res.data ?? { replies: [], pagination: { total: 0 } },
      providesTags: ['Group'],
    }),
    createForumReply: b.mutation<any, { topicId: string; content: string; attachments?: any[] }>({
      query: ({ topicId, content, attachments }) => ({
        url: `/forum-topics/${topicId}/replies`,
        method: 'POST',
        body: { content, attachments },
      }),
      invalidatesTags: ['Group'],
    }),

    // --- Comments ---
    getPostComments: b.query<GroupComment[], string>({
      query: (postId) => `/posts/${postId}/comments`,
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['GroupComment'],
    }),
    addPostComment: b.mutation<GroupComment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: ['GroupPost', 'GroupComment'],
    }),
    deletePostComment: b.mutation<any, { postId: string; commentId: string }>({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupPost', 'GroupComment'],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupBySlugQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useRequestAccessMutation,
  useCancelMembershipRequestMutation,
  useRespondMembershipRequestMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useInviteMembersMutation,
  useCancelInvitationMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useGetForumTopicsQuery,
  useGetForumTopicQuery,
  useGetForumRepliesQuery,
  useCreateForumTopicMutation,
  useCreateForumReplyMutation,
  useCreateZoomMeetingMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikePostMutation,
  useDeleteGroupPostMutation,
  useGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
} = groupApi;


