import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type { User } from '../authSlice';
export type { User };
import type { Course, Lesson } from './courseApi';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  mentors: number;
  students?: number;
  publishedCourses?: number;
  groups?: number;
}

export interface AdminEnrollmentItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    headline?: string;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    type: 'free' | 'member' | 'premium';
    price?: number;
    category?: string;
    duration?: number;
  };
  progress: number;
  completedLessons: string[];
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

export interface AdminEnrollmentPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminEnrollmentStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

export interface AdminEnrollmentsResponse {
  enrollments: AdminEnrollmentItem[];
  pagination: AdminEnrollmentPagination;
  stats: AdminEnrollmentStats;
}

export interface AdminEnrollmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courseId?: string;
  type?: string;
  sort?: string;
}

export interface StudentProgress {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  totalEnrolled: number;
  completedCount: number;
  avgProgress: number;
  isActive: boolean;
  createdAt: string;
  courses: Array<{
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    progress: number;
    status: string;
    enrolledAt: string;
  }>;
}

export interface MentorStatsItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  coursesCount: number;
  totalStudents: number;
  avgRating: number;
  isActive: boolean;
  createdAt: string;
}

export interface MentorApplication {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  hrdcStatus: 'Certified' | 'Accredited' | 'No';
  hrdcTrainerId?: string;
  trainingModes: string[];
  physicalCoverageArea?: string;
  languages: string[];
  courseCategories: string[];
  otherCategory?: string;
  trainerProfileUrls?: string[];
  resumeUrl?: string;
  certificateUrl?: string;
  sampleCourseOutline?: string;
  linkedin?: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected';
  isEmailVerified?: boolean;
  notes?: string;
  createdAt: string;
}

export interface AdminMentorPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminMentorStats {
  totalMentors: number;
  totalStudents: number;
  totalCourses: number;
  pendingApplications: number;
}

export interface AdminMentorsResponse {
  mentors: MentorStatsItem[];
  pagination: AdminMentorPagination;
  stats: AdminMentorStats;
}

export interface AdminMentorQueryParams {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AdminMentorApplicationPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminMentorApplicationsResponse {
  applications: MentorApplication[];
  pagination: AdminMentorApplicationPagination;
}

export interface AdminMentorApplicationQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminCoursePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminCourseStats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  draft: number;
  free: number;
  premium: number;
}

export interface AdminCoursesResponse {
  courses: Course[];
  pagination: AdminCoursePagination;
  stats: AdminCourseStats;
  categories: string[];
}

export interface AdminCourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  isPublished?: string | boolean;
  approvalStatus?: string;
  level?: string;
  sort?: string;
}

export interface AdminStudentPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminStudentStats {
  totalStudents: number;
  totalEnrollments: number;
  completedCourses: number;
  avgCompletionRate: number;
}

export interface AdminStudentsResponse {
  students: StudentProgress[];
  pagination: AdminStudentPagination;
  stats: AdminStudentStats;
}

export interface AdminStudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export interface AdminUserPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminUserStats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  totalActive: number;
  totalInactive: number;
}

export interface AdminUsersResponse {
  users: User[];
  pagination: AdminUserPagination;
  stats: AdminUserStats;
}

export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
}

