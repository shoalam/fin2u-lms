'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMyEnrollmentsQuery } from '@/store/api/enrollmentApi';
import { useGetMyAttemptsQuery } from '@/store/api/quizApi';
import {
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  PlayCircle,
  Compass,
  Download,
  Share2,
  Sparkles,
  Flame,
  Layers,
} from 'lucide-react';

import PendingInvitationsWidget from '@/components/groups/PendingInvitationsWidget';
import PendingJoinRequestsWidget from '@/components/groups/PendingJoinRequestsWidget';

export default function StudentDashboardPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: enrollmentsData = [], isLoading: isLoadingEnrollments } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrollments: any[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.enrollments || [];

  const { data: quizAttempts = [] } = useGetMyAttemptsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const completedCourses = enrollments.filter((e) => e.status === 'completed' || e.progress === 100);
  const inProgressCourses = enrollments.filter((e) => e.status !== 'completed' && e.progress < 100);
  const passedQuizzes = quizAttempts.filter((a: any) => a.passed);

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=ff447e&color=fff`
            }
            alt={user?.name || 'Student'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user?.name || 'Learner'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff447e] text-white uppercase tracking-wider">
                Student Portal
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-2">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-4 h-4 fill-current" /> 5-Day Learning Streak
              </span>
              <span>·</span>
              <span>{enrollments.length} Active Enrollments</span>
              <span>·</span>
              <span>{completedCourses.length} Certificates Earned</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-lg shadow-[#ff447e]/20"
          >
            <Compass className="w-4 h-4" />
            <span>Browse More Courses</span>
          </Link>
        </div>
      </div>

      {/* Pending Group Invitations Widget */}
      <PendingInvitationsWidget />

      {/* Pending Group Join Requests Widget */}
      <PendingJoinRequestsWidget />

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/student/courses"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 hover:shadow-md transition-all group"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Enrolled Courses</span>
          <p className="text-2xl font-black text-[#041c53]">{enrollments.length}</p>
          <p className="text-[10px] text-gray-400 group-hover:text-[#ff447e] transition-colors">View all &rarr;</p>
        </Link>

        <Link
          href="/student/courses"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 hover:shadow-md transition-all group"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">In Progress</span>
          <p className="text-2xl font-black text-amber-600">{inProgressCourses.length}</p>
          <p className="text-[10px] text-gray-400 group-hover:text-amber-600 transition-colors">Resume studies &rarr;</p>
        </Link>

        <Link
          href="/student/certificates"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 hover:shadow-md transition-all group"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Completed Courses</span>
          <p className="text-2xl font-black text-emerald-600">{completedCourses.length}</p>
          <p className="text-[10px] text-gray-400 group-hover:text-emerald-600 transition-colors">Certificates &rarr;</p>
        </Link>

        <Link
          href="/student/quizzes"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1 hover:shadow-md transition-all group"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quizzes Passed</span>
          <p className="text-2xl font-black text-[#ff447e]">{passedQuizzes.length}</p>
          <p className="text-[10px] text-gray-400 group-hover:text-[#ff447e] transition-colors">Score history &rarr;</p>
        </Link>
      </div>

      {/* Fast Shortcuts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/student/courses"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Continue Learning
            </h3>
            <p className="text-xs text-gray-400">Resume your enrolled lessons</p>
          </div>
        </Link>

        <Link
          href="/student/certificates"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Credentials & Badges
            </h3>
            <p className="text-xs text-gray-400">View verified certificates</p>
          </div>
        </Link>

        <Link
          href="/student/progress"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Learning Analytics
            </h3>
            <p className="text-xs text-gray-400">Track milestones & velocity</p>
          </div>
        </Link>
      </div>

      {/* Enrolled Courses Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#041c53]">Recent Enrolled Programs</h3>
            <p className="text-xs text-gray-400">Pick up where you left off</p>
          </div>
          <Link href="/student/courses" className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1">
            <span>View All ({enrollments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingEnrollments ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#041c53]">No Courses Enrolled</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our curated courses in Malaysian tax, PDPA, business incorporation, and SEO.
            </p>
            <div>
              <Link href="/courses" className="btn btn-primary text-xs py-2.5 px-6">
                Explore Course Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((item) => {
              const course = item.course;
              if (!course) return null;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="relative aspect-video bg-gray-900">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                        {course.category || 'Professional'}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-base text-[#041c53] line-clamp-2">{course.title}</h3>

                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="font-bold text-[#041c53]">{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-[#ff447e] rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/learn/${course.slug}`}
                      className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#ff447e]/20"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{item.progress > 0 ? 'Resume Lesson' : 'Start Course'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
