'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/courses/CourseCard';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetMentorsQuery } from '@/store/api/userApi';
import { Search, ChevronDown, User, X, RotateCcw } from 'lucide-react';

const categories = ['All', 'Finance', 'Legal & Compliance', 'Legal', 'Business', 'Digital Marketing'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const types = [
  { label: 'All Tiers', value: '' },
  { label: 'Free Courses', value: 'free' },
  { label: 'Premium Tracks', value: 'premium' },
];

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialInstructor = searchParams.get('mentor') || searchParams.get('instructor') || '';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

  const { data: mentors = [] } = useGetMentorsQuery();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [level, setLevel] = useState('');
  const [type, setType] = useState(initialType);
  const [instructor, setInstructor] = useState(initialInstructor);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlInstructor = searchParams.get('mentor') || searchParams.get('instructor') || '';
    const urlSearch = searchParams.get('search') || searchParams.get('q') || '';

    let matchedInstructorId = urlInstructor;
    if (urlInstructor && mentors.length > 0) {
      const found = mentors.find(
        (m) =>
          m._id === urlInstructor ||
          m.name.toLowerCase() === urlInstructor.toLowerCase()
      );
      if (found) {
        matchedInstructorId = found._id;
      }
    }

    setType(urlType);
    setCategory(urlCategory);
    setInstructor(matchedInstructorId);
    setSearch(urlSearch);
    setPage(1);
  }, [searchParams, mentors]);

  const { data, isLoading } = useGetCoursesQuery({
    search: search || undefined,
    category: category || undefined,
    level: level || undefined,
    type: type || undefined,
    instructor: instructor || undefined,
    approvalStatus: 'approved',
    isPublished: true,
    page,
    limit: 9,
  });

  // Client-side safeguard to ensure non-approved courses are never shown
  const approvedCourses = (data?.courses || []).filter(
    (c) => c.approvalStatus === 'approved' && c.isPublished !== false
  );

  const selectedMentor = mentors.find((m) => m._id === instructor);
  const hasActiveFilters = Boolean(search || category || level || type || instructor);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setType('');
    setInstructor('');
    setPage(1);
  };

  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#041c53] to-[#0a2a6e] py-10 md:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
            <span className="section-eyebrow">All Courses</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">Explore Our Courses</h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
              Discover expert-led courses in finance, legal, business, and digital skills
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 md:py-6 sticky top-[72px] z-40 shadow-xs">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-full sm:min-w-[220px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses by keyword..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full h-11 !pl-10 !pr-10 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white text-[#041c53] outline-none focus:border-[#ff447e] focus:ring-4 focus:ring-pink-100 transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mentor / Instructor Filter */}
              <div className="relative min-w-full sm:min-w-[170px] lg:min-w-[180px]">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <User size={15} />
                </div>
                <select
                  value={instructor}
                  onChange={(e) => { setInstructor(e.target.value); setPage(1); }}
                  className="w-full h-11 !pl-10 !pr-9 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white text-[#041c53] outline-none focus:border-[#ff447e] focus:ring-4 focus:ring-pink-100 appearance-none cursor-pointer transition-all shadow-2xs"
                >
                  <option value="">All Mentors</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Type */}
              <div className="relative min-w-full sm:min-w-[130px]">
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value); setPage(1); }}
                  className="w-full h-11 !pl-4 !pr-9 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white text-[#041c53] outline-none focus:border-[#ff447e] focus:ring-4 focus:ring-pink-100 appearance-none cursor-pointer transition-all shadow-2xs"
                >
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Level */}
              <div className="relative min-w-full sm:min-w-[130px]">
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value === 'All Levels' ? '' : e.target.value.toLowerCase()); setPage(1); }}
                  className="w-full h-11 !pl-4 !pr-9 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white text-[#041c53] outline-none focus:border-[#ff447e] focus:ring-4 focus:ring-pink-100 appearance-none cursor-pointer transition-all shadow-2xs"
                >
                  {levels.map((l) => <option key={l}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Reset Filters button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-1.5 px-4 h-11 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0 w-full sm:w-auto"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Category pills with smooth horizontal scrolling */}
            <div className="flex gap-2 items-center mt-4 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Categories:</span>
              {categories.map((c) => {
                const isActive = (c === 'All' && !category) || category === c;
                return (
                  <button
                    key={c}
                    onClick={() => { setCategory(c === 'All' ? '' : c); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer whitespace-nowrap ${isActive
                        ? 'bg-[#ff447e] text-white border-[#ff447e] shadow-sm shadow-[#ff447e]/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#ff447e] hover:text-[#ff447e]'
                      }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Courses grid */}
        <section className="py-12 bg-gray-50 min-h-[60vh]">
          <div className="max-w-[1200px] mx-auto px-6">
            {selectedMentor && (
              <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-pink-50/50 border border-pink-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#041c53] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {selectedMentor.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff447e]">
                      FILTERED BY MENTOR
                    </span>
                    <h4 className="text-sm font-black text-[#041c53]">{selectedMentor.name}</h4>
                  </div>
                </div>

                <button
                  onClick={() => setInstructor('')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-bold text-gray-700 hover:text-[#ff447e] hover:border-[#ff447e] transition-all flex items-center gap-1 shrink-0"
                >
                  <X size={13} />
                  <span>Clear Mentor Filter</span>
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : approvedCourses.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#041c53] mb-2">No courses found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Showing <strong className="text-[#041c53]">{approvedCourses.length}</strong> of <strong className="text-[#041c53]">{data?.pagination?.total || approvedCourses.length}</strong> courses
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(data.pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${page === i + 1
                            ? 'bg-[#ff447e] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff447e] hover:text-[#ff447e]'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e]"></div>
        </main>
        <Footer />
      </>
    }>
      <CoursesContent />
    </Suspense>
  );
}
