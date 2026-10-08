'use client';

import { Lock, UserPlus, Clock, CheckCircle2, Shield, Users, MessageSquare } from 'lucide-react';
import { Group } from '@/store/api/groupApi';

interface GroupGatedPlaceholderProps {
  group: Group;
  isPending: boolean;
  onRequestAccess: () => void;
  onCancelRequest: () => void;
  isRequesting: boolean;
  isCancelling: boolean;
  isAuthenticated: boolean;
}

export default function GroupGatedPlaceholder({
  group,
  isPending,
  onRequestAccess,
  onCancelRequest,
  isRequesting,
  isCancelling,
  isAuthenticated,
}: GroupGatedPlaceholderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 ring-8 ring-amber-500/5">
        <Lock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
        <Shield className="w-3.5 h-3.5" />
        Private Community
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Member-Only Content
      </h2>

      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
        This group is private. Discussions, activity feeds, live Zoom sessions, and community forums are exclusively available to approved members.
      </p>

      {/* Community Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Users className="w-5 h-5 text-indigo-500 mb-2" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Active Peers</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{group.memberCount || 1} members</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <MessageSquare className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Discussions</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Mentors & peers</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-purple-500 mb-2" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Safe Space</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Moderated forum</div>
        </div>
      </div>

      {/* Action Button */}
      {!isAuthenticated ? (
        <a
          href={`/sign-in?redirect=/groups/${group.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          Sign In to Request Access
        </a>
      ) : isPending ? (
        <div className="inline-flex flex-col sm:flex-row items-center gap-3">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-sm font-semibold">
            <Clock className="w-4 h-4 text-amber-500" />
            Already Requested (Waiting for Approval)
          </div>
          <button
            onClick={onCancelRequest}
            disabled={isCancelling}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      ) : (
        <button
          onClick={onRequestAccess}
          disabled={isRequesting}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          {isRequesting ? 'Sending Request...' : 'Request to Join Group'}
        </button>
      )}
    </div>
  );
}
