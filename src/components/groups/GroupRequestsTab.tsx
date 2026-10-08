'use client';

import { UserPlus, Check, X, Clock, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { Group } from '@/store/api/groupApi';

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

interface GroupRequestsTabProps {
  group: Group;
  onRespond: (requestId: string, action: 'approve' | 'reject') => Promise<void>;
  isResponding: boolean;
}

export default function GroupRequestsTab({
  group,
  onRespond,
  isResponding,
}: GroupRequestsTabProps) {
  const requests = (group.membershipRequests || []).filter((r: any) => r.status === 'pending');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Pending Join Requests ({requests.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review and grant access to users requesting to join this private group
          </p>
        </div>

        {requests.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            Action Required
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No pending requests</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All membership requests have been processed. New requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const user = req.user || {};
            const reqId = req._id || (user._id || user);

            return (
              <div
                key={reqId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{user.name || 'User'}</h4>
                      {user.role && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {user.role}
                        </span>
                      )}
                    </div>
                    {user.headline && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{user.headline}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email || 'No email provided'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested {formatRelativeTime(req.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onRespond(reqId, 'reject')}
                    disabled={isResponding}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                  <button
                    onClick={() => onRespond(reqId, 'approve')}
                    disabled={isResponding}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 hover:scale-[1.02]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Member
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
