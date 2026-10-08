'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAllEnrollmentsQuery,
  useGetAdminStudentsQuery,
  useGetAdminCoursesQuery,
  useEnrollStudentMutation,
  useUnenrollStudentMutation,
  useUpdateEnrollmentMutation,
  AdminEnrollmentItem,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Layers,
  Search,
  PlusCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Lock,
  Gift,
  Zap,
  Clock,
  X,
  RefreshCw,
  Award,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Server-side query state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('');
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState('');
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [enrollmentSort, setEnrollmentSort] = useState('-enrolledAt');
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

  // Query enrollments with API pagination, sorting & search
  const {
    data: enrollmentsResponse,
    isLoading: isLoadingEnrollments,
    refetch: refetchEnrollments,
    isFetching: isFetchingEnrollments,
  } = useGetAllEnrollmentsQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch || undefined,
      status: enrollmentStatusFilter || undefined,
      courseId: enrollmentCourseFilter || undefined,
      type: enrollmentTypeFilter !== 'all' ? enrollmentTypeFilter : undefined,
      sort: enrollmentSort,
    },
    { skip: user?.role !== 'admin' }
  );

  const enrollments = enrollmentsResponse?.enrollments || [];
  const pagination = enrollmentsResponse?.pagination || { total: 0, page: currentPage, limit: pageLimit, pages: 1 };
  const stats = enrollmentsResponse?.stats || { total: 0, active: 0, completed: 0, cancelled: 0, completionRate: 0 };

  const { data: studentsData } = useGetAdminStudentsQuery({ limit: 100 }, { skip: user?.role !== 'admin' });
  const students = studentsData?.students || [];
  const { data: coursesData } = useGetAdminCoursesQuery({ limit: 100 }, { skip: user?.role !== 'admin' });
  const courses = coursesData?.courses || [];

  const [enrollStudent, { isLoading: isEnrolling }] = useEnrollStudentMutation();
  const [unenrollStudent, { isLoading: isUnenrolling }] = useUnenrollStudentMutation();
  const [updateEnrollment, { isLoading: isUpdatingEnrollment }] = useUpdateEnrollmentMutation();

  // Modals
  const [directEnrollModalOpen, setDirectEnrollModalOpen] = useState(false);
  const [directEnrollUserId, setDirectEnrollUserId] = useState('');
  const [directEnrollCourseId, setDirectEnrollCourseId] = useState('');

  const [batchFreeEnrollModalOpen, setBatchFreeEnrollModalOpen] = useState(false);
  const [batchCourseId, setBatchCourseId] = useState('');
  const [batchSelectedUserIds, setBatchSelectedUserIds] = useState<string[]>([]);
  const [batchSearchQuery, setBatchSearchQuery] = useState('');

  const [editProgressModalOpen, setEditProgressModalOpen] = useState(false);
  const [selectedEnrollmentForEdit, setSelectedEnrollmentForEdit] = useState<AdminEnrollmentItem | null>(null);
  const [editProgressValue, setEditProgressValue] = useState(0);
  const [editStatusValue, setEditStatusValue] = useState<'active' | 'completed' | 'cancelled'>('active');

  const isAnyFilterActive =
    searchInput !== '' ||
    enrollmentStatusFilter !== '' ||
    enrollmentCourseFilter !== '' ||
    enrollmentTypeFilter !== 'all' ||
    enrollmentSort !== '-enrolledAt';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setEnrollmentStatusFilter('');
    setEnrollmentCourseFilter('');
    setEnrollmentTypeFilter('all');
    setEnrollmentSort('-enrolledAt');
    setCurrentPage(1);
  };

  const handleSortToggle = (field: string) => {
    if (enrollmentSort === field) {
      setEnrollmentSort(`-${field}`);
    } else if (enrollmentSort === `-${field}`) {
      setEnrollmentSort(field);
    } else {
      setEnrollmentSort(field === 'enrolledAt' || field === 'progress' || field === 'createdAt' ? `-${field}` : field);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (enrollmentSort === field) return <ArrowUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    if (enrollmentSort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5 text-[#ff447e]" />;
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

  const handleDirectEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEnrollUserId || !directEnrollCourseId) return;
    try {
      await enrollStudent({ studentId: directEnrollUserId, courseId: directEnrollCourseId }).unwrap();
      setDirectEnrollModalOpen(false);
      setDirectEnrollUserId('');
      setDirectEnrollCourseId('');
      refetchEnrollments();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to enroll student');
    }
  };

  const handleBatchEnroll = async () => {
    if (!batchCourseId || batchSelectedUserIds.length === 0) return;
    try {
      for (const uId of batchSelectedUserIds) {
        await enrollStudent({ studentId: uId, courseId: batchCourseId }).unwrap();
      }
      setBatchFreeEnrollModalOpen(false);
      setBatchCourseId('');
      setBatchSelectedUserIds([]);
      refetchEnrollments();
    } catch (err: any) {
      alert(err?.data?.message || 'Batch enrollment error');
    }
  };

  const handleOpenEditProgress = (item: AdminEnrollmentItem) => {
    setSelectedEnrollmentForEdit(item);
    setEditProgressValue(item.progress || 0);
    setEditStatusValue((item.status as any) || 'active');
    setEditProgressModalOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedEnrollmentForEdit) return;
    try {
      await updateEnrollment({
        id: selectedEnrollmentForEdit._id,
        progress: editProgressValue,
        status: editStatusValue,
      }).unwrap();
      setEditProgressModalOpen(false);
      refetchEnrollments();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update progress');
    }
  };

  const handleUnenroll = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to unenroll ${studentName}? This will reset learning history.`)) return;
    try {
      await unenrollStudent(enrollmentId).unwrap();
      refetchEnrollments();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to unenroll student');
    }
  };

  return (
    <>
      <AdminHeader
        title="Student Enrollments & Access Manager"
        icon={Layers}
        actions={
          <>
            <button
              onClick={() => refetchEnrollments()}
              disabled={isFetchingEnrollments}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh Enrollments"
            >
              <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingEnrollments ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={() => setBatchFreeEnrollModalOpen(true)}
              className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-[#ff447e]" />
              <span>Batch Free Grant</span>
            </button>
            <button
              onClick={() => setDirectEnrollModalOpen(true)}
              className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Direct Enroll</span>
            </button>
          </>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">Student Enrollments & Free Access</h2>
              <p className="text-xs text-gray-300">
                Audit student enrollment statuses, grant manual or complimentary access, and modify completion rates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15">
              {stats.total} Total Grants
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Enrollments</span>
            <p className="text-xl font-black text-[#041c53]">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Active Learners</span>
            <p className="text-xl font-black text-blue-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Completed Courses</span>
            <p className="text-xl font-black text-emerald-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Cancelled / Dropped</span>
            <p className="text-xl font-black text-amber-500">{stats.cancelled}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Completion Rate</span>
            <p className="text-xl font-black text-[#ff447e]">
              {stats.completionRate}%
            </p>
          </div>
        </div>

        {/* Filters / Search Bar */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search input with clear button */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name, email, course title..."
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

            <div className="flex flex-wrap items-center gap-2">
              {/* Status */}
              <select
                value={enrollmentStatusFilter}
                onChange={(e) => {
                  setEnrollmentStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active (Learning)</option>
                <option value="completed">Completed (100%)</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Course */}
              <select
                value={enrollmentCourseFilter}
                onChange={(e) => {
                  setEnrollmentCourseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer max-w-[200px]"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Tier / Type */}
              <select
                value={enrollmentTypeFilter}
                onChange={(e) => {
                  setEnrollmentTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free Courses</option>
                <option value="premium">Premium / Member</option>
              </select>

              {/* Sorting */}
              <select
                value={enrollmentSort}
                onChange={(e) => {
                  setEnrollmentSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-pink-50/60 border border-pink-200 rounded-xl text-xs font-bold text-[#ff447e] focus:outline-none focus:border-[#ff447e] cursor-pointer"
              >
                <option value="-enrolledAt">Newest Enrolled</option>
                <option value="enrolledAt">Oldest Enrolled</option>
                <option value="-progress">Highest Progress</option>
                <option value="progress">Lowest Progress</option>
                <option value="status">Status (A - Z)</option>
                <option value="-createdAt">Newest Record</option>
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

        {/* Enrollments Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {isLoadingEnrollments ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
              <p className="text-xs text-gray-400 mt-3 font-semibold">Loading student enrollments from server...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#041c53]">No Enrollments Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No enrollment records match your search or filter criteria. Try resetting filters or enrolling a student.
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
              {isFetchingEnrollments && (
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
                    <th className="py-3.5 px-5 select-none">Student Learner</th>
                    <th className="py-3.5 px-4 select-none">Course Title</th>
                    <th className="py-3.5 px-4 text-center select-none">Course Tier</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('progress')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Progress (%)</span>
                        {getSortIcon('progress')}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('status')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-[#041c53] transition-colors select-none"
                      onClick={() => handleSortToggle('enrolledAt')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Enrolled Date</span>
                        {getSortIcon('enrolledAt')}
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {enrollments.map((enr) => {
                    const progressVal = enr.progress || 0;
                    return (
                      <tr key={enr._id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                enr.user?.avatar ||
                                'https://ui-avatars.com/api/?name=' +
                                  encodeURIComponent(enr.user?.name || 'Student') +
                                  '&background=ff447e&color=fff'
                              }
                              alt={enr.user?.name}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[#041c53] truncate">{enr.user?.name || 'Student'}</p>
                              <p className="text-[11px] text-gray-400 truncate">{enr.user?.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-gray-800">
                          <span className="line-clamp-1">{enr.course?.title || 'Unknown Course'}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              enr.course?.type === 'free'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {enr.course?.type || 'Standard'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{progressVal}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff447e] to-[#ff7b9f] rounded-full"
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              enr.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600'
                                : enr.status === 'active'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {enr.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : '—'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditProgress(enr)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Update Progress or Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUnenroll(enr._id, enr.user?.name || 'student')}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Unenroll Student"
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
                  <strong className="text-[#041c53] font-bold">{pagination.total}</strong> enrollments
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
                  disabled={pagination.page <= 1 || isFetchingEnrollments}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || isFetchingEnrollments}
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
                        disabled={isFetchingEnrollments}
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
                  disabled={pagination.page >= pagination.pages || isFetchingEnrollments}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#041c53] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(pagination.pages)}
                  disabled={pagination.page >= pagination.pages || isFetchingEnrollments}
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

      {/* MODAL: DIRECT ENROLL STUDENT */}
      {directEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">Direct Student Enrollment</h3>
                  <p className="text-xs text-gray-400">Grant immediate active course access.</p>
                </div>
              </div>
              <button
                onClick={() => setDirectEnrollModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Student *</label>
                <select
                  required
                  value={directEnrollUserId}
                  onChange={(e) => setDirectEnrollUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Course *</label>
                <select
                  required
                  value={directEnrollCourseId}
                  onChange={(e) => setDirectEnrollCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDirectEnrollModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  {isEnrolling ? 'Granting...' : 'Grant Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ENROLLMENT PROGRESS & STATUS */}
      {editProgressModalOpen && selectedEnrollmentForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">Update Enrollment</h3>
                  <p className="text-xs text-gray-400">Modify learner progress percentage or state.</p>
                </div>
              </div>
              <button
                onClick={() => setEditProgressModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Learning Progress (%)</label>
                  <span className="text-sm font-black text-[#ff447e]">{editProgressValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgressValue}
                  onChange={(e) => setEditProgressValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={editStatusValue}
                  onChange={(e) => setEditStatusValue(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="active">Active (Learning)</option>
                  <option value="completed">Completed (100%)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditProgressModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={isUpdatingEnrollment}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  {isUpdatingEnrollment ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
