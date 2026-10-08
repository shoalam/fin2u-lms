import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: string;
  timeLimitMinutes: number;
  passingPercentage: number;
  totalQuestions: number;
  isPublished?: boolean;
  questions?: QuizQuestion[];
}

export interface QuizSubmission {
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
  }[];
}

export interface QuizResult {
  attemptId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingPercentage: number;
  answers: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
}

export interface MentorQuizItem {
  _id: string;
  title: string;
  description?: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    category?: string;
    slug: string;
  };
  timeLimitMinutes: number;
  passingPercentage: number;
  totalQuestions: number;
  questions?: QuizQuestion[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorQuizzesStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalCourses: number;
  publishedQuizzes: number;
}

export interface MentorQuizzesResponse {
  quizzes: MentorQuizItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: MentorQuizzesStats;
  courses: Array<{
    _id: string;
    title: string;
    thumbnail?: string;
    category?: string;
    enrollmentCount?: number;
    price?: number;
    type?: string;
    slug?: string;
  }>;
}

export interface MentorQuizzesQueryParams {
  courseId?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/quiz`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Quiz', 'QuizAttempt'],
  endpoints: (builder) => ({
    getCourseQuizzes: builder.query<Quiz[], string>({
      query: (courseId) => `/course/${courseId}`,
      transformResponse: (response: { data: Quiz[] }) => response.data,
      providesTags: ['Quiz'],
    }),
    getMentorQuizzes: builder.query<MentorQuizzesResponse, MentorQuizzesQueryParams | void>({
      query: (params) => ({
        url: '/mentor-quizzes',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        quizzes: res.data?.quizzes ?? res.quizzes ?? [],
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalCourses: 0,
          publishedQuizzes: 0,
        },
        courses: res.data?.courses ?? res.courses ?? [],
      }),
      providesTags: ['Quiz'],
    }),
    getQuizForStudent: builder.query<Quiz, string>({
      query: (id) => `/${id}/take`,
      transformResponse: (response: { data: Quiz }) => response.data,
    }),
    getQuizDetails: builder.query<Quiz, string>({
      query: (id) => `/${id}/details`,
      transformResponse: (response: { data: Quiz }) => response.data,
      providesTags: ['Quiz'],
    }),
    createQuiz: builder.mutation<Quiz, Partial<Quiz>>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: Quiz }) => response.data,
      invalidatesTags: ['Quiz'],
    }),
    updateQuiz: builder.mutation<Quiz, { id: string } & Partial<Quiz>>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: { data: Quiz }) => response.data,
      invalidatesTags: ['Quiz'],
    }),
    deleteQuiz: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),
    submitQuiz: builder.mutation<QuizResult, { id: string; submission: QuizSubmission }>({
      query: ({ id, submission }) => ({
        url: `/${id}/submit`,
        method: 'POST',
        body: submission,
      }),
      transformResponse: (response: { data: QuizResult }) => response.data,
      invalidatesTags: ['QuizAttempt'],
    }),
    getMyAttempts: builder.query<any[], string | void>({
      query: (quizId) => (quizId ? `/my/attempts?quizId=${quizId}` : '/my/attempts'),
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ['QuizAttempt'],
    }),
  }),
});

export const {
  useGetCourseQuizzesQuery,
  useGetMentorQuizzesQuery,
  useGetQuizForStudentQuery,
  useGetQuizDetailsQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useSubmitQuizMutation,
  useGetMyAttemptsQuery,
} = quizApi;
