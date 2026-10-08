'use client';

import React, { Suspense } from 'react';
import MessagesPanel from '@/components/messages/MessagesPanel';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function StudentMessagesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>DIRECT CHAT & PEER LEARNING</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black">Student Messages</h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl">
            Chat 1-on-1 with instructors, course mentors, and classmates directly within your student dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center px-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
              <Sparkles className="w-3.5 h-3.5 text-[#ff447e]" />
              <span>Real-Time Inbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Panel Container */}
      <Suspense fallback={<div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">Loading messages...</div>}>
        <MessagesPanel portalRole="student" />
      </Suspense>
    </div>
  );
}
