'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Lock, Users, Sparkles, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

interface CommunityAuthGateProps {
  title?: string;
  description?: string;
  feature?: string;
}

export default function CommunityAuthGate({
  title = 'Community Access Restricted',
  description = 'Fin2u Academy community groups, member profiles, and discussion feeds are exclusively available to authenticated members.',
  feature = 'Community & Groups',
}: CommunityAuthGateProps) {
  const pathname = usePathname();
  const redirectUrl = encodeURIComponent(pathname || '/groups');

  return (
    <>
      <Header />

      <main className="min-h-[75vh] bg-gradient-to-b from-slate-900 via-[#041c53] to-slate-900 text-white flex items-center justify-center p-6 py-20 relative overflow-hidden">
        {/* Background glow ornaments */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff447e]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#ff447e] to-pink-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-[#ff447e]/30">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold border border-white/15">
              <Users className="w-3.5 h-3.5 text-[#ff447e]" />
              <span>MEMBERS-ONLY {feature.toUpperCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Benefits Bullet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#ff447e] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Interactive Group Feeds</div>
                <div className="text-[10px] text-slate-400">Share resources, ask Q&A, and tag peers</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Peer Connections</div>
                <div className="text-[10px] text-slate-400">Send friend requests & direct message mentors</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/sign-in?redirect=${redirectUrl}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff447e] to-[#e0336b] hover:from-[#ff2a6d] hover:to-[#cc1f57] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ff447e]/30 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/sign-up?redirect=${redirectUrl}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/15 inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
