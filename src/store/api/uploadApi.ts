import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
export { StorageFolders, getEntityFolder, type StorageFolder } from '@/constants/storage-folders';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface UploadedFileResponse {
  url: string;
  key: string;
  originalName: string;
  size: number;
  mimeType: string;
  provider: string;
  publicId?: string;
  bucket?: string;
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/upload`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (b) => ({
    uploadFile: b.mutation<
      { success: boolean; message: string; data: UploadedFileResponse },
      FormData
    >({
      query: (formData) => ({
        url: '/file',
        method: 'POST',
        body: formData,
      }),
    }),
    uploadMultipleFiles: b.mutation<
      { success: boolean; message: string; data: UploadedFileResponse[] },
      FormData
    >({
      query: (formData) => ({
        url: '/multiple',
        method: 'POST',
        body: formData,
      }),
    }),
    deleteUploadedFile: b.mutation<
      { success: boolean; message: string },
      { key?: string; url?: string }
    >({
      query: (body) => ({
        url: '/file',
        method: 'DELETE',
        body,
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
  useDeleteUploadedFileMutation,
} = uploadApi;

/**
 * Direct file upload helper with standard fetch for use in standalone callbacks
 */
export async function uploadSingleFile(
  file: File,
  folder: string = 'uploads',
  token?: string
): Promise<UploadedFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}/upload/file`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData?.message || 'Failed to upload file');
  }

  return resData.data;
}
