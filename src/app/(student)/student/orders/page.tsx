'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetMyOrdersQuery } from '@/store/api/paymentApi';
import {
  Receipt,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function StudentOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const { data, isLoading, refetch } = useGetMyOrdersQuery({ page, limit: 10 });
  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (o.courseSnapshot?.title || o.course?.title || '').toLowerCase();
      const num = (o.orderNumber || '').toLowerCase();
      return title.includes(q) || num.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full uppercase">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Refunded</span>
          </span>
        );
      case 'failed':
      case 'canceled':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full uppercase">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase">
            <Receipt className="w-3.5 h-3.5 text-[#ff447e]" />
            <span>Financial Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Purchase & Order History</h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Review your masterclass orders, payment receipts, and enrollment invoices processed securely.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order # or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff447e]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#ff447e]"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid & Enrolled</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed / Canceled</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#ff447e] border-t-transparent" />
            <p className="text-xs text-gray-400">Loading your purchase history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#041c53]">No Orders Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No purchase records match your search filter criteria.'
                : 'You have not purchased any premium masterclasses yet.'}
            </p>
            <Link href="/courses" className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Masterclasses</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400">
                <tr>
                  <th className="py-3.5 px-6">Order #</th>
                  <th className="py-3.5 px-6">Course / Masterclass</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Payment Gateway</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const courseSlug = order.courseSnapshot?.slug || order.course?.slug;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#041c53]">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              order.courseSnapshot?.thumbnail ||
                              order.course?.thumbnail ||
                              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
                            }
                            alt=""
                            className="w-10 h-8 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#041c53] line-clamp-1 max-w-[220px]">
                              {order.courseSnapshot?.title || order.course?.title}
                            </p>
                            <span className="text-[10px] text-gray-400 capitalize">
                              {order.courseSnapshot?.type || order.course?.type} Masterclass
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-[#041c53]">
                        {order.currency} {(order.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 capitalize">
                        <span className="font-semibold text-gray-700">{order.gateway}</span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-6 text-gray-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {order.status === 'paid' && courseSlug ? (
                          <Link
                            href={`/learn/${courseSlug}`}
                            className="btn btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                          >
                            <span>Learn</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : order.status === 'pending' && courseSlug ? (
                          <Link
                            href={`/checkout/${courseSlug}`}
                            className="btn btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1 text-[#ff447e] border-[#ff447e]"
                          >
                            <span>Resume Pay</span>
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