export interface AdminUserDetailsResponse {
  user: User;
  enrollments: Array<{
    _id: string;
    course: {
      _id: string;
      title: string;
      slug: string;
      thumbnail?: string;
      category?: string;
      price?: number;
      type?: string;
      duration?: number;
      level?: string;
      instructor?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
      };
    };
    progress: number;
    completedLessons?: string[];
    status: 'active' | 'completed' | 'cancelled';
    source?: string;
    enrolledAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  orders: Array<{
    _id: string;
    orderNumber: string;
    course?: {
      _id: string;
      title: string;
      slug: string;
      thumbnail?: string;
      category?: string;
      type?: string;
      price?: number;
    };
    courseSnapshot?: {
      title: string;
      slug?: string;
      thumbnail?: string;
      type?: string;
      price: number;
      currency: string;
    };
    amount: number;
    currency: string;
    gateway: string;
    gatewayPaymentId?: string;
    status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled' | 'refunded';
    paidAt?: string;
    failureReason?: string;
    createdAt: string;
    refund?: {
      refundId?: string;
      amount?: number;
      reason?: string;
      refundedAt?: string;
    };
  }>;
  quizAttempts: Array<{
    _id: string;
    quiz?: {
      _id: string;
      title: string;
      passingPercentage?: number;
      timeLimitMinutes?: number;
    };
    course?: {
      _id: string;
      title: string;
      slug: string;
    };
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    completedAt: string;
    createdAt: string;
  }>;
  createdCourses: Array<{
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category?: string;
    type: string;
    price: number;
    currency: string;
    level?: string;
    enrollmentCount: number;
    rating: number;
    ratingCount: number;
    isPublished: boolean;
    approvalStatus: string;
    lessons?: any[];
    createdAt: string;
  }>;
  salesOrders: Array<{
    _id: string;
    orderNumber: string;
    user?: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    course?: {
      _id: string;
      title: string;
      slug: string;
    };
    amount: number;
    currency: string;
    status: string;
    paidAt?: string;
    createdAt: string;
  }>;
  groups: Array<{
    _id: string;
    name: string;
    description: string;
    slug: string;
    icon?: string;
    isPrivate: boolean;
    memberCount: number;
  }>;
  stats: {
    totalEnrolled: number;
    completedCourses: number;
    inProgressCourses: number;
    avgProgress: number;
    totalSpent: number;
    quizzesTaken: number;
    quizzesPassed: number;
    totalCoursesCreated: number;
    totalPublishedCourses: number;
    totalStudentsTaught: number;
    totalRevenue: number;
    avgRating: number;
    totalReviews: number;
  };
}

export interface WebsiteSettings {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    videoUrl: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  announcement: {
    isEnabled: boolean;
    text: string;
    linkUrl: string;
  };
  company: {
    name: string;
    regNo: string;
    address: string;
    supportEmail: string;
    supportPhone: string;
    whatsapp: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    twitter: string;
  };
  whyFin2u: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    company: string;
    avatar: string;
    content: string;
    rating: number;
  }>;
  partners: Array<{
    name: string;
    logo: string;
    type: 'media' | 'ecosystem';
  }>;
  supportPage?: {
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    emailDeskEmail?: string;
    emailDeskHours?: string;
    hotlinePhone?: string;
    hotlineHours?: string;
    communityLink?: string;
    directAssistanceBadge?: string;
    directAssistanceTitle?: string;
    directAssistanceSubtitle?: string;
    operatingHours?: string[];
    headquarters?: string[];
    topics?: string[];
    faqs?: Array<{
      id: string;
      category: string;
      q: string;
      a: string;
    }>;
  };
}

export interface SupportInquiry {
  _id: string;
  name: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  replyMessage?: string;
  repliedAt?: string;
  resolvedAt?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SupportInquiryPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SupportInquiryStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface SupportInquiriesResponse {
  inquiries: SupportInquiry[];
  pagination: SupportInquiryPagination;
  stats: SupportInquiryStats;
}

export interface SupportInquiryQueryParams {
  search?: string;
  status?: string;
  topic?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AdminGroupMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  headline?: string;
}

export interface AdminGroupItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  avatar?: string;
  cover?: string;
  type: 'public' | 'private';
  creator: AdminGroupMember;
  members: AdminGroupMember[];
  memberCount: number;
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGroupPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminGroupStats {
  totalGroups: number;
  totalMembers: number;
  totalPublic: number;
  totalPrivate: number;
}

export interface AdminGroupsResponse {
  groups: AdminGroupItem[];
  pagination: AdminGroupPagination;
  stats: AdminGroupStats;
}

export interface AdminGroupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
}

