'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminMentorsQuery,
  useGetMentorApplicationsQuery,
  useUpdateMentorApplicationStatusMutation,
  MentorApplication,
  MentorStatsItem,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Award,
  Search,
  CheckCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Mail,
  Phone,
  FileText,
  Clock,
  ShieldCheck,
  MapPin,
  Globe,
  Download,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
} from 'lucide-react';

export default function AdminMentorsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [mentorSubTab, setMentorSubTab] = useState<'roster' | 'applications'>('roster');

  // --- Verified Mentors States ---
  const [mentorSearch, setMentorSearch] = useState('');
  const [debouncedMentorSearch, setDebouncedMentorSearch] = useState('');
  const [mentorSort, setMentorSort] = useState('createdAt:desc');
  const [mentorPage, setMentorPage] = useState(1);
  const [mentorLimit, setMentorLimit] = useState(12);
  const [mentorViewMode, setMentorViewMode] = useState<'grid' | 'table'>('grid');

  // --- Applications Queue States ---
  const [appSearch, setAppSearch] = useState('');
  const [debouncedAppSearch, setDebouncedAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [appPage, setAppPage] = useState(1);
  const [appLimit, setAppLimit] = useState(10);

  // --- Modals ---
  const [selectedAppForReview, setSelectedAppForReview] = useState<MentorApplication | null>(null);
  const [appReviewModalOpen, setAppReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Debounce Mentor Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMentorSearch(mentorSearch);
      setMentorPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [mentorSearch]);

  // Debounce Application Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAppSearch(appSearch);
      setAppPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [appSearch]);

  // --- API Queries ---
  const {
    data: mentorsResponse,
    isLoading: isLoadingMentors,
    refetch: refetchMentors,
    isFetching: isFetchingMentors,
  } = useGetAdminMentorsQuery(
    {
      page: mentorPage,
      limit: mentorLimit,
      search: debouncedMentorSearch,
      sort: mentorSort,
    },
    { skip: user?.role !== 'admin' }
  );

  const {
    data: appsResponse,
    isLoading: isLoadingApps,
    refetch: refetchApps,
    isFetching: isFetchingApps,
  } = useGetMentorApplicationsQuery(
    {
      page: appPage,
      limit: appLimit,
      search: debouncedAppSearch,
      status: appStatusFilter,
    },
    { skip: user?.role !== 'admin' }
  );

  const [updateMentorApplicationStatus, { isLoading: isUpdatingAppStatus }] =
    useUpdateMentorApplicationStatusMutation();

  const mentors = mentorsResponse?.mentors || [];
  const mentorPagination = mentorsResponse?.pagination || {
    total: 0,
    page: 1,
    limit: mentorLimit,
    pages: 1,
  };
  const stats = mentorsResponse?.stats || {
    totalMentors: 0,
    totalStudents: 0,
    totalCourses: 0,
    pendingApplications: 0,
  };

  const applications = appsResponse?.applications || [];
  const appPagination = appsResponse?.pagination || {
    total: 0,
    page: 1,
    limit: appLimit,
    pages: 1,
  };

  const handleMentorSort = (field: string) => {
    const [currentField, currentDir] = mentorSort.split(':');
    if (currentField === field) {
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';
      setMentorSort(`${field}:${nextDir}`);
    } else {
      setMentorSort(`${field}:asc`);
    }
    setMentorPage(1);
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDir] = mentorSort.split(':');
    if (currentField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />;
    }
    return currentDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#ff447e]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#ff447e]" />
    );
  };

  const handleUpdateAppStatus = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await updateMentorApplicationStatus({ id: appId, status, notes: reviewNotes }).unwrap();
      setAppReviewModalOpen(false);
      setSelectedAppForReview(null);
      setReviewNotes('');
      refetchApps();
      refetchMentors();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update application status');
    }
  };

  const handleOpenReviewModal = (app: MentorApplication) => {
    setSelectedAppForReview(app);
    setReviewNotes(app.notes || '');
    setAppReviewModalOpen(true);
  };

  return (
    <>
      <AdminHeader
        title="Faculty Mentors & Applications"
        icon={Award}
        actions={
          <button
            onClick={() => {
              refetchMentors();
              refetchApps();
            }}
            disabled={isFetchingMentors || isFetchingApps}
            className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Mentors & Applications"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#041c53] ${isFetchingMentors || isFetchingApps ? 'animate-spin' : ''}`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">Faculty Mentors & Approvals</h2>
              <p className="text-xs text-gray-300">
                Manage verified instructors, review incoming faculty applications, and monitor instructor metrics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15">
              {stats.totalMentors} Verified Mentors
            </span>
            {stats.pendingApplications > 0 && (
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{stats.pendingApplications} Pending Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Mentors</span>
            <p className="text-xl font-black text-[#041c53]">{stats.totalMentors}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Students Taught</span>
            <p className="text-xl font-black text-[#ff447e]">{stats.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Faculty Courses</span>
            <p className="text-xl font-black text-indigo-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Pending Review</span>
            <p className="text-xl font-black text-amber-500">{stats.pendingApplications}</p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setMentorSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mentorSubTab === 'roster'
                ? 'bg-white text-[#041c53] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Verified Mentors ({stats.totalMentors})
          </button>
          <button
            onClick={() => setMentorSubTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mentorSubTab === 'applications'
                ? 'bg-white text-[#041c53] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Applications Queue</span>
            {stats.pendingApplications > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ff447e] text-white text-[10px] flex items-center justify-center font-bold">
                {stats.pendingApplications}
              </span>
            )}
          </button>
        </div>

        {/* SUB-TAB 1: VERIFIED MENTORS */}
        {mentorSubTab === 'roster' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search faculty by name, email, bio..."
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
                {mentorSearch && (
                  <button
                    onClick={() => setMentorSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                <select
                  value={mentorSort}
                  onChange={(e) => {
                    setMentorSort(e.target.value);
                    setMentorPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                  <option value="totalStudents:desc">Most Students</option>
                  <option value="coursesCount:desc">Most Courses</option>
                  <option value="avgRating:desc">Highest Rating</option>
                </select>

                <select
                  value={mentorLimit}
                  onChange={(e) => {
                    setMentorLimit(Number(e.target.value));
                    setMentorPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                  <option value={100}>100 per page</option>
                </select>

                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setMentorViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      mentorViewMode === 'grid' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMentorViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      mentorViewMode === 'table' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mentors List Content */}
            {isLoadingMentors ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading verified faculty mentors...</p>
              </div>
            ) : mentors.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
                <Award className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#041c53]">No Faculty Mentors Found</h3>
                <p className="text-xs text-gray-400">
                  {debouncedMentorSearch
                    ? 'Try adjusting your search query.'
                    : 'Approve incoming applications to grant faculty teaching status.'}
                </p>
              </div>
            ) : mentorViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={
                            mentor.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(mentor.name) +
                              '&background=ff447e&color=fff'
                          }
                          alt={mentor.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-[#ff447e]/30 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm text-[#041c53] truncate">{mentor.name}</h4>
                          <p className="text-[11px] text-gray-400 truncate">{mentor.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Faculty</span>
                            </span>
                            {mentor.avgRating ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{mentor.avgRating.toFixed(1)}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {mentor.headline && (
                        <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                          {mentor.headline}
                        </p>
                      )}

                      {mentor.bio && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {mentor.bio}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Courses</span>
                        <span className="font-black text-sm text-[#041c53]">{mentor.coursesCount || 0}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Students</span>
                        <span className="font-black text-sm text-[#ff447e]">{mentor.totalStudents || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                        <th
                          onClick={() => handleMentorSort('name')}
                          className="py-3.5 px-5 cursor-pointer hover:text-[#041c53] transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Instructor</span>
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th className="py-3.5 px-4">Role & Status</th>
                        <th
                          onClick={() => handleMentorSort('coursesCount')}
                          className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Courses</span>
                            {getSortIcon('coursesCount')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleMentorSort('totalStudents')}
                          className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Students</span>
                            {getSortIcon('totalStudents')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleMentorSort('avgRating')}
                          className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Avg Rating</span>
                            {getSortIcon('avgRating')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleMentorSort('createdAt')}
                          className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Joined Date</span>
                            {getSortIcon('createdAt')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {mentors.map((mentor) => (
                        <tr key={mentor._id} className="hover:bg-pink-50/20 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  mentor.avatar ||
                                  'https://ui-avatars.com/api/?name=' +
                                    encodeURIComponent(mentor.name) +
                                    '&background=ff447e&color=fff'
                                }
                                alt={mentor.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#041c53] truncate">{mentor.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{mentor.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Faculty</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-[#041c53]">
                            {mentor.coursesCount || 0}
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-[#ff447e]">
                            {mentor.totalStudents || 0}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{mentor.avgRating ? mentor.avgRating.toFixed(1) : '5.0'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center text-gray-500 text-[11px]">
                            {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Server Pagination for Mentors */}
            {mentorPagination.total > 0 && (
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-[#041c53]">{(mentorPage - 1) * mentorLimit + 1}</span> to{' '}
                  <span className="font-bold text-[#041c53]">
                    {Math.min(mentorPage * mentorLimit, mentorPagination.total)}
                  </span>{' '}
                  of <span className="font-bold text-[#041c53]">{mentorPagination.total}</span> faculty mentors
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMentorPage((p) => Math.max(1, p - 1))}
                    disabled={mentorPage <= 1 || isFetchingMentors}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: mentorPagination.pages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (mentorPagination.pages <= 7) return true;
                        if (p === 1 || p === mentorPagination.pages) return true;
                        if (Math.abs(p - mentorPage) <= 1) return true;
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
                        const isSelected = pageItem === mentorPage;
                        return (
                          <button
                            key={pageItem}
                            onClick={() => setMentorPage(pageItem)}
                            disabled={isFetchingMentors}
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
                    onClick={() => setMentorPage((p) => Math.min(mentorPagination.pages, p + 1))}
                    disabled={mentorPage >= mentorPagination.pages || isFetchingMentors}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: APPLICATIONS QUEUE */}
        {mentorSubTab === 'applications' && (
          <div className="space-y-6">
            {/* Filter Bar for Applications */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applicants by name, email, phone, category..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
                {appSearch && (
                  <button
                    onClick={() => setAppSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                <select
                  value={appStatusFilter}
                  onChange={(e) => {
                    setAppStatusFilter(e.target.value as any);
                    setAppPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved Faculty</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={appLimit}
                  onChange={(e) => {
                    setAppLimit(Number(e.target.value));
                    setAppPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {/* Applications Table Content */}
            {isLoadingApps ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Loading mentor applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
                <Award className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#041c53]">No Applications Found</h3>
                <p className="text-xs text-gray-400">
                  {debouncedAppSearch || appStatusFilter !== 'all'
                    ? 'Try adjusting your search criteria or status filter.'
                    : 'There are no faculty applications submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                        <th className="py-3.5 px-5">Applicant</th>
                        <th className="py-3.5 px-4">Subject Categories</th>
                        <th className="py-3.5 px-4">HRDC Accreditation</th>
                        <th className="py-3.5 px-4 text-center">Applied Date</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-5 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-pink-50/20 transition-colors">
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-[#041c53]">{app.name}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[11px] text-gray-400">{app.email}</span>
                              {app.isEmailVerified ? (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Pending Email Verification
                                </span>
                              )}
                            </div>
                            {app.phone && <p className="text-[10px] text-gray-400 mt-0.5">{app.phone}</p>}
                          </td>

                          <td className="py-3.5 px-4 font-semibold">
                            {app.courseCategories && app.courseCategories.length > 0
                              ? app.courseCategories.join(', ')
                              : 'Finance & Compliance'}
                          </td>

                          <td className="py-3.5 px-4 text-gray-600">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                app.hrdcStatus === 'Certified' || app.hrdcStatus === 'Accredited'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {app.hrdcStatus || 'Certified'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center text-gray-500 text-[11px]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                app.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : app.status === 'pending'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleOpenReviewModal(app)}
                              className="px-3 py-1.5 rounded-xl bg-[#041c53]/5 text-[#041c53] hover:bg-[#ff447e] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Server Pagination for Applications */}
            {appPagination.total > 0 && (
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-[#041c53]">{(appPage - 1) * appLimit + 1}</span> to{' '}
                  <span className="font-bold text-[#041c53]">
                    {Math.min(appPage * appLimit, appPagination.total)}
                  </span>{' '}
                  of <span className="font-bold text-[#041c53]">{appPagination.total}</span> applications
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                    disabled={appPage <= 1 || isFetchingApps}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: appPagination.pages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (appPagination.pages <= 7) return true;
                        if (p === 1 || p === appPagination.pages) return true;
                        if (Math.abs(p - appPage) <= 1) return true;
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
                        const isSelected = pageItem === appPage;
                        return (
                          <button
                            key={pageItem}
                            onClick={() => setAppPage(pageItem)}
                            disabled={isFetchingApps}
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
                    onClick={() => setAppPage((p) => Math.min(appPagination.pages, p + 1))}
                    disabled={appPage >= appPagination.pages || isFetchingApps}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: APPLICATION REVIEW & COMPLETE DETAILS */}
      {appReviewModalOpen && selectedAppForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#041c53] to-[#0a2a6e] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#041c53]/10">
                  {selectedAppForReview.name ? selectedAppForReview.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-xl text-[#041c53]">
                      {selectedAppForReview.name}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        selectedAppForReview.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : selectedAppForReview.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {selectedAppForReview.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>Application ID: {selectedAppForReview._id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {selectedAppForReview.createdAt
                        ? new Date(selectedAppForReview.createdAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppReviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 text-xs text-gray-700">
              {/* Section 1: Contact & Profile Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase">
                      <Mail className="w-3.5 h-3.5 text-[#ff447e]" />
                      <span>Email Address</span>
                    </div>
                    {selectedAppForReview.isEmailVerified ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Unverified
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${selectedAppForReview.email}`}
                    className="font-bold text-[#041c53] hover:text-[#ff447e] transition-colors break-all block"
                  >
                    {selectedAppForReview.email}
                  </a>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Phone Number</span>
                  </div>
                  <a
                    href={`tel:${selectedAppForReview.phone}`}
                    className="font-bold text-[#041c53] hover:text-emerald-700 transition-colors block"
                  >
                    {selectedAppForReview.phone || 'Not provided'}
                  </a>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn / Profile</span>
                  </div>
                  {selectedAppForReview.linkedin ? (
                    <a
                      href={selectedAppForReview.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{selectedAppForReview.linkedin}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
              </div>

              {/* Section 2: HRDC Accreditation & Delivery Formats */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3.5">
                <h4 className="font-bold text-[#041c53] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>HRDC Accreditation & Delivery Formats</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      HRDC Certified Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                          selectedAppForReview.hrdcStatus === 'Certified' ||
                          selectedAppForReview.hrdcStatus === 'Accredited'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedAppForReview.hrdcStatus || 'No'}
                      </span>
                      {selectedAppForReview.hrdcTrainerId && (
                        <span className="text-xs text-gray-600">
                          ID: <strong className="font-mono text-[#041c53]">{selectedAppForReview.hrdcTrainerId}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Physical Coverage Area
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#ff447e] flex-shrink-0" />
                      <span>{selectedAppForReview.physicalCoverageArea || 'Not specified (Remote only)'}</span>
                    </div>
                  </div>
                </div>

                {/* Training Modes & Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Training Delivery Modes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAppForReview.trainingModes && selectedAppForReview.trainingModes.length > 0 ? (
                        selectedAppForReview.trainingModes.map((mode, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-pink-50 text-[#ff447e] text-[11px] font-bold border border-pink-100"
                          >
                            {mode}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">E-learning (Pre-recorded)</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Instruction Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAppForReview.languages && selectedAppForReview.languages.length > 0 ? (
                        selectedAppForReview.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-[#041c53]/5 text-[#041c53] text-[11px] font-bold border border-[#041c53]/10"
                          >
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">English</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Course Categories & Topics */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5">
                <h4 className="font-bold text-[#041c53] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Subject Categories & Topics of Expertise</span>
                </h4>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedAppForReview.courseCategories && selectedAppForReview.courseCategories.length > 0 ? (
                    selectedAppForReview.courseCategories.map((cat, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-semibold border border-gray-200 shadow-2xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{cat}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">General Business & Finance</span>
                  )}
                </div>

                {selectedAppForReview.otherCategory && (
                  <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                    <strong className="font-bold text-amber-800">Other Specified Topics:</strong>{' '}
                    <span>{selectedAppForReview.otherCategory}</span>
                  </div>
                )}
              </div>

              {/* Section 4: Attached Files & Portfolio Documents */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <h4 className="font-bold text-[#041c53] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Attached Documents & Portfolio Assets</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Resume */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                        <FileText className="w-4 h-4" />
                        <span>Resume / CV</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {selectedAppForReview.resumeUrl ? 'Document uploaded' : 'Not attached'}
                      </p>
                    </div>
                    {selectedAppForReview.resumeUrl ? (
                      <a
                        href={selectedAppForReview.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all inline-flex items-center justify-center gap-1 w-full"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed w-full"
                      >
                        None
                      </button>
                    )}
                  </div>

                  {/* Certificate */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <Award className="w-4 h-4" />
                        <span>HRDC Certificate</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {selectedAppForReview.certificateUrl ? 'Document uploaded' : 'Not attached'}
                      </p>
                    </div>
                    {selectedAppForReview.certificateUrl ? (
                      <a
                        href={selectedAppForReview.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all inline-flex items-center justify-center gap-1 w-full"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed w-full"
                      >
                        None
                      </button>
                    )}
                  </div>

                  {/* Course Outline */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                        <BookOpen className="w-4 h-4" />
                        <span>Course Outline</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {selectedAppForReview.sampleCourseOutline ? 'Outline available' : 'Not attached'}
                      </p>
                    </div>
                    {selectedAppForReview.sampleCourseOutline ? (
                      <a
                        href={selectedAppForReview.sampleCourseOutline}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all inline-flex items-center justify-center gap-1 w-full"
                      >
                        <span>View Outline</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed w-full"
                      >
                        None
                      </button>
                    )}
                  </div>
                </div>

                {/* Trainer Profile / Portfolio Links */}
                {selectedAppForReview.trainerProfileUrls && selectedAppForReview.trainerProfileUrls.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Portfolio / Drive Profile Links
                    </span>
                    <div className="space-y-1">
                      {selectedAppForReview.trainerProfileUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-xs font-medium flex items-center gap-1.5 break-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Applicant Comments / Motivation */}
              {selectedAppForReview.comments && (
                <div className="p-4 bg-gradient-to-br from-pink-50/40 to-purple-50/40 rounded-2xl border border-pink-100/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#ff447e] font-bold text-[11px] uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Applicant Proposal & Comments</span>
                  </div>
                  <p className="text-gray-700 bg-white/80 p-3 rounded-xl border border-pink-100/40 text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedAppForReview.comments}
                  </p>
                </div>
              )}

              {/* Section 6: Admin Review Decision Notes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-[#041c53] uppercase tracking-wider">
                  Admin Review Remarks & Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add optional notes, remarks, or justification for approval or rejection..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="text-[11px] text-gray-400 font-medium">
                Current status:{' '}
                <strong className="text-[#041c53] uppercase">{selectedAppForReview.status}</strong>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedAppForReview._id, 'rejected')}
                  disabled={isUpdatingAppStatus}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedAppForReview._id, 'approved')}
                  disabled={isUpdatingAppStatus}
                  className="flex-1 sm:flex-initial btn btn-primary text-xs py-2.5 px-6 rounded-full shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isUpdatingAppStatus ? 'Updating...' : 'Approve & Grant Faculty Access'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
