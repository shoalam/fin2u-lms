import Link from 'next/link';
import { Star, Users, Clock, BookOpen, ArrowUpRight } from 'lucide-react';
import type { Course } from '@/store/api/courseApi';
import clsx from 'clsx';

interface Props { course: Course; }

const typeMap: Record<string, { label: string; cls: string }> = {
  free: { label: 'Free Track', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  member: { label: 'Free Track', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  premium: { label: 'Premium Track', cls: 'bg-pink-50 text-[#ff447e] border-pink-200' },
};

const levelMap: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function CourseCard({ course }: Props) {
  const badge = typeMap[course.type] ?? typeMap.free;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-3xl border border-gray-100 bg-white shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative"
    >
      {/* Thumbnail Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-900 flex-shrink-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#041c53] to-[#ff447e]">
            <BookOpen size={44} className="text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <span className={clsx('px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs backdrop-blur-md', badge.cls)}>
            {badge.label}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
            {levelMap[course.level] ?? course.level}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Category Pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-extrabold text-[#ff447e] uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded-md">
            {course.category}
          </span>
          <span className="text-gray-400 group-hover:text-[#ff447e] transition-colors">
            <ArrowUpRight size={18} />
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#041c53] leading-snug line-clamp-2 mb-2.5 group-hover:text-[#ff447e] transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
          {course.shortDescription || course.description}
        </p>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={13} fill={s <= Math.round(course.rating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="text-xs font-extrabold text-[#041c53]">{course.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400 font-medium">({course.ratingCount})</span>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/70">
        {/* Instructor */}
        <div className="flex items-center gap-2">
          <img
            src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name ?? 'U')}&background=ff447e&color=fff&size=40`}
            alt={course.instructor?.name}
            className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
          />
          <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{course.instructor?.name}</span>
        </div>

        {/* Stats & Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1"><Users size={12} /> {course.enrollmentCount.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}m</span>
          </div>

          <div className="text-sm font-extrabold text-[#ff447e]">
            {course.type === 'free' ? 'FREE' : `${course.currency || 'MYR'} ${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}

