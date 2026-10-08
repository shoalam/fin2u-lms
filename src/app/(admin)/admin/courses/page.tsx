'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminCoursesQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
  useDeleteAdminCourseMutation,
  useToggleCoursePublishMutation,
  useAddCourseLessonMutation,
  useDeleteCourseLessonMutation,
  useGetAdminMentorsQuery,
} from '@/store/api/adminApi';
import type { Course, Lesson } from '@/store/api/courseApi';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUploader from '@/components/common/ImageUploader';
import VideoUploader from '@/components/common/VideoUploader';
import { StorageFolders } from '@/constants/storage-folders';
import {
  BookOpen,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Video,
  Play,
  PlayCircle,
  FileText,
  Sparkles,
  Award,
  Layers,
  CheckCircle,
  Eye,
  X,
  RefreshCw,
  Sliders,
  DollarSign,
  Clock,
  Check,
  Globe,
  Tag,
  Target,
  HelpCircle,
  ListPlus,
  UserCheck,
  AlertCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

const POPULAR_CATEGORIES = [
  'Legal & Compliance',
  'Wealth & Estate Planning',
  'Corporate Tax & Audit',
  'Financial Advisory',
  'Fintech & Web3',
  'Leadership & Business',
  'Islamic Finance',
];

const SUGGESTED_TAGS = [
  'Tax Law',
  'Estate Planning',
  'SME Succession',
  'AML / CFT',
  'Wealth Structuring',
  'Family Office',
  'HRDC Claimable',
  'PDPA Compliance',
];

const CURRENCIES = [
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (MYR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
];

const LANGUAGES = [
  'English',
  'Bahasa Malaysia',
  'Mandarin (Chinese)',
  'Tamil',
  'Bilingual (EN / BM)',
];

export default function AdminCoursesPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Server-side query state: search, filter, sort, and pagination
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('');
  const [courseTierFilter, setCourseTierFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [courseStatusFilter, setCourseStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [courseApprovalFilter, setCourseApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all');
  const [courseLevelFilter, setCourseLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [courseSort, setCourseSort] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Query Courses directly with API pagination, sorting & search
  const {
    data: coursesResponse,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
    isFetching: isFetchingCourses,
  } = useGetAdminCoursesQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch || undefined,
      category: courseCategoryFilter || undefined,
      type: courseTierFilter !== 'all' ? courseTierFilter : undefined,
      isPublished: courseStatusFilter === 'published' ? 'true' : courseStatusFilter === 'draft' ? 'false' : undefined,
      approvalStatus: courseApprovalFilter !== 'all' ? courseApprovalFilter : undefined,
      level: courseLevelFilter !== 'all' ? courseLevelFilter : undefined,
      sort: courseSort,
    },
    { skip: user?.role !== 'admin' }
  );

  const courses = coursesResponse?.courses || [];
  const pagination = coursesResponse?.pagination || { total: 0, page: currentPage, limit: pageLimit, pages: 1 };
  const stats = coursesResponse?.stats || { total: 0, published: 0, pending: 0, rejected: 0, draft: 0, free: 0, premium: 0 };
  const categories = Array.from(
    new Set([...(coursesResponse?.categories || []), ...POPULAR_CATEGORIES])
  );

  const { data: mentorsData } = useGetAdminMentorsQuery({ limit: 100 }, { skip: user?.role !== 'admin' });
  const mentors = mentorsData?.mentors || (Array.isArray(mentorsData) ? mentorsData : []);

  const [createAdminCourse, { isLoading: isCreatingCourse }] = useCreateAdminCourseMutation();
  const [updateAdminCourse, { isLoading: isUpdatingCourse }] = useUpdateAdminCourseMutation();
  const [deleteAdminCourse, { isLoading: isDeletingCourse }] = useDeleteAdminCourseMutation();
  const [toggleCoursePublish] = useToggleCoursePublishMutation();
  const [addCourseLesson, { isLoading: isAddingLesson }] = useAddCourseLessonMutation();
  const [deleteCourseLesson, { isLoading: isDeletingLesson }] = useDeleteCourseLessonMutation();

  // Modals
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'curriculum' | 'outcomes'>('general');

  // Form State
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: 'Legal & Compliance',
    type: 'free' as 'free' | 'member' | 'premium',
    price: 0,
    currency: 'MYR',
    duration: 60,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'English',
    thumbnail: '',
    instructor: '',
    isPublished: false,
    approvalStatus: 'approved' as 'draft' | 'pending' | 'approved' | 'rejected',
    adminFeedback: '',
    tags: [] as string[],
    requirements: [] as string[],
    objectives: [] as string[],
  });

  // Review Feedback Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCourseForReview, setSelectedCourseForReview] = useState<Course | null>(null);
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Temporary item inputs for dynamic arrays
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');

  // Lesson Modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    duration: 15,
    type: 'video' as 'video' | 'text' | 'quiz',
    videoUrl: '',
    isPreview: false,
    order: 1,
  });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    icon?: 'trash' | 'check' | 'alert' | 'toggle';
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    icon: 'check',
    isLoading: false,
    onConfirm: () => {},
  });

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const isAnyFilterActive =
    searchInput !== '' ||
    courseCategoryFilter !== '' ||
    courseTierFilter !== 'all' ||
    courseStatusFilter !== 'all' ||
    courseApprovalFilter !== 'all' ||
    courseLevelFilter !== 'all' ||
    courseSort !== '-createdAt';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCourseCategoryFilter('');
    setCourseTierFilter('all');
    setCourseStatusFilter('all');
    setCourseApprovalFilter('all');
    setCourseLevelFilter('all');
    setCourseSort('-createdAt');
    setCurrentPage(1);
  };

  const handleSortToggle = (field: string) => {
    if (courseSort === field) {
      setCourseSort(`-${field}`);
    } else if (courseSort === `-${field}`) {
      setCourseSort(field);
    } else {
      setCourseSort(field === 'createdAt' || field === 'price' || field === 'duration' ? `-${field}` : field);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (courseSort === field) return <ArrowUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    if (courseSort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5 text-[#ff447e]" />;
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 opacity-60 hover:opacity-100" />;
  };

  const getPageNumbers = (): (number | string)[] => {
    const totalPages = pagination.pages || 1;
    const current = pagination.page || 1;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (current >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', current - 1, current, current + 1, '...', totalPages];
  };

  const handleOpenCourseModal = (course?: Course) => {
    setActiveTab('general');
    setNewTag('');
    setNewRequirement('');
    setNewObjective('');

    if (course) {
      setEditingCourse(course);
      const instructorId =
        typeof course.instructor === 'object' && course.instructor?._id
          ? course.instructor._id
          : typeof course.instructor === 'string'
          ? course.instructor
          : user?._id || '';

      setCourseForm({
        title: course.title || '',
        slug: course.slug || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        category: course.category || 'Legal & Compliance',
        type: course.type || 'free',
        price: course.price || 0,
        currency: course.currency || 'MYR',
        duration: course.duration || 60,
        level: course.level || 'beginner',
        language: course.language || 'English',
        thumbnail: course.thumbnail || '',
        instructor: instructorId,
        isPublished: course.isPublished || false,
        approvalStatus: course.approvalStatus || (course.isPublished ? 'approved' : 'draft'),
        adminFeedback: course.adminFeedback || '',
        tags: course.tags && Array.isArray(course.tags) ? [...course.tags] : [],
        requirements: course.requirements && Array.isArray(course.requirements) ? [...course.requirements] : [],
        objectives: course.objectives && Array.isArray(course.objectives) ? [...course.objectives] : [],
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: 'Legal & Compliance',
        type: 'free',
        price: 0,
        currency: 'MYR',
        duration: 60,
        level: 'beginner',
        language: 'English',
        thumbnail: '',
        instructor: user?._id || (mentors[0]?._id ? mentors[0]._id : ''),
        isPublished: true,
        approvalStatus: 'approved',
        adminFeedback: '',
        tags: ['Legal & Compliance'],
        requirements: ['Basic understanding of business operations'],
        objectives: ['Master regulatory compliance standards and frameworks'],
      });
    }
    setCourseModalOpen(true);
  };

  // Tag Helpers
  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || newTag).trim();
    if (val && !courseForm.tags.includes(val)) {
      setCourseForm((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCourseForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Requirement Helpers
  const handleAddRequirement = () => {
    const val = newRequirement.trim();
    if (val) {
      setCourseForm((prev) => ({ ...prev, requirements: [...prev.requirements, val] }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setCourseForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx),
    }));
  };

  // Objective Helpers
  const handleAddObjective = () => {
    const val = newObjective.trim();
    if (val) {
      setCourseForm((prev) => ({ ...prev, objectives: [...prev.objectives, val] }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (idx: number) => {
    setCourseForm((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: courseForm.title,
        description: courseForm.description,
        shortDescription: courseForm.shortDescription,
        category: courseForm.category,
        type: courseForm.type,
        price: courseForm.type === 'free' ? 0 : courseForm.price,
        currency: courseForm.currency,
        duration: courseForm.duration,
        level: courseForm.level,
        language: courseForm.language,
        thumbnail: courseForm.thumbnail,
        instructor: courseForm.instructor || user?._id,
        isPublished: courseForm.isPublished,
        approvalStatus: courseForm.approvalStatus,
        adminFeedback: courseForm.adminFeedback,
        tags: courseForm.tags,
        requirements: courseForm.requirements,
        objectives: courseForm.objectives,
      };

      if (courseForm.slug && courseForm.slug.trim()) {
        payload.slug = courseForm.slug.trim();
      }

      if (editingCourse) {
        await updateAdminCourse({ id: editingCourse._id, ...payload }).unwrap();
        showToast('Course updated successfully!', 'success');
      } else {
        await createAdminCourse(payload).unwrap();
        showToast('Course created successfully!', 'success');
      }
      setCourseModalOpen(false);
      refetchCourses();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to save course', 'error');
    }
  };

  const handleQuickApprove = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve & Publish Course Live?',
      description: `Are you sure you want to approve "${course.title}" and immediately publish it live to the public student catalog?`,
      confirmText: 'Yes, Approve & Publish',
      cancelText: 'Cancel',
      variant: 'success',
      icon: 'check',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await updateAdminCourse({
            id: course._id,
            approvalStatus: 'approved',
            isPublished: true,
            adminFeedback: '',
          }).unwrap();
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(`"${course.title}" approved and published live!`, 'success');
          refetchCourses();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          showToast(err?.data?.message || 'Failed to approve course', 'error');
        }
      },
    });
  };

  const handleOpenReviewModal = (course: Course) => {
    setSelectedCourseForReview(course);
    setReviewFeedbackInput(course.adminFeedback || '');
    setReviewModalOpen(true);
  };

  const handleConfirmRevisionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForReview) return;
    if (!reviewFeedbackInput.trim()) {
      showToast('Please provide feedback or revision notes for the mentor.', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await updateAdminCourse({
        id: selectedCourseForReview._id,
        approvalStatus: 'rejected',
        isPublished: false,
        adminFeedback: reviewFeedbackInput.trim(),
      }).unwrap();
      setReviewModalOpen(false);
      showToast('Revision request sent to the mentor successfully.', 'success');
      refetchCourses();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to request revisions', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteCourse = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Course?',
      description: `Are you sure you want to permanently delete "${title}"? This will delete all lessons and cannot be undone.`,
      confirmText: 'Yes, Delete Course',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: 'trash',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await deleteAdminCourse(id).unwrap();
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast('Course permanently deleted.', 'success');
          refetchCourses();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          showToast(err?.data?.message || 'Failed to delete course', 'error');
        }
      },
    });
  };

  const handleTogglePublish = (id: string, currentStatus: boolean, title?: string) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Unpublish Course?' : 'Publish Course Live?',
      description: currentStatus
        ? `Are you sure you want to unpublish "${title || 'this course'}"? It will be hidden from the public student catalog.`
        : `Are you sure you want to publish "${title || 'this course'}" live? It will become visible in the public student catalog immediately.`,
      confirmText: currentStatus ? 'Yes, Unpublish' : 'Yes, Publish Live',
      cancelText: 'Cancel',
      variant: currentStatus ? 'warning' : 'primary',
      icon: 'toggle',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await toggleCoursePublish({ id, isPublished: !currentStatus }).unwrap();
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast(currentStatus ? 'Course unpublished.' : 'Course published live!', 'success');
          refetchCourses();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          showToast(err?.data?.message || 'Failed to toggle publication state', 'error');
        }
      },
    });
  };

  const handleToggleType = async (course: Course) => {
    const newType = course.type === 'free' ? 'premium' : 'free';
    const newPrice = newType === 'free' ? 0 : course.price > 0 ? course.price : 197;
    try {
      await updateAdminCourse({
        id: course._id,
        type: newType,
        price: newPrice,
      }).unwrap();
      showToast(`Course tier updated to ${newType}.`, 'success');
      refetchCourses();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update course type', 'error');
    }
  };

  // Lesson Management
  const handleOpenLessonsModal = (course: Course) => {
    setSelectedCourseForLessons(course);
    setLessonForm({
      title: '',
      content: '',
      duration: 15,
      type: 'video',
      videoUrl: '',
      isPreview: false,
      order: (course.lessons?.length || 0) + 1,
    });
    setLessonModalOpen(true);
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons) return;
    const courseId = selectedCourseForLessons._id || (selectedCourseForLessons as any).id;
    if (!courseId) return;

    try {
      const updatedRes: any = await addCourseLesson({
        courseId,
        lesson: lessonForm,
      }).unwrap();

      const updatedCourse = updatedRes?.course || updatedRes?.data?.course || updatedRes;
      setSelectedCourseForLessons(updatedCourse);
      setLessonForm({
        title: '',
        content: '',
        duration: 15,
        type: 'video',
        videoUrl: '',
        isPreview: false,
        order: (updatedCourse.lessons?.length || 0) + 1,
      });
      showToast('Lesson added to curriculum!', 'success');
      refetchCourses();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to add lesson', 'error');
    }
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle?: string) => {
    if (!selectedCourseForLessons) return;
    const courseId = selectedCourseForLessons._id || (selectedCourseForLessons as any).id;
    if (!courseId) return;

    setConfirmModal({
      isOpen: true,
      title: 'Remove Lesson Module?',
      description: `Are you sure you want to remove lesson "${lessonTitle || 'this module'}" from the curriculum?`,
      confirmText: 'Yes, Remove Lesson',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: 'trash',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const updatedRes: any = await deleteCourseLesson({
            courseId,
            lessonId,
          }).unwrap();
          const updatedCourse = updatedRes?.course || updatedRes?.data?.course || updatedRes;
          setSelectedCourseForLessons(updatedCourse);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          showToast('Lesson removed successfully.', 'success');
          refetchCourses();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          showToast(err?.data?.message || 'Failed to remove lesson', 'error');
        }
      },
    });
  };

  return (
    <>
      <AdminHeader
        title="Course Management & Curriculum"
        icon={BookOpen}
        actions={
          <>
            <button
              onClick={() => refetchCourses()}
              disabled={isFetchingCourses}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh Courses"
            >
              <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingCourses ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={() => handleOpenCourseModal()}
              className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">Course Catalog & Curriculum Engine</h2>
              <p className="text-xs text-gray-300">
                Design masterclasses, review mentor submissions, configure modular video curriculums, pricing, and approvals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15">
              {stats.total} Total Masterclasses
            </span>
          </div>
        </div>

        {/* Pending Courses Approval Alert Banner */}
        {Number(stats.pending || 0) > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300 rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-amber-950">
                  {stats.pending} Course{stats.pending > 1 ? 's' : ''} Awaiting Admin Approval
                </h4>
                <p className="text-[11px] text-amber-800 font-medium">
                  Mentors have submitted masterclasses that require administrative review and verification before publishing live to students.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCourseApprovalFilter('pending');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Review Pending Courses ({stats.pending})</span>
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Courses</span>
            <p className="text-xl font-black text-[#041c53]">{stats.total}</p>
          </div>
          <div
            onClick={() => {
              setCourseApprovalFilter(courseApprovalFilter === 'pending' ? 'all' : 'pending');
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
              courseApprovalFilter === 'pending'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 shadow-md'
                : 'bg-white border-gray-100 shadow-sm hover:border-amber-200'
            }`}
          >
            <span className="text-[11px] font-bold uppercase text-amber-600 flex items-center justify-between">
              <span>Pending Review</span>
              {Number(stats.pending || 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </span>
            <p className="text-xl font-black text-amber-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Published Online</span>
            <p className="text-xl font-black text-emerald-600">{stats.published}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Drafts / Revisions</span>
            <p className="text-xl font-black text-gray-600">{(stats.draft || 0) + (stats.rejected || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Premium / Member</span>
            <p className="text-xl font-black text-[#ff447e]">{stats.premium}</p>
          </div>
        </div>

        {/* Filter / Search / Sorting Bar */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search input with clear button */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, description, category, tags..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white transition-all font-medium text-gray-800"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Approval Filter */}
              <select
                value={courseApprovalFilter}
                onChange={(e) => {
                  setCourseApprovalFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  courseApprovalFilter === 'pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 ring-1 ring-amber-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <option value="all">All Approval Status</option>
                <option value="pending">🟡 Pending Admin Approval {Number(stats.pending || 0) > 0 ? `(${stats.pending})` : ''}</option>
                <option value="approved">🟢 Approved</option>
                <option value="rejected">🔴 Revision Requested</option>
                <option value="draft">⚪ Draft</option>
              </select>

              {/* Category */}
              <select
                value={courseCategoryFilter}
                onChange={(e) => {
                  setCourseCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Tier / Type */}
              <select
                value={courseTierFilter}
                onChange={(e) => {
                  setCourseTierFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free Courses</option>
                <option value="premium">Premium / Member</option>
              </select>

              {/* Publish Status */}
              <select
                value={courseStatusFilter}
                onChange={(e) => {
                  setCourseStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="all">All Visibility</option>
                <option value="published">Published Online</option>
                <option value="draft">Unpublished / Hidden</option>
              </select>

              {/* Level */}
              <select
                value={courseLevelFilter}
                onChange={(e) => {
                  setCourseLevelFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Sorting */}
              <select
                value={courseSort}
                onChange={(e) => {
                  setCourseSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-pink-50/60 border border-pink-200 rounded-xl text-xs font-bold text-[#ff447e] focus:outline-none focus:border-[#ff447e] cursor-pointer"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="title">Title (A - Z)</option>
                <option value="-title">Title (Z - A)</option>
                <option value="-price">Price: High to Low</option>
                <option value="price">Price: Low to High</option>
                <option value="-duration">Duration: Longest</option>
                <option value="duration">Duration: Shortest</option>
                <option value="-enrollmentCount">Most Enrolled</option>
              </select>

              {/* Reset Filters */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Courses List / Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {isLoadingCourses ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
              <p className="text-xs text-gray-400 mt-3 font-semibold">Loading courses from server...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#041c53]">No Courses Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No courses matched your search or active filter criteria. Try clearing filters or creating a new course.
              </p>
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              {isFetchingCourses && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="bg-white/90 shadow-lg px-4 py-2 rounded-2xl border border-gray-100 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#ff447e] animate-spin" />
                    <span className="text-xs font-bold text-[#041c53]">Updating...</span>
                  </div>
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                    <th
                      className="py-3.5 px-5 cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('title')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Course Title & Details</span>
                        {getSortIcon('title')}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('level')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Instructor & Level</span>
                        {getSortIcon('level')}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('category')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Category & Tags</span>
                        {getSortIcon('category')}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('price')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Tier & Price</span>
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">Lessons</th>
                    <th className="py-3.5 px-4 text-center">Approval & Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {courses.map((course) => {
                    const instructorObj = typeof course.instructor === 'object' ? course.instructor : null;
                    const status = course.approvalStatus || (course.isPublished ? 'approved' : 'draft');

                    return (
                      <tr key={course._id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                course.thumbnail ||
                                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80'
                              }
                              alt={course.title}
                              className="w-14 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[#041c53] line-clamp-1">{course.title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {course.duration ? `${course.duration} mins` : 'Flexible'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {course.language || 'English'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-xs flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>{instructorObj?.name || 'Assigned Faculty'}</span>
                            </p>
                            <span className="inline-block text-[10px] font-semibold text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                              {course.level || 'Beginner'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                              {course.category}
                            </span>
                            {course.tags && course.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {course.tags.slice(0, 2).map((t, i) => (
                                  <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    #{t}
                                  </span>
                                ))}
                                {course.tags.length > 2 && (
                                  <span className="text-[9px] text-gray-400 font-bold">
                                    +{course.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleType(course)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                              course.type === 'free'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-pink-50 text-[#ff447e] hover:bg-pink-100'
                            }`}
                            title="Click to toggle between Free and Premium"
                          >
                            {course.type === 'free'
                              ? 'Free Access'
                              : `${course.currency || 'MYR'} ${course.price || 0}`}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenLessonsModal(course)}
                            className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#041c53] font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-[#ff447e]" />
                            <span>{course.lessons?.length || 0} Lessons</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Pending Approval</span>
                              </span>
                            ) : status === 'rejected' ? (
                              <span
                                title={course.adminFeedback || 'Revisions requested'}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200 cursor-help"
                              >
                                <span>Needs Revision</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleTogglePublish(course._id, course.isPublished || false, course.title)}
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                                  course.isPublished
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {course.isPublished ? 'Published' : 'Draft / Hidden'}
                              </button>
                            )}

                            {/* Pending Quick Action Buttons */}
                            {status === 'pending' && (
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={() => handleQuickApprove(course)}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition-colors shadow-xs"
                                  title="Approve & Publish Live"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleOpenReviewModal(course)}
                                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold transition-colors"
                                  title="Request Changes / Reject"
                                >
                                  Changes
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/courses/${course.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Live Public Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleOpenLessonsModal(course)}
                              className="p-1.5 text-gray-400 hover:text-[#ff447e] rounded-lg hover:bg-gray-100 transition-colors"
                              title="Manage Curriculum Lessons"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenCourseModal(course)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit Course Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id, course.title)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                <span>
                  Showing <strong className="text-[#041c53] font-bold">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
                  <strong className="text-[#041c53] font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
                  <strong className="text-[#041c53] font-bold">{pagination.total}</strong> courses
                </span>
                <span className="hidden sm:inline text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Rows per page:</span>
                  <select
                    value={pageLimit}
                    onChange={(e) => {
                      setPageLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#041c53] focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={pagination.page <= 1 || isFetchingCourses}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || isFetchingCourses}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const isActive = pageNum === pagination.page;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => setCurrentPage(Number(pageNum))}
                        disabled={isFetchingCourses}
                        className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isActive
                            ? 'bg-gradient-to-r from-[#ff447e] to-[#ff2a6d] text-white shadow-md shadow-pink-500/20'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#041c53]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages || isFetchingCourses}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(pagination.pages)}
                  disabled={pagination.page >= pagination.pages || isFetchingCourses}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: CREATE / EDIT COURSE */}
      {courseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#041c53]">
                    {editingCourse ? 'Edit Masterclass Course' : 'Create New Masterclass'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure curriculum details, instructor assignment, pricing, and learning requirements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'general'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1. Basic & Faculty
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'pricing'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                2. Pricing & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'curriculum'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                3. Description & Tags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outcomes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === 'outcomes'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                4. Objectives & Prerequisites
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-6 flex-1">
              {/* TAB 1: BASIC & FACULTY */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Islamic Estate & Inheritance Law Masterclass"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g., Legal & Compliance, Wealth Planning"
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCourseForm({ ...courseForm, category: cat })}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                                courseForm.category === cat
                                  ? 'bg-[#ff447e]/10 text-[#ff447e] border-[#ff447e]/30 font-bold'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Assigned Faculty / Instructor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseForm.instructor}
                        onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      >
                        {user && <option value={user._id}>{user.name} (Admin Current User)</option>}
                        {mentors.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.headline || 'Faculty Mentor'})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Select which certified mentor or admin leads this curriculum.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Difficulty Level
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Language
                      </label>
                      <select
                        value={courseForm.language}
                        onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Est. Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="60"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Custom URL Slug <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. islamic-estate-planning-2026 (leave blank to auto-generate from title)"
                      value={courseForm.slug}
                      onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & MEDIA */}
              {activeTab === 'pricing' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Course Tier <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseForm.type}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            type: e.target.value as any,
                            price: e.target.value === 'free' ? 0 : courseForm.price || 199,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      >
                        <option value="free">Free Access</option>
                        <option value="premium">Premium Paid</option>
                        <option value="member">Exclusive Member Tier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Billing Currency
                      </label>
                      <select
                        value={courseForm.currency}
                        onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff447e] focus:bg-white"
                      >
                        {CURRENCIES.map((cur) => (
                          <option key={cur.code} value={cur.code}>
                            {cur.name} ({cur.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Price Amount ({courseForm.currency})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          disabled={courseForm.type === 'free'}
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#041c53] focus:outline-none focus:border-[#ff447e] focus:bg-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label="Course Thumbnail Image"
                      value={courseForm.thumbnail}
                      onChange={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                      folder={StorageFolders.COURSES_THUMBNAILS}
                      aspectRatio="video"
                      helperText="High quality 16:9 image recommended (1280x720px). Supports PNG, JPG, WEBP."
                    />
                  </div>

                  {/* Approval Status & Publication Controls */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <label className="block text-xs font-bold text-[#041c53] uppercase">
                      Administrative Review & Approval Status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <select
                          value={courseForm.approvalStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            setCourseForm((prev) => ({
                              ...prev,
                              approvalStatus: newStatus,
                              isPublished: newStatus === 'approved' ? prev.isPublished : false,
                            }));
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#ff447e]"
                        >
                          <option value="approved">🟢 Approved (Ready to Publish)</option>
                          <option value="pending">🟡 Pending Admin Review</option>
                          <option value="rejected">🔴 Revision Needed / Rejected</option>
                          <option value="draft">⚪ Draft Authoring Mode</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-pink-50/20 transition-colors">
                        <input
                          type="checkbox"
                          checked={courseForm.isPublished}
                          disabled={courseForm.approvalStatus !== 'approved'}
                          onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                          className="w-4 h-4 rounded text-[#ff447e] focus:ring-[#ff447e] disabled:opacity-40"
                        />
                        <div>
                          <p className={`text-xs font-bold ${courseForm.approvalStatus !== 'approved' ? 'text-gray-400' : 'text-[#041c53]'}`}>
                            Publish Live to Students
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {courseForm.approvalStatus === 'approved'
                              ? 'Visible on public catalog'
                              : 'Requires approval to be published'}
                          </p>
                        </div>
                      </label>
                    </div>

                    {courseForm.approvalStatus === 'rejected' && (
                      <div className="pt-2 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">
                          Feedback / Revision Notes for Mentor *
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Detail required adjustments, missing videos, or compliance criteria before re-submission..."
                          value={courseForm.adminFeedback}
                          onChange={(e) => setCourseForm({ ...courseForm, adminFeedback: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-rose-300 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DESCRIPTION & TAGS */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Short Summary / Value Proposition Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Brief 1-sentence value proposition for cards..."
                      value={courseForm.shortDescription}
                      onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Full Description & Syllabus Synopsis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Detailed course overview, learning methodology, curriculum breakdown, and practical applications..."
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white resize-y"
                    />
                  </div>

                  {/* Tags Manager */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Tags & Search Keywords
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Type tag and press Add (e.g., SME Tax, Estate Law)"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] focus:bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddTag()}
                        className="px-3 py-2 bg-[#041c53] hover:bg-[#092b77] text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>

                    {/* Quick Suggestion Tags */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Suggestions:</span>
                      {SUGGESTED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          disabled={courseForm.tags.includes(tag)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                            courseForm.tags.includes(tag)
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff447e] hover:text-[#ff447e]'
                          }`}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    {/* Selected Tags Badge List */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {courseForm.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-[#ff447e] text-xs font-bold"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OBJECTIVES & PREREQUISITES */}
              {activeTab === 'outcomes' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Learning Objectives */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#041c53] uppercase flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-[#ff447e]" />
                        <span>Key Learning Objectives (&quot;What you will learn&quot;)</span>
                      </label>
                      <span className="text-[11px] text-gray-400 font-bold">
                        {courseForm.objectives.length} Added
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Master Islamic Will Drafting according to state fatwa enactments"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddObjective();
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        className="btn btn-primary text-xs py-2 px-4 shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {courseForm.objectives.map((obj, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-gray-200 text-xs text-gray-800"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{obj}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(idx)}
                            className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {courseForm.objectives.length === 0 && (
                        <p className="text-[11px] text-gray-400 text-center py-2">
                          No learning outcomes added yet. Add at least 2-4 objectives to enhance course value.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Requirements & Prerequisites */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#041c53] uppercase flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Prerequisites & Requirements</span>
                      </label>
                      <span className="text-[11px] text-gray-400 font-bold">
                        {courseForm.requirements.length} Added
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Basic comprehension of Malaysian commercial structures"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRequirement();
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="btn btn-primary text-xs py-2 px-4 shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {courseForm.requirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-gray-200 text-xs text-gray-800"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{req}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {courseForm.requirements.length === 0 && (
                        <p className="text-[11px] text-gray-400 text-center py-2">
                          No prerequisites added. Students can enroll with no prior background knowledge.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-[11px] text-gray-400">
                  {editingCourse ? `Editing ID: ${editingCourse._id}` : 'All changes save to MongoDB database'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseModalOpen(false)}
                    className="btn btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCourse || isUpdatingCourse}
                    className="btn btn-primary text-xs py-2.5 px-6 shadow-sm font-bold flex items-center gap-2"
                  >
                    {isCreatingCourse || isUpdatingCourse ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : editingCourse ? (
                      'Update Masterclass'
                    ) : (
                      'Create Masterclass'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LESSONS & CURRICULUM MANAGER */}
      {lessonModalOpen && selectedCourseForLessons && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#041c53]">Curriculum & Lessons Engine</h3>
                  <p className="text-xs text-gray-400">{selectedCourseForLessons.title}</p>
                </div>
              </div>
              <button
                onClick={() => setLessonModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Lesson Form */}
            <form onSubmit={handleAddLesson} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="text-xs font-bold uppercase text-[#041c53] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#ff447e]" />
                <span>Add Lesson Module</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Module 1: Legal Frameworks & Definitions"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Lesson Type</label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="video">Video Lesson</option>
                    <option value="text">Text Article / Notes</option>
                    <option value="quiz">Interactive Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>
              </div>

              {lessonForm.type === 'video' && (
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <VideoUploader
                    label="Lesson Video (Cloud Upload & Embed Stream)"
                    value={lessonForm.videoUrl}
                    onChange={(url) => setLessonForm({ ...lessonForm, videoUrl: url })}
                    folder={StorageFolders.COURSES_LESSONS}
                    helperText="Upload HD video files (MP4, WebM, MOV) directly to active storage or paste external cloud streaming URLs."
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Lesson Body Content / Reading Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Key summary takeaways, downloadable links, reference documentation, or article content..."
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={lessonForm.isPreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                    className="rounded text-[#ff447e] focus:ring-[#ff447e]"
                  />
                  <span>Allow Free Public Preview (Sample Lesson)</span>
                </label>

                <button
                  type="submit"
                  disabled={isAddingLesson}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm font-bold"
                >
                  {isAddingLesson ? 'Adding Lesson...' : 'Save Lesson'}
                </button>
              </div>
            </form>

            {/* Existing Lessons List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-gray-500">
                  Curriculum Modules ({selectedCourseForLessons.lessons?.length || 0})
                </h4>
                <span className="text-[11px] text-gray-400 font-semibold">
                  Total Duration:{' '}
                  {selectedCourseForLessons.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0} mins
                </span>
              </div>

              {!selectedCourseForLessons.lessons || selectedCourseForLessons.lessons.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8 bg-gray-50 rounded-2xl border border-gray-200">
                  No lessons added yet. Use the module builder above to craft your curriculum.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedCourseForLessons.lessons.map((lesson: Lesson, idx: number) => (
                    <div
                      key={lesson._id || idx}
                      className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-[#041c53] text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#041c53] truncate">{lesson.title}</p>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                              {lesson.type || 'video'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration} mins
                            </span>
                            {lesson.videoUrl && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-semibold truncate max-w-[200px]">
                                  Video linked
                                </span>
                              </>
                            )}
                            {lesson.isPreview && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Free Preview
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLesson(lesson._id || '', lesson.title)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white transition-colors"
                        title="Remove Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="btn btn-outline text-xs py-2 px-6 font-bold"
              >
                Close Curriculum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST COURSE REVISIONS / REJECT */}
      {reviewModalOpen && selectedCourseForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">Request Course Revision</h3>
                  <p className="text-xs text-gray-400">Send feedback notes to the instructor</p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRevisionRequest} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold text-[#041c53]">{selectedCourseForReview.title}</p>
                <p className="text-[11px] text-gray-400">
                  Instructor:{' '}
                  {typeof selectedCourseForReview.instructor === 'object'
                    ? selectedCourseForReview.instructor?.name
                    : 'Assigned Faculty'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Revision Reason & Feedback Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what needs to be improved (e.g., video quality, lesson outlines, missing syllabus details) before this course can be approved..."
                  value={reviewFeedbackInput}
                  onChange={(e) => setReviewFeedbackInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Sending Feedback...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold border ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : confirmModal.variant === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : confirmModal.variant === 'warning'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-blue-50 text-[#041c53] border-blue-200'
                }`}
              >
                {confirmModal.icon === 'trash' ? (
                  <Trash2 className="w-6 h-6" />
                ) : confirmModal.icon === 'check' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : confirmModal.icon === 'toggle' ? (
                  <Globe className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-extrabold text-base md:text-lg text-[#041c53] leading-snug">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={confirmModal.isLoading}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={confirmModal.isLoading}
                onClick={() => confirmModal.onConfirm()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                    : confirmModal.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : confirmModal.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-[#041c53] hover:bg-[#092b77] shadow-blue-900/20'
                }`}
              >
                {confirmModal.isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmModal.confirmText || 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 max-w-sm backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-950/95 text-white border-rose-800'
                : 'bg-[#041c53]/95 text-white border-blue-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-pink-400 shrink-0" />
            )}
            <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
