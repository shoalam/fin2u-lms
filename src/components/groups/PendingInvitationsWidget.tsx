'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGetGroupsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  Group,
} from '@/store/api/groupApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  Mail,
  Check,
  X,
  ArrowRight,
  Shield,
  Users,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface PendingInvitationsWidgetProps {
  title?: string;
  subtitle?: string;
  showEmptyState?: boolean;
  className?: string;
}

export default function PendingInvitationsWidget({
  title = 'Pending Group Invitations',
  subtitle = 'You have received invitations to join the following learning communities.',
  showEmptyState = false,
  className = '',
}: PendingInvitationsWidgetProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, refetch } = useGetGroupsQuery(
    { type: 'invitations', limit: 6 },
    { skip: !isAuthenticated }
  );

  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [declineInvitation, { isLoading: isDeclining }] = useDeclineInvitationMutation();

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const groups = data?.groups || [];

  const handleAccept = async (group: Group) => {
    try {
      await acceptInvitation({ groupId: group._id }).unwrap();
      showToast('success', `🎉 You joined "${group.name}"!`);
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (group: Group) => {
    try {
      await declineInvitation({ groupId: group._id }).unwrap();
      showToast('success', `Invitation for "${group.name}" declined.`);
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to decline invitation');
    }
  };

  if (isLoading) {
    return null;
  }

  if (groups.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 text-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Pending Invitations</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          When mentors or classmates invite you to collaborate, they will appear here.
        </p>
      </div>
    );
  }

  const userId = (user?._id || (user as any)?.id || '')?.toString();
  const userEmail = (user?.email || '').trim().toLowerCase();

  return (
    <div
      className={`bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-indigo-950/10 dark:to-slate-900 border-2 border-indigo-200/80 dark:border-indigo-800/60 rounded-3xl p-6 md:p-7 shadow-lg shadow-indigo-500/5 relative overflow-hidden ${className}`}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 animate-fadeIn ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider">
                {groups.length} New
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <Link
          href="/groups?type=invitations"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All in Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Invitations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {groups.map((group) => {
          const myInvitation = (group.invitations || []).find((inv: any) => {
            const invUserId = (inv.user?._id || inv.user)?.toString();
            const invEmail = (inv.email || '').trim().toLowerCase();
            return (
              inv.status === 'pending' &&
              ((invUserId && invUserId === userId) || (userEmail && invEmail === userEmail))
            );
          });

          const inviterName = myInvitation?.invitedBy?.name || 'A group member';
          const assignedRole = myInvitation?.role || 'member';

          const avatarUrl =
            group.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              group.name
            )}&background=4f46e5&color=fff&size=128&bold=true`;

          return (
            <div
              key={group._id}
              className="bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={avatarUrl}
                  alt={group.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 dark:border-slate-700 shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/groups/${group.slug}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                    >
                      {group.name}
                    </Link>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
                      {assignedRole}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Invited by <strong className="text-slate-700 dark:text-slate-200">{inviterName}</strong>
                  </p>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{group.memberCount || 1} members</span>
                    <span>·</span>
                    <span className="capitalize">{group.type || 'Public'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleAccept(group)}
                  disabled={isAccepting}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(group)}
                  disabled={isDeclining}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  title="Decline Invitation"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Decline</span>
                </button>
                <Link
                  href={`/groups/${group.slug}`}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs transition-all"
                  title="Preview Group"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
