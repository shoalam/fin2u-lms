'use client';

import React, { useState } from 'react';
import { ShieldBan, X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useBlockUserMutation } from '@/store/api/socialApi';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  onSuccess?: () => void;
}

export default function BlockModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'this member',
  onSuccess,
}: BlockModalProps) {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [blockUser, { isLoading }] = useBlockUserMutation();

  if (!isOpen) return null;

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await blockUser({ userId: targetUserId, reason: reason.trim() || undefined }).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to block user. Please try again.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <ShieldBan className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Block Member</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restrict interaction with {targetUserName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Member Blocked</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {targetUserName} has been blocked. Their posts and messages are now hidden from you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBlock} className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>What happens when you block this member?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
                <li>Hides their posts and comments across all activity feeds</li>
                <li>Stops @mentions, group invites, and direct chat messages</li>
                <li>Removes any active friendship/connection automatically</li>
                <li>Records an audit alert for platform administration</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for blocking (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Inappropriate messages, spam, harassment..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Blocking...</span>
                  </>
                ) : (
                  <>
                    <ShieldBan className="w-3.5 h-3.5" />
                    <span>Confirm Block</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
