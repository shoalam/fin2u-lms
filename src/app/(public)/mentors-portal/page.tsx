'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGetMentorsQuery } from '@/store/api/userApi';
import {
  Award,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Search,
  BookOpen,
  Sparkles,
  Users,
  Briefcase,
  Star,
} from 'lucide-react';

export default function MentorsPortalPage() {
  const { data: mentors = [], isLoading } = useGetMentorsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = [
    'All',
    'Legal & Compliance',
    'Corporate Law',
    'Accounting & Tax',
    'Digital Marketing',
    'Business Strategy',
  ];

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      m.headline?.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      m.bio?.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#041c53]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02133b] via-[#041c53] to-[#0b2b6d] text-white py-16 md:py-20 text-center">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff447e]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-extrabold uppercase tracking-widest border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#ff447e]" />
            <span>Fin2u Faculty & Industry Leaders</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Learn from Verified Industry Experts
          </h1>

          <p className="text-gray-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Our certified mentors are seasoned corporate lawyers, tax consultants, licensed company secretaries, and digital growth strategists actively practicing in Malaysia.
          </p>

          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link href="/mentorship-application" className="btn btn-primary text-xs md:text-sm py-3 px-6 font-bold shadow-lg shadow-pink-500/25">
              Apply as a Mentor
            </Link>
            <Link href="/courses" className="btn btn-outline-white text-xs md:text-sm py-3 px-6 font-bold">
              Browse Mentor Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Mentors Catalog Section */}
      <section className="py-14 max-w-6xl mx-auto px-6 w-full space-y-8 flex-1">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mentors by name, specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#041c53] placeholder-gray-400 focus:outline-none focus:border-[#ff447e] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Specialty Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-[#041c53] text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#041c53]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#041c53] tracking-tight">
                Featured Faculty & Instructors
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredMentors.length} certified practitioners available for coursework and guidance
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 h-80 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-[#041c53]">No mentors match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try clearing your search query or selecting a different specialty category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                }}
                className="text-xs font-bold text-[#ff447e] underline hover:text-[#e0336b]"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Mentor Avatar & Title */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=041c53&color=ffffff`}
                          alt={mentor.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-100 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white" title="Verified Faculty">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-extrabold text-[#041c53] truncate">{mentor.name}</h3>
                        <p className="text-xs font-bold text-[#ff447e] line-clamp-1">
                          {mentor.headline || 'Senior Business Practitioner'}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Verified Mentor</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-normal">
                      {mentor.bio ||
                        'Certified industry professional dedicated to delivering practical, actionable expertise to Malaysian entrepreneurs and corporate teams.'}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/courses?instructor=${mentor._id}`}
                      className="btn btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Courses</span>
                    </Link>

                    {mentor.website ? (
                      <a
                        href={mentor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-gray-500 hover:text-[#041c53] flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={`/messages`}
                        className="text-xs font-bold text-gray-500 hover:text-[#ff447e] flex items-center gap-1"
                      >
                        <span>Message</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Become a Mentor CTA Banner */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#ff447e] text-xs font-extrabold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>BECOME AN INSTRUCTOR</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-[#041c53] tracking-tight">
            Ready to Share Your Expertise with Thousands?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-xs md:text-sm leading-relaxed font-normal">
            Monetize your professional knowledge, build your personal brand, and train the next generation of Malaysian leaders with Fin2u Academy.
          </p>
          <div className="pt-3">
            <Link href="/mentorship-application" className="btn btn-primary text-xs md:text-sm py-3 px-8 font-bold shadow-lg shadow-pink-500/20">
              Start Mentor Application
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
