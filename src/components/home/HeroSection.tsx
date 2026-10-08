'use client';

import Link from 'next/link';
import { Play, Sparkles, Star, ArrowRight, ShieldCheck, Users, BookOpen, Award } from 'lucide-react';
import { useState } from 'react';
import { useGetPublicWebsiteSettingsQuery } from '@/store/api/adminApi';
import { useGetCoursesQuery } from '@/store/api/courseApi';

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: settings } = useGetPublicWebsiteSettingsQuery();
  const { data: coursesData } = useGetCoursesQuery({
    approvalStatus: 'approved',
    isPublished: true,
    limit: 1,
  });

  const totalCourses = coursesData?.pagination?.total ?? 0;
  const courseBadgeText =
    totalCourses > 0
      ? totalCourses >= 50
        ? `${totalCourses}+ Courses`
        : `${totalCourses} Course${totalCourses > 1 ? 's' : ''}`
      : '50+ Courses';

  const courseStatValue =
    totalCourses > 0
      ? totalCourses >= 50
        ? `${totalCourses}+`
        : `${totalCourses}`
      : '50+';

  const hero = settings?.hero;
  const badgeText = hero?.badge || "Malaysia's Premier Social Learning Platform";
  const titleText = hero?.title || 'Master Skills with Subject Matter Experts';
  const subtitleText =
    hero?.subtitle ||
    'Unlock practical knowledge in business, compliance, marketing, and finance. Connect with real mentors and accelerate your growth with a community of 5,000+ peers.';
  const primaryCtaText = hero?.primaryCtaText || 'Start Learning Free';
  const primaryCtaLink = hero?.primaryCtaLink || '/register';
  const secondaryCtaText = hero?.secondaryCtaText || 'Explore Courses';
  const secondaryCtaLink = hero?.secondaryCtaLink || '/courses';
  const defaultHeroVideo = 'https://filedn.com/lIEAGyJWO7qJsTa4CrRsiaz/CEO%20Message/Fin2u%20Message.mp4';
  const videoUrl =
    hero?.videoUrl && !hero.videoUrl.includes('youtube.com/embed/dQw4w9WgXcQ') && !hero.videoUrl.includes('youtu')
      ? hero.videoUrl
      : defaultHeroVideo;

  return (
    <section className="relative bg-[#041c53] text-white overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff447e]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Geometric background grid lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#ff447e] text-xs font-bold tracking-wide shadow-inner max-w-full">
              <span className="flex h-2 w-2 rounded-full bg-[#ff447e] animate-ping shrink-0" />
              <Sparkles size={14} className="text-[#ff447e] shrink-0" />
              <span className="text-white font-extrabold uppercase truncate">{badgeText}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              {titleText}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              {subtitleText}
            </p>

            {/* Avatar Stack & Social Proof */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
                ].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Active Student"
                    className="w-9 h-9 rounded-full border-2 border-[#041c53] object-cover"
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#041c53] bg-[#ff447e] text-white flex items-center justify-center text-[10px] font-bold">
                  +5k
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                  <span className="text-xs font-bold text-white ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">Trusted by 5,000+ professionals across Malaysia</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <Link href={primaryCtaLink} className="btn btn-primary btn-xl shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform flex items-center gap-2 group">
                <span>{primaryCtaText}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={secondaryCtaLink} className="btn btn-outline-white btn-xl hover:scale-105 transition-transform">
                {secondaryCtaText}
              </Link>
            </div>

            {/* Key Value Micro Chips */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#ff447e]" />
                <span>Certified Mentors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={16} className="text-[#ff447e]" />
                <span>Verifiable Certificate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Video Frame with Glassmorphic Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50 group">
              
              {/* Decorative Corner Glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#ff447e]/30 rounded-full blur-2xl pointer-events-none" />

              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/15 group">
                <video
                  src={videoUrl}
                  poster="https://filedn.com/lIEAGyJWO7qJsTa4CrRsiaz/CEO%20Message/AlexFinalCover.jpg"
                  className="w-full h-full object-cover cursor-pointer"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  preload="metadata"
                  playsInline
                />

                {/* Floating Video Overlay Badge */}
                {!isPlaying && (
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white flex items-center gap-2 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-[#ff447e] animate-ping" />
                    <span>Watch Welcome Message from CEO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Glass Metric Card 1 */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-xl text-[#041c53] items-center gap-3 animate-float">
              <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#041c53]">5,000+</p>
                <p className="text-xs font-semibold text-gray-500">Active Learners</p>
              </div>
            </div>

            {/* Floating Glass Metric Card 2 */}
            <div className="hidden sm:flex absolute -top-6 -right-4 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-gray-100 shadow-xl text-[#041c53] items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#041c53] flex items-center justify-center font-bold">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#041c53]">{courseBadgeText}</p>
                <p className="text-[11px] font-semibold text-gray-500">Expert Curated</p>
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic Metric Bar */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '5,000+', label: 'Active Students', sub: 'Across Malaysia' },
            { value: courseStatValue, label: 'Expert Courses', sub: 'Practical & Applied' },
            { value: '20+', label: 'Industry Mentors', sub: 'Subject Experts' },
            { value: '98%', label: 'Satisfaction Rate', sub: '5-Star Reviews' },
          ].map((stat, i) => (
            <div key={i} className="p-3 rounded-xl hover:bg-white/5 transition-colors">
              <p className="text-2xl sm:text-3xl font-extrabold text-white gradient-text-hero">{stat.value}</p>
              <p className="text-sm font-bold text-gray-200 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

