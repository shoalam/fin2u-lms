'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAddCourseLessonMutation,
  useDeleteCourseLessonMutation,
  Course,
  Lesson,
} from '@/store/api/courseApi';
import ImageUploader from '@/components/common/ImageUploader';
import VideoUploader from '@/components/common/VideoUploader';
import { StorageFolders } from '@/constants/storage-folders';
import {
  BookOpen,
  PlusCircle,
  Search,
  CheckCircle,
  ArrowRight,
  Layers,
  Sparkles,
  DollarSign,
  Clock,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Star,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  Globe,
  Tag,
  Target,
  AlertCircle,
  Edit,
  Trash2,
  Play,
  PlayCircle,
  FileText,
  Video,
  Check,
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

function MentorCoursesContent() {
  const { user } = useSelector((state: RootState) => state.auth);
  const searchParams = useSearchParams();

  // Filter & Pagination States
  const [courseSearch, setCourseSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('');
  const [courseTierFilter, setCourseTierFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [courseApprovalFilter, setCourseApprovalFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'draft'
  >('all');
  const [courseSort, setCourseSort] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'curriculum' | 'outcomes'>('general');
  const [submissionType, setSubmissionType] = useState<'submit' | 'draft'>('submit');

  // Full Course Form
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
    tags: [] as string[],
    requirements: [] as string[],
    objectives: [] as string[],
  });

  // Dynamic Array Input Helpers
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');

  // Curriculum & Lessons Modal
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(courseSearch.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [courseSearch]);

  const instructorId = user?.role === 'admin' ? undefined : user?._id;

  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
    isFetching: isFetchingCourses,
  } = useGetCoursesQuery({
    instructor: instructorId,
    search: debouncedSearch || undefined,
    category: courseCategoryFilter || undefined,
    type: courseTierFilter !== 'all' ? courseTierFilter : undefined,
    approvalStatus: courseApprovalFilter === 'all' ? undefined : courseApprovalFilter,
    sort: courseSort,
    page: currentPage,
    limit: pageLimit,
  });

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [addCourseLesson, { isLoading: isAddingLesson }] = useAddCourseLessonMutation();
  const [deleteCourseLesson, { isLoading: isDeletingLesson }] = useDeleteCourseLessonMutation();

  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination || {
    total: 0,
    page: 1,
    limit: pageLimit,
    pages: 1,
  };

  const stats = coursesData?.stats || {
    total: courses.length,
    published: courses.filter((c) => c.isPublished && (c.approvalStatus === 'approved' || !c.approvalStatus)).length,
    pending: courses.filter((c) => c.approvalStatus === 'pending').length,
    rejected: courses.filter((c) => c.approvalStatus === 'rejected').length,
    draft: courses.filter((c) => !c.isPublished && c.approvalStatus !== 'pending' && c.approvalStatus !== 'rejected').length,
    totalStudents: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
  };

  const categories = Array.from(
    new Set([...POPULAR_CATEGORIES, ...(coursesData?.categories || [])])
  );

  // Auto-open Create Course modal if query param ?create=true or ?action=create is present
  useEffect(() => {
    if (searchParams.get('create') === 'true' || searchParams.get('action') === 'create') {
      handleOpenCourseModal();
    }
  }, [searchParams]);

  const handleOpenCourseModal = (course?: Course) => {
    setActiveTab('general');
    setNewTag('');
    setNewRequirement('');
    setNewObjective('');

    if (course) {
      setEditingCourse(course);
      setSubmissionType(course.approvalStatus === 'draft' ? 'draft' : 'submit');
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
        tags: course.tags && Array.isArray(course.tags) ? [...course.tags] : [],
        requirements: course.requirements && Array.isArray(course.requirements) ? [...course.requirements] : [],
        objectives: course.objectives && Array.isArray(course.objectives) ? [...course.objectives] : [],
      });
    } else {
      setEditingCourse(null);
      setSubmissionType('submit');
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
        tags: ['Legal & Compliance'],
        requirements: ['Basic understanding of corporate or business fundamentals'],
        objectives: ['Master regulatory compliance & industry best practices'],
      });
    }
    setShowCourseModal(true);
  };

  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    if (typeof window !== 'undefined' && (searchParams.get('create') || searchParams.get('action'))) {
      const url = new URL(window.location.href);
      url.searchParams.delete('create');
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
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

  const handleSort = (field: string) => {
    if (courseSort === field) {
      setCourseSort(`-${field}`);
    } else if (courseSort === `-${field}`) {
      setCourseSort(field);
    } else {
      setCourseSort(field === 'createdAt' || field === 'price' || field === 'enrollmentCount' ? `-${field}` : field);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (courseSort === field) {
      return <ChevronUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    if (courseSort === `-${field}`) {
      return <ChevronDown className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />;
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

  const handleCourseSubmit = async (e: React.FormEvent) => {
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
        tags: courseForm.tags,
        requirements: courseForm.requirements,
        objectives: courseForm.objectives,
        approvalStatus: submissionType === 'draft' ? 'draft' : 'pending',
      };

      if (courseForm.slug && courseForm.slug.trim()) {
        payload.slug = courseForm.slug.trim();
      }

      if (editingCourse) {
        await updateCourse({ id: editingCourse._id, ...payload }).unwrap();
      } else {
        await createCourse(payload).unwrap();
      }

      handleCloseCourseModal();
      refetchCourses();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit course for review');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (course.isPublished || course.approvalStatus === 'approved') {
      alert('Approved and published courses cannot be deleted by mentors. Please contact an administrator to unpublish or archive this course.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete draft course "${course.title}"?`)) return;
    try {
      await deleteCourse(course._id).unwrap();
      refetchCourses();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete course');
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
      refetchCourses();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    const courseId = selectedCourseForLessons._id || (selectedCourseForLessons as any).id;
    if (!courseId) return;

    try {
      const updatedRes: any = await deleteCourseLesson({
        courseId,
        lessonId,
      }).unwrap();
      const updatedCourse = updatedRes?.course || updatedRes?.data?.course || updatedRes;
      setSelectedCourseForLessons(updatedCourse);
      refetchCourses();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to remove lesson');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum Creator Studio</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">My Authored Masterclasses</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Author and submit masterclass curricula for admin review, manage video modules, configure pricing, and track enrollment metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchCourses()}
            disabled={isFetchingCourses}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff447e] ${isFetchingCourses ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenCourseModal()}
            className="btn btn-primary text-xs py-3 px-5 flex items-center gap-2 shadow-lg shadow-[#ff447e]/30 shrink-0 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Masterclass</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Total Curricula</span>
          <p className="text-2xl font-black text-[#041c53]">{stats.total}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Published & Live</span>
          <p className="text-2xl font-black text-emerald-600">{stats.published}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Under Admin Review</span>
          <p className="text-2xl font-black text-amber-500">{stats.pending || 0}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Total Enrolled Learners</span>
          <p className="text-2xl font-black text-blue-600">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search curricula by title, tags..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
          />
          {courseSearch && (
            <button
              onClick={() => setCourseSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <select
            value={courseCategoryFilter}
            onChange={(e) => {
              setCourseCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={courseTierFilter}
            onChange={(e) => {
              setCourseTierFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free Access</option>
            <option value="premium">Premium Paid</option>
          </select>

          <select
            value={courseApprovalFilter}
            onChange={(e) => {
              setCourseApprovalFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved & Published</option>
            <option value="pending">🟡 Pending Admin Approval</option>
            <option value="rejected">🔴 Revision Needed</option>
            <option value="draft">⚪ Drafts</option>
          </select>

          <select
            value={courseSort}
            onChange={(e) => {
              setCourseSort(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="-title">Title (Z-A)</option>
            <option value="-enrollmentCount">Most Learners</option>
            <option value="-rating">Highest Rated</option>
          </select>

          <select
            value={pageLimit}
            onChange={(e) => {
              setPageLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
          </select>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      {isLoadingCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#041c53]">No Courses Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {debouncedSearch || courseCategoryFilter || courseApprovalFilter !== 'all'
              ? 'No courses matched your query. Try resetting filters.'
              : 'Submit your first course curriculum for admin review to begin teaching Malaysian professionals.'}
          </p>
          <button onClick={() => handleOpenCourseModal()} className="btn btn-primary text-xs py-2.5 px-5">
            Create Masterclass
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => {
            const isPending = c.approvalStatus === 'pending';
            const isRejected = c.approvalStatus === 'rejected';
            const isApproved = c.approvalStatus === 'approved';

            return (
              <div
                key={c._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                        {c.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm bg-amber-500 text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm bg-red-500 text-white flex items-center gap-1">
                          <X className="w-3 h-3" />
                          <span>Revision Needed</span>
                        </span>
                      )}
                      {isApproved && c.isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm bg-emerald-500 text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      )}
                      {isApproved && !c.isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm bg-blue-600 text-white">
                          Approved (Hidden)
                        </span>
                      )}
                      {(!c.approvalStatus || c.approvalStatus === 'draft') && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm bg-gray-500 text-white">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold capitalize">
                        {c.level}
                      </span>
                      {c.language && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {c.language}
                        </span>
                      )}
                      {c.rating ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{c.rating.toFixed(1)}</span>
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-bold text-base text-[#041c53] line-clamp-2">{c.title}</h3>
                    {c.shortDescription && (
                      <p className="text-xs text-gray-500 line-clamp-2">{c.shortDescription}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>{c.lessons?.length || 0} Lessons ({c.duration || 60}m)</span>
                      <span className="font-bold text-[#041c53]">
                        {c.type === 'free' ? 'FREE' : `${c.currency || 'MYR'} ${c.price}`}
                      </span>
                    </div>

                    {isPending && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Awaiting administrator approval before publishing live to students.</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <X className="w-3.5 h-3.5 text-red-600" />
                          <span>Admin Feedback / Changes Requested:</span>
                        </div>
                        {c.adminFeedback && (
                          <p className="text-red-700 italic">&ldquo;{c.adminFeedback}&rdquo;</p>
                        )}
                        <p className="text-[10px] text-red-600 pt-0.5">Click &ldquo;Edit Details&rdquo; below to update and re-submit.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenLessonsModal(c)}
                      className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-[#041c53] hover:text-white text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Manage Curriculum Lessons & Videos"
                    >
                      <Play className="w-3.5 h-3.5 text-[#ff447e]" />
                      <span>Lessons ({c.lessons?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => handleOpenCourseModal(c)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-gray-100 transition-colors"
                      title="Edit Masterclass Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!c.isPublished && c.approvalStatus !== 'approved' && (
                      <button
                        onClick={() => handleDeleteCourse(c)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition-colors"
                        title="Delete Draft Masterclass"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/courses/${c.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                  <th
                    onClick={() => handleSort('title')}
                    className="py-3.5 px-5 cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th
                    onClick={() => handleSort('price')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Pricing</span>
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('enrollmentCount')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Learners</span>
                      {getSortIcon('enrollmentCount')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Curriculum</th>
                  <th className="py-3.5 px-4 text-center">Review & Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {courses.map((c) => {
                  const isPending = c.approvalStatus === 'pending';
                  const isRejected = c.approvalStatus === 'rejected';
                  const isApproved = c.approvalStatus === 'approved';

                  return (
                    <tr key={c._id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                            alt={c.title}
                            className="w-12 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#041c53] line-clamp-1">{c.title}</p>
                            <p className="text-[11px] text-gray-400">{c.lessons?.length || 0} Lessons • {c.duration || 60} mins</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-600">{c.category}</td>

                      <td className="py-3.5 px-4 capitalize text-gray-500">{c.level}</td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#041c53]">
                        {c.type === 'free' ? 'FREE' : `${c.currency || 'MYR'} ${c.price}`}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                        {c.enrollmentCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenLessonsModal(c)}
                          className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-[#041c53] hover:text-white text-gray-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3 h-3 text-[#ff447e]" />
                          <span>{c.lessons?.length || 0} Modules</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isPending && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Admin</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 inline-flex items-center gap-1" title={c.adminFeedback}>
                            <X className="w-3 h-3 text-red-500" />
                            <span>Revision Needed</span>
                          </span>
                        )}
                        {isApproved && c.isPublished && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>Published</span>
                          </span>
                        )}
                        {isApproved && !c.isPublished && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            Approved (Hidden)
                          </span>
                        )}
                        {(!c.approvalStatus || c.approvalStatus === 'draft') && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCourseModal(c)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Masterclass Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!c.isPublished && c.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleDeleteCourse(c)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Delete Draft Masterclass"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/courses/${c.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg bg-pink-50 text-[#ff447e] hover:bg-[#ff447e] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-[#041c53]">{(currentPage - 1) * pageLimit + 1}</span> to{' '}
            <span className="font-bold text-[#041c53]">
              {Math.min(currentPage * pageLimit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#041c53]">{pagination.total}</span> masterclasses
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={pagination.page <= 1 || isFetchingCourses}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || isFetchingCourses}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

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

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page >= pagination.pages || isFetchingCourses}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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

      {/* FULL 4-TAB CREATE / EDIT MASTERCLASS MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#041c53]">
                    {editingCourse ? 'Edit Masterclass Course' : 'Create New Masterclass'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure curriculum details, pricing, learning requirements, and submit for admin approval.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseCourseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Revision Feedback Callout if rejected */}
            {editingCourse?.approvalStatus === 'rejected' && editingCourse?.adminFeedback && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Admin Feedback / Revision Instructions:</span>
                </div>
                <p className="text-rose-700 italic pl-6">&ldquo;{editingCourse.adminFeedback}&rdquo;</p>
              </div>
            )}

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
                1. Basic & Details
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

            <form onSubmit={handleCourseSubmit} className="space-y-5 flex-1">
              {/* TAB 1: BASIC & DETAILS */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Islamic Estate & Inheritance Law Masterclass 2026"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g., Legal & Compliance, Corporate Tax"
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

                  {/* Submission Workflow Option */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-[#041c53] uppercase">
                      Course Publication & Submission Action
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setSubmissionType('submit')}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          submissionType === 'submit'
                            ? 'bg-pink-50/50 border-[#ff447e] shadow-xs'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="submissionType"
                          checked={submissionType === 'submit'}
                          onChange={() => setSubmissionType('submit')}
                          className="mt-0.5 text-[#ff447e] focus:ring-[#ff447e]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#041c53]">Submit for Admin Review & Approval</p>
                          <p className="text-[11px] text-gray-500">
                            Sent to administrators to inspect syllabus & publish live to students.
                          </p>
                        </div>
                      </label>

                      <label
                        onClick={() => setSubmissionType('draft')}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          submissionType === 'draft'
                            ? 'bg-pink-50/50 border-[#ff447e] shadow-xs'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="submissionType"
                          checked={submissionType === 'draft'}
                          onChange={() => setSubmissionType('draft')}
                          className="mt-0.5 text-[#ff447e] focus:ring-[#ff447e]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#041c53]">Save as Private Draft</p>
                          <p className="text-[11px] text-gray-500">
                            Keep working on modules and submit whenever you are ready.
                          </p>
                        </div>
                      </label>
                    </div>
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
                      placeholder="Brief 1-sentence value proposition for preview cards..."
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
                        placeholder="e.g. Master Islamic Will Drafting according to state enactments"
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
                        className="btn btn-primary text-xs py-2 px-4 shrink-0 font-bold"
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
                        className="btn btn-primary text-xs py-2 px-4 shrink-0 font-bold"
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
                  {editingCourse ? `Editing ID: ${editingCourse._id}` : 'Submissions undergo Admin verification'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseCourseModal}
                    className="btn btn-outline text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="btn btn-primary text-xs py-2.5 px-6 shadow-sm font-bold flex items-center gap-2"
                  >
                    {isCreating || isUpdating ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : editingCourse ? (
                      submissionType === 'draft' ? 'Save as Draft' : 'Update & Re-Submit'
                    ) : (
                      submissionType === 'draft' ? 'Save as Draft' : 'Submit for Review'
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
                        onClick={() => handleDeleteLesson(lesson._id || '')}
                        disabled={isDeletingLesson}
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
    </div>
  );
}

export default function MentorCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-44 bg-[#041c53]/10 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-3xl animate-pulse" />
        </div>
      }
    >
      <MentorCoursesContent />
    </Suspense>
  );
}
