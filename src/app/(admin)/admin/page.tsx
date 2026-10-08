'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminStatsQuery,
  useGetAdminCoursesQuery,
  useGetAllEnrollmentsQuery,
  useGetAdminStudentsQuery,
  useGetAdminMentorsQuery,
  useGetMentorApplicationsQuery,
  useGetAdminGroupsQuery,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Gift,
  Settings,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function AdminOverviewDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useGetAdminStatsQuery(undefined, { skip: user?.role !== 'admin' });

  const { data: coursesData, refetch: refetchCourses } = useGetAdminCoursesQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const courses = coursesData?.courses || [];
  const { data: enrollmentsData, refetch: refetchEnrollments } = useGetAllEnrollmentsQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const enrollments = enrollmentsData?.enrollments || [];
  const { data: studentsData, refetch: refetchStudents } = useGetAdminStudentsQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const students = studentsData?.students || [];
  const { data: mentorsData, refetch: refetchMentors } = useGetAdminMentorsQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const mentors = mentorsData?.mentors || (Array.isArray(mentorsData) ? mentorsData : []);
  const { data: mentorAppsData, refetch: refetchApps } = useGetMentorApplicationsQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const mentorApps = mentorAppsData?.applications || (Array.isArray(mentorAppsData) ? mentorAppsData : []);
  const { data: groupsData, refetch: refetchGroups } = useGetAdminGroupsQuery(undefined, {
    skip: user?.role !== 'admin',
  });
  const groups = groupsData?.groups || [];

  const pendingApps = mentorApps.filter((a) => a.status === 'pending');
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed' || e.progress === 100).length;

  const handleRefreshAll = () => {
    refetchStats();
    refetchCourses();
    refetchEnrollments();
    refetchStudents();
    refetchMentors();
    refetchApps();
    refetchGroups();
  };

  return (
    <>
      <AdminHeader
        title="System Administration & Command Center"
        icon={LayoutDashboard}
        actions={
          <button
            onClick={handleRefreshAll}
            disabled={isFetchingStats}
            className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh All Analytics"
          >
            <RefreshCw className="w-4 h-4 text-[#041c53]" />
            <span className="hidden md:inline">Refresh Metrics</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fin2u Academy Super Admin</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-[#ff447e]">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl">
              Real-time platform activity, student enrollment velocity, faculty approvals, and course engagement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <Link
              href="/admin/courses"
              className="px-4 py-2.5 rounded-xl bg-[#ff447e] hover:bg-[#e0336b] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
            <Link
              href="/admin/enrollments"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#ff447e]" />
              <span>Grant Access</span>
            </Link>
          </div>
        </div>

        {/* Pending Mentor Applications Alert */}
        {pendingApps.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">
                  {pendingApps.length} Mentor Application{pendingApps.length > 1 ? 's' : ''} Awaiting Approval
                </p>
                <p className="text-[11px] text-amber-700">
                  Review applicant teaching credentials and grant instructor privileges.
                </p>
              </div>
            </div>

            <Link
              href="/admin/mentors"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
            >
              <span>Review Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/students"
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</span>
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#041c53]">{stats?.students || stats?.totalUsers || students.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Enrolled Learners</p>
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Masterclasses</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#041c53]">{courses.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {courses.filter((c) => c.isPublished).length} Active Online
              </p>
            </div>
          </Link>

          <Link
            href="/admin/enrollments"
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrollments</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#041c53]">{enrollments.length}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {completedEnrollments} Completed (100%)
              </p>
            </div>
          </Link>

          <Link
            href="/admin/mentors"
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Faculty Mentors</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#041c53]">{mentors.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{pendingApps.length} Pending Review</p>
            </div>
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Administrative Fast Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { href: '/admin/courses', title: 'Courses', icon: BookOpen, desc: 'Curriculum' },
              { href: '/admin/enrollments', title: 'Enrollments', icon: Layers, desc: 'Access Grants' },
              { href: '/admin/students', title: 'Students', icon: Users, desc: 'Learner Velocity' },
              { href: '/admin/mentors', title: 'Mentors', icon: Award, desc: 'Faculty Roster' },
              { href: '/admin/groups', title: 'Groups', icon: Users, desc: 'Community' },
              { href: '/admin/users', title: 'Users', icon: ShieldCheck, desc: 'Role Security' },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:border-[#ff447e]/40 hover:shadow-sm transition-all group flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-[#041c53] group-hover:bg-pink-50 group-hover:text-[#ff447e] transition-colors flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#041c53] group-hover:text-[#ff447e] transition-colors">
                      {nav.title}
                    </h4>
                    <p className="text-[10px] text-gray-400">{nav.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Two-Column Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments Feed */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider">
                Recent Student Enrollments
              </h3>
              <Link href="/admin/enrollments" className="text-xs font-bold text-[#ff447e] hover:underline">
                View All &rarr;
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No enrollments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 5).map((enr) => (
                  <div
                    key={enr._id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#041c53] truncate">{enr.user?.name || 'Student'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{enr.course?.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500">{enr.progress || 0}%</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          enr.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {enr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Masterclass Roster */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#041c53] uppercase tracking-wider">
                Active Courses Catalog
              </h3>
              <Link href="/admin/courses" className="text-xs font-bold text-[#ff447e] hover:underline">
                Manage Courses &rarr;
              </Link>
            </div>

            {courses.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No courses created yet.</p>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((c) => (
                  <div
                    key={c._id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          c.thumbnail ||
                          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={c.title}
                        className="w-10 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#041c53] truncate">{c.title}</p>
                        <p className="text-[10px] text-gray-400">{c.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.type === 'free' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-[#ff447e]'
                        }`}
                      >
                        {c.type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{c.lessons?.length || 0} Lessons</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
