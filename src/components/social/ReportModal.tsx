'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useSubmitReportMutation, ReportReason } from '@/store/api/socialApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import Link from 'next/link';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'group' | 'user' | 'message';
  targetId: string;
  targetTitle?: string;
  targetAuthor?: string;
}

const REPORT_REASONS: { label: ReportReason; description: string }[] = [
  { label: 'Harassment', description: 'Bullying, intimidation, unwanted contact, or targeting an individual.' },
  { label: 'Inappropriate', description: 'Sexually suggestive, adult content, nudity, or graphic depictions.' },
  { label: 'Misinformation', description: 'Deceptive, misleading facts, financial scams, or fraudulent claims.' },
  { label: 'Offensive', description: 'Hate speech, derogatory slurs, discrimination, or abusive profanity.' },
  { label: 'Suspicious', description: 'Spam, bot activity, phishing links, or suspicious account behavior.' },
  { label: 'Other', description: 'Any other violation of Fin2u Community Guidelines.' },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetAuthor,
}: ReportModalProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [selectedReason, setSelectedReason] = useState<ReportReason>('Harassment');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [submitReport, { isLoading }] = useSubmitReportMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setErrorMsg(null);

    try {
      await submitReport({
        targetType,
        targetId,
        targetTitle,
        targetAuthor,
        reason: selectedReason,
        note: note.trim() || undefined,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setNote('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to submit report. Please try again.');
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help keep the Fin2u community safe and constructive
              </p>
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

        {!isAuthenticated ? (
          <div className="py-8 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Authentication Required</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Please sign in to submit a content or member report to the moderation team.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-in"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#041c53] text-white text-xs font-bold shadow hover:bg-[#082977] transition-colors"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Thank you for keeping Fin2u safe. Our moderation team has been notified and will investigate this promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {targetTitle && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Target Item: </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{targetTitle}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Reasons Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Reason for Report <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_REASONS.map((r) => {
                  const isSelected = selectedReason === r.label;
                  return (
                    <div
                      key={r.label}
                      onClick={() => setSelectedReason(r.label)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free-text Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Details / Context (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what occurred or provide relevant context for the moderation staff..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Actions */}
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
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
