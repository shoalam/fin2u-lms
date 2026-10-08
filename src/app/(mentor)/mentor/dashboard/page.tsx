'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetMentorSalesQuery } from '@/store/api/paymentApi';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  PlusCircle,
  Star,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import PendingInvitationsWidget from '@/components/groups/PendingInvitationsWidget';
import PendingJoinRequestsWidget from '@/components/groups/PendingJoinRequestsWidget';

export default function MentorDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [dateFilter, setDateFilter] = useState<'all' | '30d' | '90d'>('all');

  const { data: coursesData, isLoading: isLoadingCourses } = useGetCoursesQuery({
    instructor: user?.role === 'admin' ? undefined : user?._id,
    approvalStatus: 'all',
    limit: 50,
  });

  const { data: salesData, isLoading: isLoadingSales } = useGetMentorSalesQuery();

  const allCourses = coursesData?.courses || [];
  const myCourses =
    user?.role === 'admin'
      ? allCourses
      : allCourses.filter((c) => (c.instructor as any)?._id === user?._id || (c.instructor as any) === user?._id);

  const totalStudents = myCourses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

  const totalRevenue = salesData?.totalRevenue || 0;
  const mentorEarnings = salesData?.mentorEarnings || 0;
  const totalSalesCount = salesData?.totalSales || 0;
  const courseBreakdown = salesData?.courseBreakdown || [];
  const recentOrders = salesData?.orders || [];

  // CSV Export handler
  const handleExportCSV = () => {
    if (!recentOrders.length) {
      alert('No sales transactions available to export.');
      return;
    }

    const headers = ['Order Number', 'Date', 'Course Title', 'Student Name', 'Student Email', 'Amount (MYR)', 'Mentor Earnings (70%)', 'Status'];
    const rows = recentOrders.map((ord: any) => [
      ord.orderNumber,
      new Date(ord.paidAt || ord.createdAt).toISOString().slice(0, 10),
      `"${ord.course?.title || ord.courseSnapshot?.title || 'Course'}"`,
      `"${ord.user?.name || 'Student'}"`,
      ord.user?.email || '',
      ord.amount || 0,
      Math.round((ord.amount || 0) * 0.7 * 100) / 100,
      ord.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fin2u_Mentor_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Panel Banner */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Mentor')}&background=ff447e&color=fff`
            }
            alt={user?.name || 'Mentor'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ff447e]/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff447e] text-white uppercase tracking-wider">
                Verified Mentor
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {user?.headline || 'Industry Practitioner & Fin2u Faculty Instructor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mentor/courses"
            className="btn btn-outline text-white border-white/20 hover:bg-white/10 text-xs py-3 px-4 flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Courses</span>
          </Link>
          <Link
            href="/mentor/courses?create=true"
            className="btn btn-primary text-xs py-3 px-5 flex items-center gap-2 shadow-lg shadow-[#ff447e]/30 shrink-0 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Masterclass</span>
          </Link>
        </div>
      </div>

      {/* Pending Group Widgets */}
      <PendingInvitationsWidget
        title="Faculty & Masterclass Group Invitations"
        subtitle="You have received invitations to collaborate in student or faculty study circles."
      />

      <PendingJoinRequestsWidget
        title="Faculty & Group Join Requests"
        subtitle="Review membership requests from students or peers requesting to enter your private study circles."
      />

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Mentor Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Net Earnings (70%)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#041c53]">MYR {mentorEarnings.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-gray-400">Your total payout share</p>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#041c53]">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#041c53]">MYR {totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-gray-400">{totalSalesCount} paid student orders</p>
        </div>

        {/* Total Students */}
        <Link
          href="/mentor/students"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Total Learners</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#041c53]">{totalStudents}</p>
          <p className="text-[11px] text-gray-400">Enrolled across {myCourses.length} courses</p>
        </Link>

        {/* Courses & Rating */}
        <Link
          href="/mentor/courses"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Active Courses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#041c53]">{myCourses.length}</p>
          <p className="text-[11px] text-gray-400">Published & draft curricula</p>
        </Link>
      </div>

      {/* Sales & Revenue Analytics Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-[#041c53]">Course Sales & Earnings Breakdown</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Real-time revenue share calculation (70% Mentor / 30% Platform)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-[#ff447e] text-xs font-bold text-[#041c53] hover:text-[#ff447e] flex items-center gap-2 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Course Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[#041c53] uppercase font-bold text-[11px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4 text-center">List Price</th>
                <th className="py-3 px-4 text-center">Paid Sales</th>
                <th className="py-3 px-4 text-right">Gross Volume</th>
                <th className="py-3 px-4 text-right">Your Earnings (70%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courseBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No course sales recorded yet. Once students purchase your courses, breakdown metrics will appear here.
                  </td>
                </tr>
              ) : (
                courseBreakdown.map((item: any, idx: number) => {
                  const itemMentorShare = Math.round((item.totalAmount || 0) * 0.7 * 100) / 100;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-[#041c53]">
                        <Link href={`/courses/${item.slug}`} className="hover:text-[#ff447e] transition">
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">
                        {item.price > 0 ? `MYR ${item.price}` : 'FREE'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {item.salesCount} sold
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        MYR {item.totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                        MYR {itemMentorShare.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Fast Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/mentor/courses?create=true"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Course Creator
            </h3>
            <p className="text-xs text-gray-400">Author and publish lesson content</p>
          </div>
        </Link>

        <Link
          href="/mentor/students"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Student Directory
            </h3>
            <p className="text-xs text-gray-400">Monitor learner progress & velocity</p>
          </div>
        </Link>

        <Link
          href="/mentor/community"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#ff447e]/30 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
              Faculty Lounge
            </h3>
            <p className="text-xs text-gray-400">Connect with peer educators</p>
          </div>
        </Link>
      </div>

      {/* Recent Teaching Curricula */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#041c53]">My Active Curricula</h3>
            <p className="text-xs text-gray-400">Programs authored by your instructor profile</p>
          </div>
          <Link href="/mentor/courses" className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1">
            <span>View All ({myCourses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : myCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#041c53]">No Courses Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Publish your first course to begin teaching Malaysian professionals.
            </p>
            <Link
              href="/mentor/courses?create=true"
              className="btn btn-primary text-xs py-2.5 px-5 font-bold inline-block"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.slice(0, 3).map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                      {c.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-base text-[#041c53] line-clamp-2">{c.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{c.lessons?.length || 0} Lessons</span>
                      <span className="font-bold text-[#041c53]">
                        {c.type === 'free' ? 'FREE' : `MYR ${c.price}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
                  <span className="text-xs text-gray-500 font-medium">{c.enrollmentCount || 0} enrolled</span>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1"
                  >
                    Preview Course <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
