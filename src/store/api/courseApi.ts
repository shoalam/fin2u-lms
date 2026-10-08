import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  category: string;
  type: 'free' | 'member' | 'premium';
  price: number;
  currency: string;
  instructor: { _id: string; name: string; avatar: string; headline?: string; bio?: string };
  lessons: Lesson[];
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isPublished: boolean;
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  language?: string;
  requirements: string[];
  objectives: string[];
  createdAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
  type: 'video' | 'text' | 'quiz';
  isPreview: boolean;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseStats {
  total: number;
  published: number;
  pending?: number;
  rejected?: number;
  draft: number;
  totalStudents: number;
}

export interface CourseQueryParams {
  type?: string;
  category?: string;
  level?: string;
  search?: string;
  instructor?: string;
  isPublished?: boolean | string;
  approvalStatus?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: Pagination;
  stats?: CourseStats;
  categories?: string[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/courses`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Course', 'Review'],
  endpoints: (b) => ({
    getFeaturedCourses: b.query<{ courses: Course[] }, void>({
      query: () => '/featured',
      transformResponse: (res: any) => ({
        courses: res.data?.courses ?? res.data ?? res.courses ?? (Array.isArray(res) ? res : []),
      }),
    }),
    getCourses: b.query<CoursesResponse, CourseQueryParams | void>({
      query: (params) => ({ url: '/', params: params || undefined }),
      transformResponse: (res: any) => ({
        courses: res.data?.courses ?? res.courses ?? [],
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 12, pages: 1 },
        stats: res.data?.stats ?? res.stats,
        categories: res.data?.categories ?? res.categories ?? [],
      }),
      providesTags: ['Course'],
    }),
    getCourse: b.query<{ course: Course }, string>({
      query: (slug) => `/${slug}`,
      transformResponse: (res: any) => ({
        course: res.data?.course ?? res.course ?? res.data ?? res,
      }),
      providesTags: (_, __, slug) => [{ type: 'Course', id: slug }],
    }),
    getCourseReviews: b.query<{ reviews: Review[] }, string>({
      query: (id) => `/${id}/reviews`,
      transformResponse: (res: any) => ({
        reviews: res.data?.reviews ?? res.reviews ?? (Array.isArray(res.data) ? res.data : []),
      }),
      providesTags: ['Review'],
    }),
    addReview: b.mutation<{ review: Review }, { id: string; rating: number; comment: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}/reviews`, method: 'POST', body }),
      transformResponse: (res: any) => ({
        review: res.data?.review ?? res.review ?? res.data ?? res,
      }),
      invalidatesTags: ['Review'],
    }),
    createCourse: b.mutation<{ course: Course }, Partial<Course>>({
      query: (body) => ({ url: '/', method: 'POST', body }),
      transformResponse: (res: any) => ({
        course: res.data?.course ?? res.course ?? res.data ?? res,
      }),
      invalidatesTags: ['Course'],
    }),
    updateCourse: b.mutation<{ course: Course }, { id: string } & Partial<Course>>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body }),
      transformResponse: (res: any) => ({
        course: res.data?.course ?? res.course ?? res.data ?? res,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteCourse: b.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Course'],
    }),
    addCourseLesson: b.mutation<{ course: Course }, { courseId: string; lesson: Partial<Lesson> }>({
      query: ({ courseId, lesson }) => ({
        url: `/${courseId}/lessons`,
        method: 'POST',
        body: lesson,
      }),
      transformResponse: (res: any) => ({
        course: res.data?.course ?? res.course ?? res.data ?? res,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteCourseLesson: b.mutation<{ course: Course }, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => ({
        url: `/${courseId}/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      transformResponse: (res: any) => ({
        course: res.data?.course ?? res.course ?? res.data ?? res,
      }),
      invalidatesTags: ['Course'],
    }),
  }),
});

export const {
  useGetFeaturedCoursesQuery,
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCourseQuery: useGetCourseBySlugQuery,
  useGetCourseReviewsQuery,
  useAddReviewMutation,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAddCourseLessonMutation,
  useDeleteCourseLessonMutation,
} = courseApi;
