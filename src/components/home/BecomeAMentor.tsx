'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight, CheckCircle2, Sparkles, DollarSign, Users, Star } from 'lucide-react';

export default function BecomeAMentor() {
  return (
    <section className="py-20 bg-gray-50/70 overflow-hidden relative border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gradient-to-br from-white via-white to-pink-50/40 rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl">
          
          {/* Left: Founder Graphic Showcase */}
          <div className="lg:col-span-5 relative flex justify-center order-2 lg:order-1">
            <div className="relative z-10">
              <img
                src="https://fin2u.net/wp-content/uploads/2021/09/AY-without-background.png"
                alt="Alex Yeoh - Founder"
                className="h-80 sm:h-[420px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Background Blob & Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200/60 to-blue-200/50 rounded-3xl transform rotate-2 scale-95 -z-0 blur-sm" />

            {/* Floating Glass Stats Chip 1 */}
            <div className="hidden sm:flex absolute top-8 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 z-20 items-center gap-3 animate-float">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-extrabold">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#041c53]">70% Share</p>
                <p className="text-[11px] text-gray-500 font-medium">Instructor Revenue</p>
              </div>
            </div>

            {/* Floating Glass Stats Chip 2 */}
            <div className="hidden sm:flex absolute bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 z-20 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-extrabold">
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#041c53]">4.8 ★ Rating</p>
                <p className="text-[11px] text-gray-500 font-medium">Top Rated Mentors</p>
              </div>
            </div>
          </div>

          {/* Right: Copy & CTA */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff447e]/10 text-[#ff447e] text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff447e]/20">
              <Sparkles size={14} />
              <span>Teach & Earn With Us</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#041c53] mb-4 tracking-tight leading-tight">
              Share Your Expertise. <br className="hidden sm:block" />
              <span className="gradient-text">Become a Certified Mentor</span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
              Are you an expert in tax, law, compliance, marketing, or business management? Partner with Fin2u Academy to build high-impact courses, host peer masterclasses, and monetize your experience.
            </p>

            {/* Benefit Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                'Keep 70% of revenue from course sales',
                'Zero upfront publishing fees or hidden costs',
                'Full support for curriculum design & video production',
                'Direct access to 5,000+ active Malaysian professionals',
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#041c53]">
                  <CheckCircle2 size={16} className="text-[#ff447e] shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/mentorship-application"
                className="btn btn-primary btn-xl shadow-lg shadow-pink-500/25 flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                <GraduationCap size={20} />
                <span>Apply as Mentor Today</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/mentors-portal"
                className="btn btn-ghost text-[#041c53] font-bold text-sm hover:text-[#ff447e]"
              >
                Learn How It Works
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

