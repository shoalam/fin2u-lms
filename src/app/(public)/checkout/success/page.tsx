'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGetOrderQuery, useConfirmOrderMutation } from '@/store/api/paymentApi';
import { enrollmentApi } from '@/store/api/enrollmentApi';
import { useDispatch } from 'react-redux';
import {
  CheckCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const orderId = searchParams.get('orderId') || '';
  const slug = searchParams.get('slug') || '';

  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId, {
    skip: !orderId,
    pollingInterval: 3000, // Poll for 15s to catch webhook completion
  });

  const [confirmOrder] = useConfirmOrderMutation();
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    if (orderId && !hasConfirmed && order && order.status !== 'paid') {
      setHasConfirmed(true);
      confirmOrder(orderId)
        .unwrap()
        .then(() => {
          refetch();
          dispatch(enrollmentApi.util.invalidateTags(['Enrollment']));
        })
        .catch(() => {});
    } else if (order && order.status === 'paid') {
      dispatch(enrollmentApi.util.invalidateTags(['Enrollment']));
    }
  }, [orderId, order, hasConfirmed, confirmOrder, refetch, dispatch]);

  const courseSlug = slug || order?.courseSnapshot?.slug || order?.course?.slug;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl shadow-slate-100 text-center space-y-6">
        {/* Success Animated Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Payment Confirmed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#041c53]">
            You're Officially Enrolled!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Your payment has been processed successfully. Lifetime access to your masterclass is now unlocked.
          </p>
        </div>

        {/* Receipt Card */}
        {order && (
          <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#041c53]">
                <Receipt className="w-4 h-4 text-[#ff447e]" />
                <span>Transaction Receipt</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">{order.orderNumber}</span>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Masterclass:</span>
                <span className="font-bold text-[#041c53] text-right line-clamp-1 max-w-[260px]">
                  {order.courseSnapshot?.title || order.course?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-extrabold text-emerald-600">
                  {order.currency} {(order.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold text-gray-800 capitalize">{order.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 uppercase text-[10px] px-2 py-0.5 rounded-full bg-emerald-100">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Paid & Active</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {courseSlug ? (
            <Link
              href={`/learn/${courseSlug}`}
              className="btn btn-primary py-4 px-8 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/30"
            >
              <BookOpen className="w-5 h-5" />
              <span>Enter Classroom & Start Learning</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/student/courses"
              className="btn btn-primary py-4 px-8 text-sm font-extrabold"
            >
              Go to My Enrolled Courses
            </Link>
          )}

          <Link
            href="/student/dashboard"
            className="btn btn-outline py-3.5 px-6 text-xs font-bold"
          >
            Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc] py-12">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff447e] border-t-transparent" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
