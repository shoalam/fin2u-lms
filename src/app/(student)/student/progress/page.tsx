'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMyEnrollmentsQuery } from '@/store/api/enrollmentApi';
import { useGetMyAttemptsQuery } from '@/store/api/quizApi';
import {
  TrendingUp,
  BookOpen,
  Award,
  CheckCircle,
  PlayCircle,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function StudentProgressPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: enrollmentsData = [], isLoading: isLoadingEnrollments } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrollments: any[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.enrollments || [];

  const { data: quizAttempts = [] } = useGetMyAttemptsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const completedCount = enrollments.filter((e) => e.status === 'completed' || e.progress === 100).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Learning Milestones & Mastery</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Academic Progress & Velocity</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Track your course module completion percentages, learning velocity, and certificate readiness.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Average Progress</span>
          <p className="text-xl font-black text-[#ff447e]">{avgProgress}%</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Completed Courses</span>
          <p className="text-xl font-black text-emerald-600">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Active Study Paths</span>
          <p className="text-xl font-black text-blue-600">{enrollments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Quiz Submissions</span>
          <p className="text-xl font-black text-amber-500">{quizAttempts.length}</p>
        </div>
      </div>

      {/* Progress Breakdown Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h3 className="text-base font-extrabold text-[#041c53]">Course Progress Breakdown</h3>

        {isLoadingEnrollments ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto" />
            <p className="text-xs text-gray-400 mt-2 font-semibold">Loading progress metrics...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#041c53]">No Courses Enrolled</h4>
            <p className="text-xs text-gray-400">Enroll in your first masterclass to track real-time study progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((item) => (
              <div
                key={item._id}
                className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 hover:border-gray-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#041c53]">{item.course?.title}</h4>
                    <p className="text-xs text-gray-400">{item.course?.category || 'Professional Track'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#041c53]">{item.progress || 0}%</span>
                    <Link
                      href={`/learn/${item.course?.slug}`}
                      className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Continue</span>
                    </Link>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff447e] to-[#ff7b9f] rounded-full transition-all duration-500"
                    style={{ width: `${item.progress || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