export interface AdminGroupPost {
  _id: string;
  group: string;
  author: AdminGroupMember;
  content: string;
  media?: string[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface EmailSettings {
  _id?: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isEnabled: boolean;
  updatedAt?: string;
}

export interface StorageSettings {
  _id?: string;
  activeProvider: 'aws' | 'cloudinary' | 'pcloud' | 'digitalocean';
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
    endpoint?: string;
    customDomain?: string;
    isPublic: boolean;
  };
  digitalocean: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
    endpoint?: string;
    customDomain?: string;
    useCdn: boolean;
    isPublic: boolean;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
  pcloud: {
    accessToken: string;
    location: 'us' | 'eu';
    folderId?: string;
    isPublic: boolean;
  };
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  updatedAt?: string;
}

export interface TestStorageResult {
  success: boolean;
  message: string;
  provider: string;
  testUrl?: string;
  error?: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/admin`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    'AdminStats',
    'AdminUsers',
    'AdminCourses',
    'AdminStudents',
    'AdminMentors',
    'MentorApplications',
    'WebsiteSettings',
    'AdminEmailSettings',
    'AdminStorageSettings',
    'AdminGroups',
    'SupportInquiries',
  ],
  endpoints: (b) => ({
    getAdminStats: b.query<AdminStats, void>({
      query: () => '/stats',
      transformResponse: (res: any) => res.data?.stats ?? res.stats ?? res,
      providesTags: ['AdminStats'],
    }),

    // --- Users ---
    getAdminUsers: b.query<
      AdminUsersResponse,
      AdminUserQueryParams | void
    >({
      query: (params) => ({
        url: '/users',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        users: res.data?.users ?? res.users ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { totalUsers: 0, totalStudents: 0, totalMentors: 0, totalAdmins: 0, totalActive: 0, totalInactive: 0 },
      }),
      providesTags: ['AdminUsers'],
    }),
    createAdminUser: b.mutation<User, Partial<User> & { password?: string }>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats', 'AdminStudents', 'AdminMentors'],
    }),
    updateAdminUser: b.mutation<User, { id: string } & Partial<User>>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'AdminStudents', 'AdminMentors'],
    }),
    deleteAdminUser: b.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats', 'AdminStudents', 'AdminMentors'],
    }),
    updateUserRole: b.mutation<User, { id: string; role: 'student' | 'mentor' | 'admin' }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats', 'AdminStudents', 'AdminMentors'],
    }),
    toggleUserStatus: b.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats', 'AdminStudents', 'AdminMentors'],
    }),
    getAdminUserDetails: b.query<AdminUserDetailsResponse, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['AdminUsers'],
    }),

    // --- Students & Enrollments ---
    getAdminStudents: b.query<
      AdminStudentsResponse,
      AdminStudentQueryParams | void
    >({
      query: (params) => ({
        url: '/students',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        students: res.data?.students ?? res.students ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { total: 0, totalEnrollments: 0, completedCourses: 0, avgCompletionRate: 0 },
      }),
      providesTags: ['AdminStudents'],
    }),
    getStudentEnrollments: b.query<any[], string>({
      query: (id) => `/students/${id}/enrollments`,
      transformResponse: (res: any) => res.data?.enrollments ?? res.enrollments ?? res,
      providesTags: ['AdminStudents'],
    }),
    getAllEnrollments: b.query<
      AdminEnrollmentsResponse,
      AdminEnrollmentQueryParams | void
    >({
      query: (params) => ({
        url: '/enrollments',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        enrollments: res.data?.enrollments ?? res.enrollments ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { total: 0, active: 0, completed: 0, cancelled: 0, completionRate: 0 },
      }),
      providesTags: ['AdminStudents'],
    }),
    updateEnrollment: b.mutation<
      AdminEnrollmentItem,
      { id: string; progress?: number; status?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/enrollments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminStudents', 'AdminStats', 'AdminCourses'],
    }),
    enrollStudent: b.mutation<any, { studentId: string; courseId: string }>({
      query: ({ studentId, courseId }) => ({
        url: `/students/${studentId}/enroll`,
        method: 'POST',
        body: { courseId },
      }),
      invalidatesTags: ['AdminStudents', 'AdminStats', 'AdminCourses'],
    }),
    unenrollStudent: b.mutation<any, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminStudents', 'AdminStats', 'AdminCourses'],
    }),

    // --- Mentors ---
    getAdminMentors: b.query<AdminMentorsResponse, AdminMentorQueryParams | void>({
      query: (params) => ({
        url: '/mentors',
        params: params || undefined,
      }),
      transformResponse: (res: any) => {
        const raw = res.data || res;
        const mentors = raw.mentors ?? (Array.isArray(raw) ? raw : []);
        const pagination = raw.pagination || {
          total: mentors.length,
          page: 1,
          limit: mentors.length || 10,
          pages: 1,
        };
        const stats = raw.stats || {
          totalMentors: mentors.length,
          totalStudents: mentors.reduce((acc: number, m: any) => acc + (m.totalStudents || 0), 0),
          totalCourses: mentors.reduce((acc: number, m: any) => acc + (m.coursesCount || 0), 0),
          pendingApplications: 0,
        };
        return { mentors, pagination, stats };
      },
      providesTags: ['AdminMentors'],
    }),
    getMentorApplications: b.query<AdminMentorApplicationsResponse, AdminMentorApplicationQueryParams | void>({
      query: (params) => ({
        url: '/mentor-applications',
        params: params || undefined,
      }),
      transformResponse: (res: any) => {
        const raw = res.data || res;
        const applications = raw.applications ?? (Array.isArray(raw) ? raw : []);
        const pagination = raw.pagination || {
          total: applications.length,
          page: 1,
          limit: applications.length || 10,
          pages: 1,
        };
        return { applications, pagination };
      },
      providesTags: ['MentorApplications'],
    }),
    checkMentorApplicationEmail: b.query<{ exists: boolean; message?: string }, { email: string }>({
      query: ({ email }) => ({
        url: '/mentor-applications/check-email',
        params: { email },
      }),
      transformResponse: (res: any) => res.data || res,
    }),
    submitMentorApplication: b.mutation<any, Partial<MentorApplication>>({
      query: (body) => ({
        url: '/mentor-applications/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MentorApplications'],
    }),
    updateMentorApplicationStatus: b.mutation<
      MentorApplication,
      { id: string; status: 'approved' | 'rejected'; notes?: string }
    >({
      query: ({ id, status, notes }) => ({
        url: `/mentor-applications/${id}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      invalidatesTags: ['MentorApplications', 'AdminMentors', 'AdminUsers'],
    }),

    // --- Courses ---
    getAdminCourses: b.query<AdminCoursesResponse, AdminCourseQueryParams | void>({
      query: (params) => ({
        url: '/courses',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        courses: res.data?.courses ?? res.courses ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { total: 0, published: 0, pending: 0, rejected: 0, draft: 0, free: 0, premium: 0 },
        categories: res.data?.categories ?? res.categories ?? [],
      }),
      providesTags: ['AdminCourses'],
    }),
    createAdminCourse: b.mutation<Course, any>({
      query: (body) => ({
        url: '/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCourses', 'AdminStats'],
    }),
    updateAdminCourse: b.mutation<Course, { id: string } & any>({
      query: ({ id, ...body }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminCourses'],
    }),
    deleteAdminCourse: b.mutation<any, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCourses', 'AdminStats'],
    }),
    toggleCoursePublish: b.mutation<Course, { id: string; isPublished: boolean }>({
      query: ({ id, isPublished }) => ({
        url: `/courses/${id}/publish`,
        method: 'PUT',
        body: { isPublished },
      }),
      invalidatesTags: ['AdminCourses', 'AdminStats'],
    }),
    addCourseLesson: b.mutation<Course, { courseId: string; lesson: Partial<Lesson> }>({
      query: ({ courseId, lesson }) => ({
        url: `/courses/${courseId}/lessons`,
        method: 'POST',
        body: lesson,
      }),
      transformResponse: (res: any) => res.data?.course ?? res.course ?? res.data ?? res,
      invalidatesTags: ['AdminCourses'],
    }),
    deleteCourseLesson: b.mutation<Course, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      transformResponse: (res: any) => res.data?.course ?? res.course ?? res.data ?? res,
      invalidatesTags: ['AdminCourses'],
    }),

    // --- Website CMS ---
    getWebsiteSettings: b.query<WebsiteSettings, void>({
      query: () => '/website',
      transformResponse: (res: any) => res.data?.settings ?? res.settings ?? res,
      providesTags: ['WebsiteSettings'],
    }),
    getPublicWebsiteSettings: b.query<WebsiteSettings, void>({
      query: () => '/website/public',
      transformResponse: (res: any) => res.data?.settings ?? res.settings ?? res,
      providesTags: ['WebsiteSettings'],
    }),
    updateWebsiteSettings: b.mutation<WebsiteSettings, Partial<WebsiteSettings>>({
      query: (body) => ({
        url: '/website',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['WebsiteSettings'],
    }),

    // --- Email SMTP Settings ---
    getEmailSettings: b.query<EmailSettings, void>({
      query: () => '/settings/email',
      transformResponse: (res: any) => res.data?.settings ?? res.settings ?? res,
      providesTags: ['AdminEmailSettings'],
    }),
    updateEmailSettings: b.mutation<EmailSettings, Partial<EmailSettings>>({
      query: (body) => ({
        url: '/settings/email',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminEmailSettings'],
    }),
    sendTestEmail: b.mutation<
      { success: boolean; message: string },
      { email: string; customConfig?: Partial<EmailSettings> }
    >({
      query: (body) => ({
        url: '/settings/email/test',
        method: 'POST',
        body,
      }),
    }),

    // --- Storage Settings ---
    getStorageSettings: b.query<StorageSettings, void>({
      query: () => '/settings/storage',
      transformResponse: (res: any) => res.data?.settings ?? res.settings ?? res,
      providesTags: ['AdminStorageSettings'],
    }),
    updateStorageSettings: b.mutation<StorageSettings, Partial<StorageSettings>>({
      query: (body) => ({
        url: '/settings/storage',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminStorageSettings'],
    }),
    testStorageConnection: b.mutation<
      TestStorageResult,
      { provider: string; customConfig?: any }
    >({
      query: (body) => ({
        url: '/settings/storage/test',
        method: 'POST',
        body,
      }),
    }),

    // --- Groups Management ---
    getAdminGroups: b.query<
      AdminGroupsResponse,
      AdminGroupQueryParams | void
    >({
      query: (params) => ({
        url: '/groups',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        groups: res.data?.groups ?? res.groups ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { totalGroups: 0, totalMembers: 0, totalPublic: 0, totalPrivate: 0 },
      }),
      providesTags: ['AdminGroups'],
    }),
    getAdminGroup: b.query<AdminGroupItem, string>({
      query: (id) => `/groups/${id}`,
      transformResponse: (res: any) => res.data?.group ?? res.group ?? res,
      providesTags: ['AdminGroups'],
    }),
    createAdminGroup: b.mutation<
      AdminGroupItem,
      { name: string; slug?: string; description?: string; avatar?: string; cover?: string; type?: 'public' | 'private'; creator?: string }
    >({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminGroups', 'AdminStats'],
    }),
    updateAdminGroup: b.mutation<
      AdminGroupItem,
      { id: string; name?: string; slug?: string; description?: string; avatar?: string; cover?: string; type?: 'public' | 'private' }
    >({
      query: ({ id, ...body }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    deleteAdminGroup: b.mutation<any, string>({
      query: (id) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminGroups', 'AdminStats'],
    }),
    addAdminGroupMember: b.mutation<AdminGroupItem, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    removeAdminGroupMember: b.mutation<AdminGroupItem, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    getAdminGroupPosts: b.query<AdminGroupPost[], string>({
      query: (groupId) => `/groups/${groupId}/posts`,
      transformResponse: (res: any) => res.data?.posts ?? res.posts ?? res,
      providesTags: ['AdminGroups'],
    }),
    deleteAdminGroupPost: b.mutation<any, string>({
      query: (postId) => ({
        url: `/groups/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminGroups'],
    }),
    deleteAdminGroupComment: b.mutation<any, { postId: string; commentId: string }>({
      query: ({ postId, commentId }) => ({
        url: `/groups/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminGroups'],
    }),

    // --- Support & Direct Assistance Inquiries ---
    submitSupportInquiry: b.mutation<
      { inquiry: SupportInquiry; message: string },
      { name: string; email: string; topic: string; subject: string; message: string }
    >({
      query: (body) => ({
        url: '/support/inquiries',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportInquiries'],
    }),
    getSupportInquiries: b.query<
      SupportInquiriesResponse,
      SupportInquiryQueryParams | void
    >({
      query: (params) => ({
        url: '/support/inquiries',
        params: params || undefined,
      }),
      transformResponse: (res: any) => ({
        inquiries: res.data?.inquiries ?? res.inquiries ?? (Array.isArray(res.data) ? res.data : []),
        pagination: res.data?.pagination ?? res.pagination ?? { total: 0, page: 1, limit: 10, pages: 1 },
        stats: res.data?.stats ?? res.stats ?? { total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 },
      }),
      providesTags: ['SupportInquiries'],
    }),
    getSupportInquiryById: b.query<SupportInquiry, string>({
      query: (id) => `/support/inquiries/${id}`,
      transformResponse: (res: any) => res.data?.inquiry ?? res.inquiry ?? res,
      providesTags: ['SupportInquiries'],
    }),
    updateSupportInquiry: b.mutation<
      SupportInquiry,
      {
        id: string;
        status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        adminNotes?: string;
        replyMessage?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/support/inquiries/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SupportInquiries'],
    }),
    deleteSupportInquiry: b.mutation<any, string>({
      query: (id) => ({
        url: `/support/inquiries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportInquiries'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserDetailsQuery,
  useLazyGetAdminUserDetailsQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useGetAdminStudentsQuery,
  useGetStudentEnrollmentsQuery,
  useGetAllEnrollmentsQuery,
  useUpdateEnrollmentMutation,
  useEnrollStudentMutation,
  useUnenrollStudentMutation,
  useGetAdminMentorsQuery,
  useGetMentorApplicationsQuery,
  useCheckMentorApplicationEmailQuery,
  useLazyCheckMentorApplicationEmailQuery,
  useSubmitMentorApplicationMutation,
  useUpdateMentorApplicationStatusMutation,
  useGetAdminCoursesQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
  useDeleteAdminCourseMutation,
  useToggleCoursePublishMutation,
  useAddCourseLessonMutation,
  useDeleteCourseLessonMutation,
  useGetWebsiteSettingsQuery,
  useGetPublicWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useSendTestEmailMutation,
  useGetStorageSettingsQuery,
  useUpdateStorageSettingsMutation,
  useTestStorageConnectionMutation,
  useGetAdminGroupsQuery,
  useGetAdminGroupQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
  useDeleteAdminGroupMutation,
  useAddAdminGroupMemberMutation,
  useRemoveAdminGroupMemberMutation,
  useGetAdminGroupPostsQuery,
  useDeleteAdminGroupPostMutation,
  useDeleteAdminGroupCommentMutation,
  useSubmitSupportInquiryMutation,
  useGetSupportInquiriesQuery,
  useGetSupportInquiryByIdQuery,
  useUpdateSupportInquiryMutation,
  useDeleteSupportInquiryMutation,
} = adminApi;
