'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  MessageSquare,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Share2,
} from 'lucide-react';
import PendingInvitationsWidget from '@/components/groups/PendingInvitationsWidget';
import PendingJoinRequestsWidget from '@/components/groups/PendingJoinRequestsWidget';

export default function MentorCommunityPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Lounge & Collaboration Hub</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Fin2u Faculty Community</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Collaborate directly with fellow verified instructors, co-author webinars, and exchange curriculum insights.
          </p>
        </div>

        <Link
          href="/groups/fin2u-mentors-lounge"
          className="btn btn-primary text-xs py-3 px-5 flex items-center gap-2 shadow-lg shadow-[#ff447e]/30 shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Enter Mentors Lounge</span>
        </Link>
      </div>

      {/* Pending Invitations Section */}
      <PendingInvitationsWidget
        title="Pending Study Circle & Faculty Invitations"
        subtitle="Accept invitations to collaborate in research groups, webinars, or course discussion hubs."
      />

      {/* Pending Membership Join Requests Section */}
      <PendingJoinRequestsWidget
        title="Faculty Group Access & Join Requests"
        subtitle="Review membership requests from applicants wanting to enter your private circles."
      />

      {/* Community Resources & Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#041c53]">Peer Instructor Network</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connect with top corporate trainers, legal specialists, and certified accountants in Malaysia. Brainstorm cross-discipline masterclasses and joint certificates.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <Link
              href="/groups/fin2u-mentors-lounge"
              className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1.5"
            >
              <span>Join Circle Discussions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#041c53]">Faculty Guidelines & Slide Templates</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Access standardized presentation templates, HRDC accreditation criteria guidelines, and pedagogy standards for high-retention video lessons.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <Link
              href="/support"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5"
            >
              <span>View Pedagogical Standards</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
