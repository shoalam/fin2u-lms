'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMyAttemptsQuery } from '@/store/api/quizApi';
import {
  Award,
  FileQuestion,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function StudentQuizzesPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const {
    data: quizAttempts = [],
    isLoading: isLoadingAttempts,
    refetch: refetchAttempts,
    isFetching: isFetchingAttempts,
  } = useGetMyAttemptsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const passedCount = quizAttempts.filter((a: any) => a.passed).length;
  const failedCount = quizAttempts.filter((a: any) => !a.passed).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <Award className="w-3.5 h-3.5" />
            <span>Academic Performance & Exam Records</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Assessment & Quiz Submissions</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Review detailed test scores, passing thresholds, completion timestamps, and exam outcomes.
          </p>
        </div>

        <button
          onClick={() => refetchAttempts()}
          disabled={isFetchingAttempts}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          title="Refresh Scores"
        >
          <RefreshCw className="w-4 h-4 text-[#ff447e]" />
          <span className="hidden sm:inline">Refresh History</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Total Attempts</span>
          <p className="text-xl font-black text-[#041c53]">{quizAttempts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Passed Exams</span>
          <p className="text-xl font-black text-emerald-600">{passedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Needs Review</span>
          <p className="text-xl font-black text-amber-500">{failedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Success Rate</span>
          <p className="text-xl font-black text-[#ff447e]">
            {quizAttempts.length > 0 ? Math.round((passedCount / quizAttempts.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Assessment Submissions Feed */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-[#041c53]">Quiz Submissions Timeline</h3>

        {isLoadingAttempts ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto" />
            <p className="text-xs text-gray-400 mt-2 font-semibold">Loading quiz history...</p>
          </div>
        ) : quizAttempts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#041c53]">No Quizzes Attempted Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't submitted any quiz attempts yet. Complete a course lesson to test your knowledge!
            </p>
            <Link href="/student/courses" className="btn btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5">
              <span>Go to My Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {quizAttempts.map((attempt: any) => (
              <div key={attempt._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#041c53]">{attempt.quiz?.title || 'Knowledge Assessment'}</h4>
                  <p className="text-xs text-gray-500">
                    Scored <strong className="text-gray-800">{attempt.score}</strong> / {attempt.totalPoints} points ({attempt.percentage}%)
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Completed on {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      attempt.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {attempt.passed ? 'PASSED' : 'NOT PASSED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
