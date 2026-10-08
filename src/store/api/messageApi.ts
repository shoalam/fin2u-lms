import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  role?: string;
  headline?: string;
}

export interface Conversation {
  _id?: string;
  user: ChatUser;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

export interface ChatAttachment {
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser;
  recipient?: ChatUser;
  group?: string;
  type?: 'text' | 'image' | 'file' | 'system';
  content: string;
  attachments?: ChatAttachment[];
  replyTo?: {
    _id?: string;
    content: string;
    sender?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/messages`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Conversation', 'ChatMessage'],
  endpoints: (b) => ({
    getConversations: b.query<Conversation[], void>({
      query: () => '/conversations',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['Conversation'],
    }),
    getContacts: b.query<ChatUser[], void>({
      query: () => '/contacts',
      transformResponse: (res: any) => res.data ?? [],
    }),
    getDirectMessages: b.query<ChatMessage[], string>({
      query: (recipientId) => `/direct/${recipientId}`,
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['ChatMessage'],
    }),
    sendDirectMessage: b.mutation<
      ChatMessage,
      { recipientId: string; content: string; attachments?: ChatAttachment[]; replyTo?: string }
    >({
      query: ({ recipientId, content, attachments, replyTo }) => ({
        url: `/direct/${recipientId}`,
        method: 'POST',
        body: { content, attachments, replyTo },
      }),
      invalidatesTags: ['ChatMessage', 'Conversation'],
    }),
    getGroupMessages: b.query<ChatMessage[], string>({
      query: (groupId) => `/group/${groupId}`,
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['ChatMessage'],
    }),
    sendGroupMessage: b.mutation<
      ChatMessage,
      { groupId: string; content: string; attachments?: ChatAttachment[] }
    >({
      query: ({ groupId, content, attachments }) => ({
        url: `/group/${groupId}`,
        method: 'POST',
        body: { content, attachments },
      }),
      invalidatesTags: ['ChatMessage'],
    }),
    markAsRead: b.mutation<void, string>({
      query: (recipientId) => ({
        url: `/direct/${recipientId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetContactsQuery,
  useGetDirectMessagesQuery,
  useSendDirectMessageMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
  useMarkAsReadMutation,
} = messageApi;
