'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminStudentsQuery,
  useGetStudentEnrollmentsQuery,
  StudentProgress,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  GraduationCap,
  Search,
  CheckCircle,
  Eye,
  BookOpen,
  Award,
  TrendingUp,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Server-side query state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentSort, setStudentSort] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // Modal state
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentProgress | null>(null);
  const [studentDetailModalOpen, setStudentDetailModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch paginated, filtered, sorted students directly from server API
  const {
    data: studentsResponse,
    isLoading: isLoadingStudents,
    refetch: refetchStudents,
    isFetching: isFetchingStudents,
  } = useGetAdminStudentsQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch || undefined,
      status: studentStatusFilter && studentStatusFilter !== 'all' ? studentStatusFilter : undefined,
      sort: studentSort,
    },
    { skip: user?.role !== 'admin' }
  );

  const students = studentsResponse?.students || [];
  const pagination = studentsResponse?.pagination || { total: 0, page: currentPage, limit: pageLimit, pages: 1 };
  const stats = studentsResponse?.stats || { totalStudents: 0, totalEnrollments: 0, completedCourses: 0, avgCompletionRate: 0 };

  // Fetch specific student enrollments when viewing audit drawer
  const {
    data: selectedStudentEnrollments = [],
    isLoading: isLoadingStudentEnrollments,
  } = useGetStudentEnrollmentsQuery(selectedStudentForView?._id || '', {
    skip: !selectedStudentForView?._id || !studentDetailModalOpen,
  });

  const isAnyFilterActive =
    searchInput !== '' ||
    studentStatusFilter !== '' ||
    studentSort !== '-createdAt';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStudentStatusFilter('');
    setStudentSort('-createdAt');
    setCurrentPage(1);
  };

  const handleOpenStudentDetail = (student: StudentProgress) => {
    setSelectedStudentForView(student);
    setStudentDetailModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortToggle = (field: string) => {
    if (studentSort === `-${field}`) {
      setStudentSort(field);
    } else if (studentSort === field) {
      setStudentSort(`-${field}`);
    } else {
      setStudentSort(`-${field}`);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (studentSort === `-${field}`) {
      return <ArrowDown className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    if (studentSort === field) {
      return <ArrowUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />;
  };

  // Helper for generating page numbers with ellipsis
  const getPageNumbers = () => {
    const totalPages = pagination.pages;
    const current = pagination.page;
    const delta = 2;
    const range: (number | string)[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <>
      <AdminHeader
        title="Student Directory & Analytics"
        icon={GraduationCap}
        actions={
          <button
            onClick={() => refetchStudents()}
            disabled={isFetchingStudents}
            className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Students"
          >
            <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingStudents ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">Student Learning Analytics</h2>
              <p className="text-xs text-gray-300">
                Track individual student learning velocity, course progress percentages, and audit enrollments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#ff447e]" />
              {stats.totalStudents} Registered Learners
            </span>
          </div>
        </div>

        {/* Global Metric Cards from API */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Learners</span>
            <p className="text-xl font-black text-[#041c53]">{stats.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Enrollments</span>
            <p className="text-xl font-black text-[#ff447e]">{stats.totalEnrollments}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Completed Courses</span>
            <p className="text-xl font-black text-emerald-600">{stats.completedCourses}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Avg Completion Rate</span>
            <p className="text-xl font-black text-amber-500">{stats.avgCompletionRate}%</p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters & Sorters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={studentStatusFilter}
                  onChange={(e) => {
                    setStudentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by account status"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={studentSort}
                  onChange={(e) => {
                    setStudentSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Sort learners list"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="-createdAt">Newest Learners</option>
                  <option value="createdAt">Oldest Learners</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="-totalEnrolled">Most Enrolled</option>
                  <option value="totalEnrolled">Least Enrolled</option>
                  <option value="-completedCount">Most Completed</option>
                  <option value="completedCount">Least Completed</option>
                  <option value="-avgProgress">Highest Progress</option>
                  <option value="avgProgress">Lowest Progress</option>
                </select>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] font-bold text-gray-400">Rows:</span>
                <select
                  value={pageLimit}
                  onChange={(e) => {
                    setPageLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Rows per page"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Reset Filters */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
            <div>
              {pagination.total > 0 ? (
                <span>
                  Showing{' '}
                  <strong className="text-gray-700">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-gray-700">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>{' '}
                  of <strong className="text-gray-700">{pagination.total}</strong> learners
                </span>
              ) : (
                <span>0 learners found</span>
              )}
              {debouncedSearch && (
                <span className="ml-1 text-[#ff447e] font-semibold">
                  (filtered for &quot;{debouncedSearch}&quot;)
                </span>
              )}
            </div>

            {isFetchingStudents && !isLoadingStudents && (
              <div className="flex items-center gap-1.5 text-xs text-[#ff447e] font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating results...</span>
              </div>
            )}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingStudents ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
              <p className="text-xs text-gray-400 mt-4 font-semibold">Loading student directory...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#ff447e] flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#041c53]">No Students Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No student accounts matched your current search filters or criteria.
              </p>
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#041c53] text-white text-xs font-bold hover:bg-[#ff447e] transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                    <th
                      onClick={() => handleSortToggle('name')}
                      className="py-3.5 px-5 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Learner Profile</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('totalEnrolled')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Enrolled</span>
                        {getSortIcon('totalEnrolled')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('completedCount')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Completed</span>
                        {getSortIcon('completedCount')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('avgProgress')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Avg Progress</span>
                        {getSortIcon('avgProgress')}
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {students.map((student) => {
                    const avgProgress = student.avgProgress || 0;

                    return (
                      <tr key={student._id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                student.avatar ||
                                'https://ui-avatars.com/api/?name=' +
                                  encodeURIComponent(student.name || 'Student') +
                                  '&background=ff447e&color=fff'
                              }
                              alt={student.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[#041c53] truncate">{student.name}</p>
                                {student.isActive === false ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[9px] uppercase border border-rose-100">
                                    Inactive
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[9px] uppercase border border-emerald-100">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">
                            {student.totalEnrolled || 0}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px]">
                            {student.completedCount || 0}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>Rate</span>
                              <span className="text-[#ff447e]">{avgProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff447e] to-[#ff7b9f] rounded-full transition-all"
                                style={{ width: `${avgProgress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenStudentDetail(student)}
                            className="px-3 py-1.5 rounded-xl bg-[#041c53]/5 text-[#041c53] hover:bg-[#ff447e] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Audit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Server-Driven Pagination Bar */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 font-medium">
                Page <strong className="text-[#041c53]">{pagination.page}</strong> of{' '}
                <strong className="text-[#041c53]">{pagination.pages}</strong> ({pagination.total} total learners)
              </span>

              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => handlePageChange(Number(p))}
                        className={`w-8 h-8 rounded-xl font-bold text-xs transition-all shadow-xs ${
                          pagination.page === p
                            ? 'bg-[#ff447e] text-white shadow-pink-200'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: STUDENT DETAILS & ENROLLMENTS AUDIT DRAWER */}
      {studentDetailModalOpen && selectedStudentForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    selectedStudentForView.avatar ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(selectedStudentForView.name || 'Student') +
                      '&background=ff447e&color=fff'
                  }
                  alt={selectedStudentForView.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#ff447e]/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-[#041c53]">{selectedStudentForView.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">
                      Student
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedStudentForView.email}</p>
                </div>
              </div>
              <button
                onClick={() => setStudentDetailModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-2xl text-center space-y-0.5 border border-gray-100">
                <span className="text-[10px] font-bold uppercase text-gray-400">Total Courses</span>
                <p className="text-lg font-black text-[#041c53]">{selectedStudentForView.totalEnrolled || 0}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-center space-y-0.5 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Completed</span>
                <p className="text-lg font-black text-emerald-700">{selectedStudentForView.completedCount || 0}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-2xl text-center space-y-0.5 border border-pink-100">
                <span className="text-[10px] font-bold uppercase text-[#ff447e]">Avg Progress</span>
                <p className="text-lg font-black text-[#ff447e]">{selectedStudentForView.avgProgress || 0}%</p>
              </div>
            </div>

            {/* Student Course Enrollments Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#ff447e]" />
                  Enrolled Courses & Real-Time Progress
                </h4>
                <span className="text-xs font-bold text-gray-500">
                  {selectedStudentEnrollments.length} records
                </span>
              </div>

              {isLoadingStudentEnrollments ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Loading enrollment records...</p>
                </div>
              ) : selectedStudentEnrollments.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-400">
                  No active course enrollments found for this student.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedStudentEnrollments.map((enr: any) => (
                    <div
                      key={enr._id}
                      className="p-3.5 bg-gray-50 hover:bg-pink-50/20 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#041c53] truncate">{enr.course?.title || 'Untitled Course'}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                              enr.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : enr.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}
                          >
                            {enr.status}
                          </span>
                          <span>•</span>
                          <span>Progress: <strong className="text-gray-700">{enr.progress || 0}%</strong></span>
                          {enr.enrolledAt && (
                            <>
                              <span>•</span>
                              <span>Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-28 space-y-1 shrink-0">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>{enr.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              enr.status === 'completed' ? 'bg-emerald-500' : 'bg-[#ff447e]'
                            }`}
                            style={{ width: `${enr.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStudentDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
