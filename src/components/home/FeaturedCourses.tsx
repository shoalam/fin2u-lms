'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetFeaturedCoursesQuery, useGetCoursesQuery } from '@/store/api/courseApi';
import CourseCard from '@/components/courses/CourseCard';
import { ArrowRight, Sparkles, Filter, BookOpen } from 'lucide-react';

export default function FeaturedCourses() {
  const { data, isLoading } = useGetFeaturedCoursesQuery();
  const { data: catalogData } = useGetCoursesQuery({
    approvalStatus: 'approved',
    isPublished: true,
    limit: 1,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'member' | 'premium'>('all');

  const filteredCourses = (data?.courses || []).filter((c) => {
    if (c.approvalStatus !== 'approved' || c.isPublished === false) return false;
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const totalCourses = catalogData?.pagination?.total ?? (data?.courses?.length || 0);
  const ctaButtonText =
    totalCourses > 0
      ? `Explore All ${totalCourses} Course${totalCourses > 1 ? 's' : ''}`
      : 'Explore All Courses';

  return (
    <section className="py-20 bg-gray-50/80 relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff447e]/10 text-[#ff447e] text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff447e]/20">
              <Sparkles size={14} />
              <span>Handpicked Learning Tracks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#041c53] tracking-tight">
              Featured & Popular Courses
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2">
              Explore practical masterclasses created by certified mentors.
            </p>
          </div>

          <Link href="/courses" className="inline-flex items-center gap-2 text-[#ff447e] font-bold text-sm hover:gap-3 transition-all group shrink-0">
            <span>Browse All Courses</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'free', label: 'Free Access' },
            { id: 'member', label: 'Member Complimentary' },
            { id: 'premium', label: 'Premium Masterclasses' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#041c53] text-white shadow-md shadow-slate-900/20 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-[#041c53] border border-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Courses Grid / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-3xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between animate-pulse">
                <div className="h-44 bg-gray-200 rounded-2xl w-full" />
                <div className="space-y-3 mt-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                  <div className="h-6 bg-gray-200 rounded-md w-full" />
                  <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[#041c53]">No courses found in this tab</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">Check out all available courses in our catalog.</p>
            <Link href="/courses" className="btn btn-primary btn-sm">
              View Catalog
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link href="/courses" className="btn btn-primary btn-lg shadow-lg shadow-pink-500/25">
            <span>{ctaButtonText}</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
}

