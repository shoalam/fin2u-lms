'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGetGroupsQuery,
  useRespondMembershipRequestMutation,
  useCancelMembershipRequestMutation,
  Group,
} from '@/store/api/groupApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  UserPlus,
  Check,
  X,
  Clock,
  ShieldCheck,
  Mail,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Users,
  Lock,
} from 'lucide-react';

function formatRelativeTime(dateString?: string | Date) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

interface PendingJoinRequestsWidgetProps {
  mode?: 'all' | 'manage' | 'my-requests';
  title?: string;
  subtitle?: string;
  showEmptyState?: boolean;
  className?: string;
}

export default function PendingJoinRequestsWidget({
  mode = 'all',
  title,
  subtitle,
  showEmptyState = false,
  className = '',
}: PendingJoinRequestsWidgetProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Queries
  const {
    data: manageData,
    isLoading: isLoadingManage,
    refetch: refetchManage,
  } = useGetGroupsQuery(
    { type: 'manage-requests', limit: 10 },
    { skip: !isAuthenticated || mode === 'my-requests' }
  );

  const {
    data: myRequestsData,
    isLoading: isLoadingMyRequests,
    refetch: refetchMyRequests,
  } = useGetGroupsQuery(
    { type: 'my-requests', limit: 10 },
    { skip: !isAuthenticated || mode === 'manage' }
  );

  const [respondMembershipRequest, { isLoading: isResponding }] = useRespondMembershipRequestMutation();
  const [cancelMembershipRequest, { isLoading: isCancelling }] = useCancelMembershipRequestMutation();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Extract incoming requests for organizers
  const manageGroups = manageData?.groups || [];
  const incomingRequests: { group: Group; request: any }[] = [];
  for (const group of manageGroups) {
    const pendingReqs = (group.membershipRequests || []).filter((r: any) => r.status === 'pending');
    for (const req of pendingReqs) {
      incomingRequests.push({ group, request: req });
    }
  }

  // Extract outgoing requests sent by user
  const myRequestedGroups = myRequestsData?.groups || [];

  const handleRespond = async (groupId: string, requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(`${groupId}-${requestId}-${action}`);
      await respondMembershipRequest({ groupId, requestId, action }).unwrap();
      showToast('success', action === 'approve' ? '🎉 Member approved and joined the group!' : 'Request declined.');
      refetchManage();
      refetchMyRequests();
    } catch (err: any) {
      showToast('error', err?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelMyRequest = async (groupId: string, groupName: string) => {
    try {
      setProcessingId(`cancel-${groupId}`);
      await cancelMembershipRequest(groupId).unwrap();
      showToast('success', `Cancelled membership request for "${groupName}".`);
      refetchMyRequests();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to cancel request');
    } finally {
      setProcessingId(null);
    }
  };

  const isLoading = isLoadingManage || isLoadingMyRequests;
  const hasIncoming = incomingRequests.length > 0;
  const hasOutgoing = myRequestedGroups.length > 0;

  if (isLoading) return null;

  if (!hasIncoming && !hasOutgoing) {
    if (!showEmptyState) return null;
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 text-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Pending Membership Requests</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          When students request access to private groups you manage, or when you submit access requests, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn text-white ${
            toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* 1. INCOMING REQUESTS (ORGANIZER ACTION REQUIRED) */}
      {hasIncoming && (mode === 'all' || mode === 'manage') && (
        <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 dark:from-slate-900 dark:via-amber-950/10 dark:to-slate-900 border-2 border-amber-200/80 dark:border-amber-800/60 rounded-3xl p-6 md:p-7 shadow-lg shadow-amber-500/5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {title || 'Pending Group Join Requests'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                    {incomingRequests.length} Awaiting Approval
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle || 'Users requesting access to private groups you organize or moderate.'}
                </p>
              </div>
            </div>

            <Link
              href="/groups"
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Manage All Groups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
            {incomingRequests.map(({ group, request }) => {
              const reqUser = request.user || {};
              const reqUserId = (reqUser._id || reqUser).toString();
              const reqId = request._id ? request._id.toString() : reqUserId;
              const approveKey = `${group._id}-${reqId}-approve`;
              const rejectKey = `${group._id}-${reqId}-reject`;

              return (
                <div
                  key={`${group._id}-${reqId}`}
                  className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xs border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4.5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/groups/${group.slug}`}
                        className="text-xs font-extrabold text-[#041c53] dark:text-indigo-300 hover:underline flex items-center gap-1.5 truncate"
                      >
                        <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{group.name}</span>
                      </Link>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(request.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200">
                        {reqUser.avatar ? (
                          <img src={reqUser.avatar} alt={reqUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            {(reqUser.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {reqUser.name || 'Community Member'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{reqUser.email || 'No email specified'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleRespond(group._id, reqId, 'reject')}
                      disabled={isResponding}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{processingId === rejectKey ? 'Declining...' : 'Decline'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(group._id, reqId, 'approve')}
                      disabled={isResponding}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{processingId === approveKey ? 'Approving...' : 'Approve Access'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. OUTGOING REQUESTS (MY SENT ACCESS REQUESTS) */}
      {hasOutgoing && (mode === 'all' || mode === 'my-requests') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    My Sent Join Requests
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {myRequestedGroups.length} Pending Review
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Private groups you have requested to join. You will receive an email once approved.
                </p>
              </div>
            </div>

            <Link
              href="/groups?type=requested"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View In Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
            {myRequestedGroups.map((group) => {
              const cancelKey = `cancel-${group._id}`;
              const isCancellingThis = processingId === cancelKey;

              return (
                <div
                  key={group._id}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        group.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=041c53&color=fff`
                      }
                      alt={group.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {group.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Link
                      href={`/groups/${group.slug}`}
                      className="text-[11px] font-bold text-[#041c53] dark:text-indigo-300 hover:underline flex items-center gap-1"
                    >
                      <span>View Group</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCancelMyRequest(group._id, group.name)}
                      disabled={isCancelling}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isCancellingThis ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
