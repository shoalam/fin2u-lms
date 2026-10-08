'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMentorStudentsQuery } from '@/store/api/enrollmentApi';
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Award,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  Mail,
  Grid,
  List,
} from 'lucide-react';

export default function MentorStudentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter & Pagination States
  const [studentSearch, setStudentSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [studentSort, setStudentSort] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(studentSearch);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const {
    data: mentorStudentsData,
    isLoading: isLoadingStudents,
    refetch: refetchStudents,
    isFetching: isFetchingStudents,
  } = useGetMentorStudentsQuery({
    courseId: selectedCourseFilter || undefined,
    status: selectedStatusFilter === 'all' ? undefined : selectedStatusFilter,
    search: debouncedSearch || undefined,
    sort: studentSort,
    page: currentPage,
    limit: pageLimit,
  });

  const enrollments = mentorStudentsData?.enrollments || [];
  const pagination = mentorStudentsData?.pagination || {
    total: 0,
    page: 1,
    limit: pageLimit,
    pages: 1,
  };
  const stats = mentorStudentsData?.stats || {
    totalLearners: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    avgProgress: 0,
  };
  const mentorCourses = mentorStudentsData?.courses || [];

  const handleSort = (field: string) => {
    const [currentField, currentDir] = studentSort.split(':');
    if (currentField === field) {
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';
      setStudentSort(`${field}:${nextDir}`);
    } else {
      setStudentSort(`${field}:asc`);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDir] = studentSort.split(':');
    if (currentField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />;
    }
    return currentDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#ff447e]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#ff447e]" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <Users className="w-3.5 h-3.5" />
            <span>Learner Cohorts & Enrollment Insights</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Enrolled Student Directory</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Monitor student adoption rates across your authored masterclasses, track course completion progress, and engage with cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchStudents()}
            disabled={isFetchingStudents}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff447e] ${isFetchingStudents ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/messages"
            className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-[#ff447e]/30 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Cohorts Inbox</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Total Learners</span>
          <p className="text-xl font-black text-[#041c53]">{stats.totalLearners}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Authored Curricula</span>
          <p className="text-xl font-black text-blue-600">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Completed Courses</span>
          <p className="text-xl font-black text-emerald-600">{stats.completedEnrollments}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Avg Completion Rate</span>
          <p className="text-xl font-black text-[#ff447e]">{stats.avgProgress}%</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students, email, or course..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
          />
          {studentSearch && (
            <button
              onClick={() => setStudentSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCourseFilter}
            onChange={(e) => {
              setSelectedCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] max-w-[200px] truncate"
          >
            <option value="">All Authored Courses</option>
            {mentorCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="all">All Progress Status</option>
            <option value="active">In Progress (Active)</option>
            <option value="completed">Completed (100%)</option>
          </select>

          <select
            value={studentSort}
            onChange={(e) => {
              setStudentSort(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="createdAt:desc">Newest Enrolled</option>
            <option value="createdAt:asc">Oldest Enrolled</option>
            <option value="progress:desc">Highest Progress</option>
            <option value="progress:asc">Lowest Progress</option>
          </select>

          <select
            value={pageLimit}
            onChange={(e) => {
              setPageLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Enrollments Directory Content */}
      {isLoadingStudents ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
          <p className="text-xs text-gray-400 mt-3 font-semibold">Loading enrolled students directory...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#041c53]">No Enrolled Students Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {debouncedSearch || selectedCourseFilter || selectedStatusFilter !== 'all'
              ? 'No enrolled students matched your search criteria. Try resetting filters.'
              : 'As students enroll in your authored masterclasses, they will appear in this directory.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                  <th className="py-3.5 px-5">Student Learner</th>
                  <th className="py-3.5 px-4">Enrolled Course</th>
                  <th
                    onClick={() => handleSort('progress')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Progress</span>
                      {getSortIcon('progress')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Enrolled Date</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {enrollments.map((enr) => (
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
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#041c53] truncate">{enr.user?.name || 'Unknown User'}</p>
                          <p className="text-[11px] text-gray-400 truncate">{enr.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={enr.course?.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                          alt={enr.course?.title}
                          className="w-10 h-7 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#041c53] line-clamp-1">{enr.course?.title || 'Masterclass'}</p>
                          <span className="text-[10px] text-gray-400 font-semibold">{enr.course?.category || 'General'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="max-w-[120px] mx-auto space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-600">
                          <span>{enr.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              enr.progress === 100 ? 'bg-emerald-500' : 'bg-[#ff447e]'
                            }`}
                            style={{ width: `${enr.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          enr.status === 'completed' || enr.progress === 100
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {enr.status === 'completed' || enr.progress === 100 ? 'Completed' : 'In Progress'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-500 text-[11px]">
                      {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : new Date(enr.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/messages"
                          className="px-2.5 py-1 rounded-xl bg-pink-50 text-[#ff447e] hover:bg-[#ff447e] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1"
                          title="Message Student"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enr) => (
            <div
              key={enr._id}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        enr.user?.avatar ||
                        'https://ui-avatars.com/api/?name=' +
                          encodeURIComponent(enr.user?.name || 'Student') +
                          '&background=ff447e&color=fff'
                      }
                      alt={enr.user?.name}
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-[#ff447e]/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#041c53] truncate">{enr.user?.name || 'Student'}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{enr.user?.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      enr.status === 'completed' || enr.progress === 100
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {enr.status === 'completed' || enr.progress === 100 ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={enr.course?.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                      alt={enr.course?.title}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <p className="text-xs font-bold text-[#041c53] line-clamp-1">{enr.course?.title}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Course Progress</span>
                      <span className="text-[#041c53] font-black">{enr.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          enr.progress === 100 ? 'bg-emerald-500' : 'bg-[#ff447e]'
                        }`}
                        style={{ width: `${enr.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">
                  Enrolled {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : new Date(enr.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href="/messages"
                  className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Message</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Server Pagination Controls */}
      {pagination.total > 0 && (
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-[#041c53]">{(currentPage - 1) * pageLimit + 1}</span> to{' '}
            <span className="font-bold text-[#041c53]">
              {Math.min(currentPage * pageLimit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#041c53]">{pagination.total}</span> enrolled students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetchingStudents}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => {
                  if (pagination.pages <= 7) return true;
                  if (p === 1 || p === pagination.pages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (
                    idx > 0 &&
                    typeof arr[idx - 1] === 'number' &&
                    (p as number) - (arr[idx - 1] as number) > 1
                  ) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((pageItem, idx) => {
                  if (typeof pageItem === 'string') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  const isSelected = pageItem === currentPage;
                  return (
                    <button
                      key={pageItem}
                      onClick={() => setCurrentPage(pageItem)}
                      disabled={isFetchingStudents}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#ff447e] text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageItem}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={currentPage >= pagination.pages || isFetchingStudents}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
