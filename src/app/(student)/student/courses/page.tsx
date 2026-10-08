'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMyEnrollmentsQuery } from '@/store/api/enrollmentApi';
import {
  BookOpen,
  Search,
  PlayCircle,
  CheckCircle,
  Clock,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [courseSearch, setCourseSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const { data: enrollmentsData = [], isLoading: isLoadingEnrollments } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrollments: any[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.enrollments || [];

  const filteredEnrollments = enrollments.filter((item) => {
    const course = item.course;
    if (!course) return false;

    const term = courseSearch.toLowerCase();
    const matchSearch =
      course.title.toLowerCase().includes(term) ||
      (course.category && course.category.toLowerCase().includes(term));

    const isCompleted = item.status === 'completed' || item.progress === 100;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? isCompleted
        : !isCompleted;

    return matchSearch && matchStatus;
  });

  const completedCount = enrollments.filter((e) => e.status === 'completed' || e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.status !== 'completed' && e.progress < 100).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Learning Curricula</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Registered Masterclasses</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Access your active enrolled courses, resume classroom video lessons, and track module completion.
          </p>
        </div>

        <Link
          href="/courses"
          className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-lg shadow-[#ff447e]/20 shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#041c53] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({enrollments.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'in_progress'
                ? 'bg-[#041c53] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#041c53] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoadingEnrollments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-[#041c53]">No Courses Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {courseSearch || statusFilter !== 'all'
              ? 'No enrolled courses matched your filter criteria.'
              : 'You have not enrolled in any masterclasses yet.'}
          </p>
          <div>
            <Link href="/courses" className="btn btn-primary text-xs py-2.5 px-6">
              Explore Course Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((item) => {
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
                    {item.progress === 100 && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-base text-[#041c53] line-clamp-2">{course.title}</h3>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Learning Progress</span>
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
                    <span>{item.progress > 0 ? 'Resume Classroom' : 'Start Course'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
