'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flag,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Users,
  User,
  FileText,
  Loader2,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  useGetAdminReportsQuery,
  useUpdateReportStatusMutation,
  ReportItem,
  ReportReason,
} from '@/store/api/socialApi';

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const { data, isLoading, refetch } = useGetAdminReportsQuery({
    status: statusFilter || undefined,
    targetType: typeFilter || undefined,
    page,
    limit: 15,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();

  const reports = data?.reports || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const handleAction = async (reportId: string, status: 'resolved' | 'dismissed' | 'reviewed') => {
    try {
      await updateStatus({
        id: reportId,
        status,
        adminNotes: adminNotes.trim() || undefined,
      }).unwrap();
      setSelectedReport(null);
      setAdminNotes('');
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update report status');
    }
  };

  const getReasonBadgeColor = (reason: ReportReason) => {
    switch (reason) {
      case 'Harassment':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200';
      case 'Inappropriate':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200';
      case 'Misinformation':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200';
      case 'Offensive':
        return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200';
      case 'Suspicious':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold border border-white/15">
            <Flag className="w-3.5 h-3.5 text-[#ff447e]" />
            <span>COMMUNITY SAFETY & MODERATION</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Content Reports Queue</h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl">
            Review user-submitted violation flags for harassment, spam, inappropriate content, and platform policy infractions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[120px]">
            <div className="text-2xl font-black text-pink-300">{total}</div>
            <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mt-0.5">Total Reports</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { label: 'All Reports', value: '' },
            { label: 'Pending Review', value: 'pending' },
            { label: 'Reviewed', value: 'reviewed' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Dismissed', value: 'dismissed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-[#041c53] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Target Type Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#ff447e]"
          >
            <option value="">All Item Types</option>
            <option value="post">Group Posts</option>
            <option value="comment">Comments</option>
            <option value="group">Groups</option>
            <option value="user">Member Accounts</option>
            <option value="message">Messages</option>
          </select>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#ff447e]" />
            <p className="text-xs font-semibold">Loading reports queue...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Clear! No Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no reports matching your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Reporter</th>
                  <th className="py-4 px-4">Type & Reason</th>
                  <th className="py-4 px-4">Reported Target</th>
                  <th className="py-4 px-4">Note / Context</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Submitted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Reporter */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={report.reporter?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporter?.name || 'U')}`}
                          alt={report.reporter?.name}
                          className="w-7 h-7 rounded-full object-cover bg-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{report.reporter?.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-slate-400">{report.reporter?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reason & Type */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getReasonBadgeColor(
                            report.reason
                          )}`}
                        >
                          {report.reason}
                        </span>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {report.targetType}
                        </div>
                      </div>
                    </td>

                    {/* Target Item */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {report.targetTitle || `Target ID: ${report.targetId}`}
                        </div>
                        {report.targetAuthor && (
                          <div className="text-[10px] text-slate-400">
                            Author: <strong className="text-slate-700 dark:text-slate-300">{report.targetAuthor.name}</strong>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Note */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                        {report.note ? `"${report.note}"` : <span className="text-slate-400">No additional note</span>}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : report.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.adminNotes || '');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#041c53] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page <strong>{page}</strong> of <strong>{pages}</strong> ({total} total reports)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Moderation Review</h3>
                  <p className="text-xs text-slate-400">Report #{selectedReport._id.slice(-6)}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500">Reported Reason</div>
                <div className="text-sm font-black text-rose-600">{selectedReport.reason}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500">Target Item</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedReport.targetTitle || selectedReport.targetId}</div>
                <div className="text-slate-400">Type: {selectedReport.targetType}</div>
              </div>

              {selectedReport.note && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-500">Reporter Note</div>
                  <div className="text-slate-800 dark:text-slate-200 italic">"{selectedReport.note}"</div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Investigation Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record moderation findings or resolution actions taken..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedReport._id, 'dismissed')}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Dismiss Report
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedReport._id, 'resolved')}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Resolve Violation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
