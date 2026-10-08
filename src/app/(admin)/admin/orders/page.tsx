'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminOrdersQuery,
  useGetAdminMentorSalesSummaryQuery,
  useRefundOrderMutation,
  OrderItem,
} from '@/store/api/paymentApi';
import { useGetAdminCoursesQuery, useGetAdminMentorsQuery } from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Eye,
  AlertCircle,
  ShieldCheck,
  X,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Download,
  Award,
  ChevronDown,
  Calendar,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'orders' | 'mentor-sales'>('orders');

  // Server-side query state: search, filters, sorting & pagination
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [mentorFilter, setMentorFilter] = useState<string>('all');
  const [orderSort, setOrderSort] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);

  // Mentor search in analytics tab
  const [mentorSearch, setMentorSearch] = useState('');
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<OrderItem | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundError, setRefundError] = useState<string | null>(null);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Convert sort string to backend format
  const getSortParam = (sortVal: string) => {
    if (sortVal.startsWith('-')) {
      return `${sortVal.slice(1)}:desc`;
    }
    return `${sortVal}:asc`;
  };

  // Fetch orders with backend pagination, search, sorting & filtering
  const {
    data,
    isLoading: isLoadingOrders,
    isFetching: isFetchingOrders,
    refetch: refetchOrders,
  } = useGetAdminOrdersQuery(
    {
      page: currentPage,
      limit: pageLimit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      gateway: gatewayFilter !== 'all' ? gatewayFilter : undefined,
      courseId: courseFilter !== 'all' ? courseFilter : undefined,
      mentorId: mentorFilter !== 'all' ? mentorFilter : undefined,
      search: debouncedSearch || undefined,
      sort: getSortParam(orderSort),
    },
    { skip: user?.role !== 'admin' }
  );

  // Fetch mentor sales summary aggregation
  const {
    data: mentorSalesData,
    isLoading: isLoadingMentorSales,
    isFetching: isFetchingMentorSales,
    refetch: refetchMentorSales,
  } = useGetAdminMentorSalesSummaryQuery(undefined, { skip: user?.role !== 'admin' });

  // Fetch courses list for course filter dropdown
  const { data: coursesData } = useGetAdminCoursesQuery(
    { limit: 100 },
    { skip: user?.role !== 'admin' }
  );
  const courses = coursesData?.courses || [];

  // Fetch mentors list for mentor filter dropdown
  const { data: mentorsData } = useGetAdminMentorsQuery(
    { limit: 100 },
    { skip: user?.role !== 'admin' }
  );
  const mentors = mentorsData?.mentors || [];

  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, page: currentPage, limit: pageLimit, pages: 1 };
  const stats = data?.stats || {
    totalOrders: 0,
    paidCount: 0,
    pendingCount: 0,
    refundedCount: 0,
    totalRevenue: 0,
  };

  const isAnyFilterActive =
    searchInput !== '' ||
    statusFilter !== 'all' ||
    gatewayFilter !== 'all' ||
    courseFilter !== 'all' ||
    mentorFilter !== 'all' ||
    orderSort !== '-createdAt';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setGatewayFilter('all');
    setCourseFilter('all');
    setMentorFilter('all');
    setOrderSort('-createdAt');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortToggle = (field: string) => {
    if (orderSort === field) {
      setOrderSort(`-${field}`);
    } else if (orderSort === `-${field}`) {
      setOrderSort(field);
    } else {
      setOrderSort(field === 'createdAt' || field === 'amount' ? `-${field}` : field);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (orderSort === field) return <ArrowUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    if (orderSort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5 text-[#ff447e]" />;
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 opacity-60 hover:opacity-100" />;
  };

  const getPageNumbers = (): (number | string)[] => {
    const totalPages = pagination.pages || 1;
    const current = pagination.page || 1;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (current >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', current - 1, current, current + 1, '...', totalPages];
  };

  const handleOpenRefund = (order: OrderItem) => {
    setRefundModalOrder(order);
    setRefundReason('Customer requested refund');
    setRefundAmount(order.amount.toString());
    setRefundError(null);
  };

  const handleProcessRefund = async () => {
    if (!refundModalOrder) return;
    try {
      setRefundError(null);
      await refundOrder({
        orderId: refundModalOrder._id,
        reason: refundReason,
        amount: refundAmount ? Number(refundAmount) : undefined,
      }).unwrap();
      setRefundModalOrder(null);
      refetchOrders();
      refetchMentorSales();
    } catch (err: any) {
      setRefundError(err?.data?.message || 'Failed to process refund at gateway.');
    }
  };

  const handleExportAllMentorSalesCSV = () => {
    if (!mentorSalesData?.mentors?.length) {
      alert('No mentor sales data available to export.');
      return;
    }

    const headers = [
      'Mentor ID',
      'Mentor Name',
      'Mentor Email',
      'Course Title',
      'List Price (MYR)',
      'Units Sold',
      'Gross Sales (MYR)',
      'Mentor Earnings 70% (MYR)',
      'Platform Share 30% (MYR)',
    ];

    const rows: string[][] = [];
    mentorSalesData.mentors.forEach((m) => {
      if (m.courses.length === 0) {
        rows.push([
          m.mentor._id,
          `"${m.mentor.name}"`,
          m.mentor.email,
          'No courses sold',
          '0',
          '0',
          '0',
          '0',
          '0',
        ]);
      } else {
        m.courses.forEach((c) => {
          const platShare = Math.round(c.totalAmount * 0.3 * 100) / 100;
          rows.push([
            m.mentor._id,
            `"${m.mentor.name}"`,
            m.mentor.email,
            `"${c.title}"`,
            c.price.toString(),
            c.unitsSold.toString(),
            c.totalAmount.toString(),
            c.mentorShare.toString(),
            platShare.toString(),
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fin2u_All_Mentors_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Paid</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            <RotateCcw className="w-3 h-3 text-purple-600 shrink-0" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>{s}</span>
          </span>
        );
    }
  };

  const overall = mentorSalesData?.overallSummary;
  const filteredMentors = (mentorSalesData?.mentors || []).filter((m) => {
    if (!mentorSearch.trim()) return true;
    const q = mentorSearch.toLowerCase();
    return (
      m.mentor.name.toLowerCase().includes(q) ||
      m.mentor.email.toLowerCase().includes(q) ||
      m.courses.some((c) => c.title.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <AdminHeader
        title="Orders & Mentor Revenue"
        icon={Receipt}
        actions={
          <button
            onClick={() => {
              if (activeTab === 'orders') refetchOrders();
              else refetchMentorSales();
            }}
            disabled={isFetchingOrders || isFetchingMentorSales}
            className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#041c53] ${
                isFetchingOrders || isFetchingMentorSales ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>
        }
      />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* View Switcher Tabs & Actions - Highly Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition text-center ${
                activeTab === 'orders'
                  ? 'bg-[#041c53] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Receipt className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
              <span className="truncate">All Transactions ({stats.totalOrders})</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor-sales')}
              className={`px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition text-center ${
                activeTab === 'mentor-sales'
                  ? 'bg-[#ff447e] text-white shadow-md shadow-[#ff447e]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
              <span className="truncate">Mentor Revenue</span>
              {overall?.activeInstructorsCount ? (
                <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-mono hidden xs:inline">
                  {overall.activeInstructorsCount}
                </span>
              ) : null}
            </button>
          </div>

          {activeTab === 'mentor-sales' && (
            <button
              onClick={handleExportAllMentorSalesCSV}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#ff447e] text-xs font-bold text-[#041c53] hover:text-[#ff447e] flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export Financial Report</span>
            </button>
          )}
        </div>

        {/* TAB 1: MENTOR SALES & REVENUE ANALYTICS */}
        {activeTab === 'mentor-sales' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Top KPI Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Platform Gross Revenue */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#041c53]">
                    Total Gross Revenue
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#041c53] truncate">
                  MYR {(overall?.totalPlatformGrossRevenue || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400">{overall?.totalPaidOrdersCount || 0} paid course enrollments</p>
              </div>

              {/* Mentor Payout Share (70%) */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Mentor Payouts (70%)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 truncate">
                  MYR {(overall?.totalMentorPayoutLiability || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400">Total instructor earnings liability</p>
              </div>

              {/* Platform Net Share (30%) */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700">
                    Platform Profit (30%)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-700 truncate">
                  MYR {(overall?.totalPlatformNetProfit || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400">Fin2u Academy net commission</p>
              </div>

              {/* Active Selling Instructors */}
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-700">
                    Active Mentors
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#041c53]">{overall?.activeInstructorsCount || 0}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  Top: {overall?.topMentor?.mentor?.name || 'N/A'}
                </p>
              </div>
            </div>

            {/* Mentors Sales Table Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[#041c53]">
                    Mentor-by-Mentor Sales Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detailed unit sales and revenue split breakdown for every instructor on Fin2u Academy.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mentorSearch}
                    onChange={(e) => setMentorSearch(e.target.value)}
                    placeholder="Filter by mentor name or course..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#ff447e] focus:ring-1 focus:ring-[#ff447e] outline-none"
                  />
                </div>
              </div>

              {isLoadingMentorSales ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e]" />
                  <p className="text-xs text-slate-500 mt-2">Calculating mentor revenue shares...</p>
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No mentor sales match the filter criteria.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMentors.map((item) => {
                    const isExpanded = expandedMentorId === item.mentor._id;
                    return (
                      <div key={item.mentor._id} className="p-3.5 sm:p-5 lg:p-6 hover:bg-slate-50/50 transition">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                          {/* Mentor Profile */}
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <img
                              src={
                                item.mentor.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.mentor.name)}&background=ff447e&color=fff`
                              }
                              alt={item.mentor.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h4 className="font-bold text-xs sm:text-sm text-[#041c53] truncate">{item.mentor.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#ff447e] shrink-0">
                                  {item.courses.length} Courses
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 truncate">{item.mentor.email}</p>
                            </div>
                          </div>

                          {/* Revenue Share Numbers - Responsive Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-4 lg:gap-6 text-xs bg-slate-50 sm:bg-slate-50/70 lg:bg-transparent p-3 sm:p-4 lg:p-0 rounded-2xl">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Sales</span>
                              <span className="font-bold text-slate-700">{item.totalSalesCount} units</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Gross Revenue</span>
                              <span className="font-bold text-[#041c53] block truncate">
                                MYR {item.totalGrossRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="text-emerald-600 block text-[10px] uppercase font-bold">Mentor 70% Share</span>
                              <span className="font-black text-emerald-600 block truncate">
                                MYR {item.mentorEarnings.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-600 block text-[10px] uppercase font-bold">Platform 30%</span>
                              <span className="font-bold text-blue-700 block truncate">
                                MYR {item.platformCommission.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <button
                              onClick={() => {
                                setMentorFilter(item.mentor._id);
                                setActiveTab('orders');
                              }}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#041c53] text-xs text-slate-700 font-bold hover:text-[#041c53] transition text-center"
                            >
                              View Orders
                            </button>
                            <button
                              onClick={() => setExpandedMentorId(isExpanded ? null : item.mentor._id)}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold flex items-center justify-center gap-1 transition text-center"
                            >
                              <span>{isExpanded ? 'Hide Courses' : 'Courses'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Nested Courses Breakdown with responsive overflow */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            {/* Mobile Card List for Course Details (< 640px) */}
                            <div className="block sm:hidden space-y-2.5">
                              {item.courses.map((c) => (
                                <div key={c._id} className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                                  <Link
                                    href={`/courses/${c.slug}`}
                                    className="font-bold text-[#041c53] hover:text-[#ff447e] transition block truncate"
                                  >
                                    {c.title}
                                  </Link>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase">List Price</span>
                                      <span className="font-semibold text-slate-700">MYR {c.price}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase">Units Sold</span>
                                      <span className="font-bold text-blue-700">{c.unitsSold} sold</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block text-[9px] uppercase">Gross Total</span>
                                      <span className="font-bold text-[#041c53]">
                                        MYR {c.totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-emerald-600 block text-[9px] uppercase font-bold">Mentor 70%</span>
                                      <span className="font-black text-emerald-600">
                                        MYR {c.mentorShare.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Table view for Tablet/Desktop (>= 640px) */}
                            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
                              <table className="w-full text-left text-xs text-slate-600 min-w-[500px]">
                                <thead className="bg-slate-100/60 text-[#041c53] font-bold text-[10px] uppercase tracking-wider">
                                  <tr>
                                    <th className="py-2.5 px-3">Course Title</th>
                                    <th className="py-2.5 px-3 text-center">List Price</th>
                                    <th className="py-2.5 px-3 text-center">Units Sold</th>
                                    <th className="py-2.5 px-3 text-right">Gross Total</th>
                                    <th className="py-2.5 px-3 text-right">Mentor 70% Share</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {item.courses.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50">
                                      <td className="py-2.5 px-3 font-semibold text-[#041c53]">
                                        <Link href={`/courses/${c.slug}`} className="hover:text-[#ff447e] transition">
                                          {c.title}
                                        </Link>
                                      </td>
                                      <td className="py-2.5 px-3 text-center">MYR {c.price}</td>
                                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{c.unitsSold} sold</td>
                                      <td className="py-2.5 px-3 text-right font-medium">
                                        MYR {c.totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                                        MYR {c.mentorShare.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL INDIVIDUAL ORDERS & TRANSACTIONS */}
        {activeTab === 'orders' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Volume</span>
                  <DollarSign className="w-4 h-4 text-pink-500 shrink-0" />
                </div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-black text-[#041c53] truncate">
                  MYR {(stats.totalRevenue || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">Successful payments</p>
              </div>

              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Paid Orders</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-black text-[#041c53]">{stats.paidCount}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">Enrolled & fulfilled</p>
              </div>

              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Pending</span>
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-black text-[#041c53]">{stats.pendingCount}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">Awaiting gateway</p>
              </div>

              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Refunded</span>
                  <RotateCcw className="w-4 h-4 text-purple-500 shrink-0" />
                </div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-black text-[#041c53]">{stats.refundedCount}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">Access revoked</p>
              </div>
            </div>

            {/* Filter Bar with Mentor Filter Included */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search order #, student name, email, course..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {isAnyFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-[#ff447e] hover:border-[#ff447e] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}

                  <button
                    onClick={() => refetchOrders()}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-[#041c53] hover:border-[#041c53] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOrders ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filter Dropdown Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-gray-100 text-xs">
                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Mentor Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Mentor / Author
                  </label>
                  <select
                    value={mentorFilter}
                    onChange={(e) => {
                      setMentorFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="all">All Mentors</option>
                    {mentors.map((m: any) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Course
                  </label>
                  <select
                    value={courseFilter}
                    onChange={(e) => {
                      setCourseFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="all">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gateway Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Gateway
                  </label>
                  <select
                    value={gatewayFilter}
                    onChange={(e) => {
                      setGatewayFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="all">All Gateways</option>
                    <option value="stripe">Stripe</option>
                    <option value="fpx">FPX</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Section: Mobile Card View + Desktop Data Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* MOBILE CARDS VIEW (< md) */}
              <div className="block md:hidden">
                {isLoadingOrders ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mb-2" />
                    <p className="text-xs">Loading transactions...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No orders match the current filter criteria.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((ord) => {
                      const instructor = (ord.course as any)?.instructor;
                      return (
                        <div key={ord._id} className="p-4 space-y-3">
                          {/* Order Header: ID, Status, Date */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-mono font-bold text-xs text-[#041c53]">
                              #{ord.orderNumber}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(ord.status)}
                            </div>
                          </div>

                          {/* Course and Mentor */}
                          <div>
                            <p className="font-bold text-xs text-[#041c53] line-clamp-1">
                              {ord.course?.title || ord.courseSnapshot?.title || 'Masterclass'}
                            </p>
                            {instructor?.name && (
                              <p className="text-[11px] text-[#ff447e] font-semibold flex items-center gap-1 mt-0.5">
                                <GraduationCap className="w-3 h-3 shrink-0" />
                                <span>Mentor: {instructor.name}</span>
                              </p>
                            )}
                          </div>

                          {/* Student Info & Amount Grid */}
                          <div className="flex items-center justify-between gap-2 bg-gray-50/80 p-2.5 rounded-xl text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={
                                  ord.user?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(ord.user?.name || 'U')}&background=041c53&color=fff`
                                }
                                alt={ord.user?.name || 'User'}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#041c53] truncate text-[11px]">{ord.user?.name || 'Student'}</p>
                                <p className="text-[10px] text-gray-400 truncate">{ord.user?.email}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-gray-400 block uppercase font-bold">Total</span>
                              <span className="font-black text-xs text-[#041c53]">MYR {ord.amount.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Footer: Date & Actions */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {new Date(ord.paidAt || ord.createdAt).toLocaleDateString('en-MY', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:text-[#ff447e] flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                              {ord.status === 'paid' && (
                                <button
                                  onClick={() => handleOpenRefund(ord)}
                                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Refund</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DESKTOP TABLE VIEW (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                  <thead className="bg-gray-50 text-[#041c53] uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th
                        className="py-4 px-4 sm:px-6 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortToggle('orderNumber')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Order #</span>
                          {getSortIcon('orderNumber')}
                        </div>
                      </th>
                      <th className="py-4 px-4 sm:px-6">Learner</th>
                      <th className="py-4 px-4 sm:px-6">Course & Mentor</th>
                      <th
                        className="py-4 px-4 sm:px-6 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortToggle('amount')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Amount</span>
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th className="py-4 px-4 sm:px-6 text-center">Status</th>
                      <th
                        className="py-4 px-4 sm:px-6 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortToggle('createdAt')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingOrders ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mb-2" />
                          <p>Loading transactions...</p>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          No orders match the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => {
                        const instructor = (ord.course as any)?.instructor;
                        return (
                          <tr key={ord._id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#041c53]">
                              {ord.orderNumber}
                            </td>
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={
                                    ord.user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(ord.user?.name || 'U')}&background=041c53&color=fff`
                                  }
                                  alt={ord.user?.name || 'User'}
                                  className="w-7 h-7 rounded-full object-cover border border-white shadow-xs shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-[#041c53] truncate">{ord.user?.name || 'Guest Student'}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{ord.user?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 sm:px-6 max-w-xs">
                              <p className="font-bold text-[#041c53] truncate">
                                {ord.course?.title || ord.courseSnapshot?.title}
                              </p>
                              {instructor?.name && (
                                <p className="text-[10px] text-[#ff447e] font-semibold flex items-center gap-1 mt-0.5 truncate">
                                  <GraduationCap className="w-3 h-3 shrink-0" />
                                  <span>Mentor: {instructor.name}</span>
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right font-black text-[#041c53]">
                              MYR {ord.amount.toFixed(2)}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-center">{getStatusBadge(ord.status)}</td>
                            <td className="py-4 px-4 sm:px-6 text-[11px] text-gray-500 whitespace-nowrap">
                              {new Date(ord.paidAt || ord.createdAt).toLocaleDateString('en-MY', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#ff447e] hover:border-[#ff447e] transition-colors"
                                  title="View Receipt & Order Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {ord.status === 'paid' && (
                                  <button
                                    onClick={() => handleOpenRefund(ord)}
                                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Issue Refund"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls - Responsive */}
              {pagination.pages > 1 && (
                <div className="p-3.5 sm:p-5 lg:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-gray-500 font-medium text-center sm:text-left text-[11px] sm:text-xs">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="p-1.5 sm:p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#ff447e] transition"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {getPageNumbers().map((num, idx) => (
                      <button
                        key={idx}
                        disabled={typeof num !== 'number'}
                        onClick={() => typeof num === 'number' && handlePageChange(num)}
                        className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-xl text-xs font-bold transition ${
                          num === currentPage
                            ? 'bg-[#ff447e] text-white shadow-xs'
                            : typeof num === 'number'
                            ? 'border border-gray-200 text-gray-700 hover:border-[#ff447e]'
                            : 'text-gray-400 cursor-default'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      disabled={currentPage >= pagination.pages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="p-1.5 sm:p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#ff447e] transition"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal - Fully Responsive */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-[#041c53] truncate">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] text-gray-400">Gateway Transaction Summary</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span>{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 shrink-0">Course</span>
                    <span className="font-bold text-[#041c53] text-right truncate">
                      {selectedOrder.course?.title || selectedOrder.courseSnapshot?.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mentor</span>
                    <span className="font-bold text-[#ff447e]">
                      {(selectedOrder.course as any)?.instructor?.name || 'Fin2u Faculty'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 shrink-0">Learner</span>
                    <span className="font-medium text-gray-700 text-right truncate">
                      {selectedOrder.user?.name} ({selectedOrder.user?.email})
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500">Total Paid</span>
                    <span className="font-black text-sm text-[#041c53]">
                      MYR {selectedOrder.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Mentor 70% Share</span>
                    <span className="font-black text-sm text-emerald-600">
                      MYR {(selectedOrder.amount * 0.7).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Platform 30% Profit</span>
                    <span className="font-black text-sm text-blue-600">
                      MYR {(selectedOrder.amount * 0.3).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal - Responsive */}
        {refundModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-[#041c53] truncate">Process Refund</h3>
                    <p className="text-[11px] text-gray-400">Order #{refundModalOrder.orderNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRefundModalOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {refundError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {refundError}
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Refund Amount (MYR)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#ff447e] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reason for Refund</label>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#ff447e] outline-none"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                  ⚠️ Processing a refund will automatically revoke the student's access to the course player and syllabus.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRefundModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 order-2 sm:order-1 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={isRefunding}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 order-1 sm:order-2 transition"
                >
                  {isRefunding ? 'Refunding...' : 'Confirm Refund'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
