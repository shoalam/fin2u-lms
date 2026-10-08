import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category?: string;
    instructor?: { name: string; avatar: string };
  };
  progress: number;
  completedLessons: string[];
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

export interface CertificateItem {
  _id: string;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  verificationCode: string;
  pdfUrl?: string;
  course?: {
    _id: string;
    title: string;
    thumbnail?: string;
    category?: string;
    slug?: string;
  };
}

export interface MentorStudentItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    category?: string;
    price?: number;
    type?: string;
    slug: string;
  };
  progress: number;
  completedLessons: string[];
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  createdAt: string;
}

export interface MentorStudentsStats {
  totalLearners: number;
  totalCourses: number;
  activeEnrollments: number;
  completedEnrollments: number;
  avgProgress: number;
}

export interface MentorStudentsResponse {
  enrollments: MentorStudentItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: MentorStudentsStats;
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

export interface MentorStudentsQueryParams {
  courseId?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const enrollmentApi = createApi({
  reducerPath: 'enrollmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/enrollments`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Enrollment', 'Certificate'],
  endpoints: (b) => ({
    enrollCourse: b.mutation<any, string>({
      query: (courseId) => ({
        url: '/',
        method: 'POST',
        body: { courseId },
      }),
      invalidatesTags: ['Enrollment'],
    }),
    getMyEnrollments: b.query<Enrollment[], void>({
      query: () => '/my',
      transformResponse: (res: any) => (Array.isArray(res) ? res : res.data ?? res.enrollments ?? []),
      providesTags: ['Enrollment'],
    }),
    getMyCertificates: b.query<CertificateItem[], void>({
      query: () => '/my-certificates',
      transformResponse: (res: any) => (Array.isArray(res) ? res : res.data ?? []),
      providesTags: ['Certificate'],
    }),
    verifyCertificate: b.query<CertificateItem, string>({
      query: (code) => `/certificates/verify/${code}`,
      transformResponse: (res: any) => res.data ?? res,
    }),
    getMentorStudents: b.query<MentorStudentsResponse, MentorStudentsQueryParams | void>({
      query: (params) => ({
        url: '/mentor-students',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        enrollments: res.data?.enrollments ?? res.enrollments ?? [],
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? {
          totalLearners: 0,
          totalCourses: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          avgProgress: 0,
        },
        courses: res.data?.courses ?? res.courses ?? [],
      }),
      providesTags: ['Enrollment'],
    }),
    checkEnrollmentStatus: b.query<{ isEnrolled: boolean; enrollment?: Enrollment }, string>({
      query: (courseId) => `/${courseId}/status`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Enrollment'],
    }),
    updateLessonProgress: b.mutation<any, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => ({
        url: `/${courseId}/progress`,
        method: 'POST',
        body: { lessonId },
      }),
      invalidatesTags: ['Enrollment', 'Certificate'],
    }),
  }),
});

export const {
  useEnrollCourseMutation,
  useEnrollCourseMutation: useEnrollMutation,
  useGetMyEnrollmentsQuery,
  useGetMyCertificatesQuery,
  useVerifyCertificateQuery,
  useGetMentorStudentsQuery,
  useCheckEnrollmentStatusQuery,
  useUpdateLessonProgressMutation,
} = enrollmentApi;
