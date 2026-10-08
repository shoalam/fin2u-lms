'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGetCourseBySlugQuery } from '@/store/api/courseApi';
import {
  useCreateCheckoutMutation,
  useGetAvailableGatewaysQuery,
  CheckoutResponse,
} from '@/store/api/paymentApi';
import StripeElementsCheckout from '@/components/payment/StripeElementsCheckout';
import {
  ShieldCheck,
  Lock,
  BookOpen,
  Award,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CheckoutPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: courseData, isLoading: isLoadingCourse } = useGetCourseBySlugQuery(slug);
  const course: any = courseData?.course || (courseData as any)?.data?.course || courseData;

  const { data: gatewaysData } = useGetAvailableGatewaysQuery();
  const availableGateways = gatewaysData?.gateways || [];

  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const [createCheckout, { isLoading: isCreatingCheckout }] = useCreateCheckoutMutation();

  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push(`/sign-in?redirect=/checkout/${slug}`);
    }
  }, [isAuthenticated, router, slug]);

  // If free course -> redirect to course detail
  useEffect(() => {
    if (course && (course.type === 'free' || course.price <= 0)) {
      router.push(`/courses/${slug}`);
    }
  }, [course, router, slug]);

  // Initialize checkout once course is loaded & user is logged in
  useEffect(() => {
    if (course?._id && isAuthenticated && !checkoutData && !isCreatingCheckout && !checkoutError) {
      const initCheckout = async () => {
        try {
          setCheckoutError(null);
          const result = await createCheckout({
            courseId: course._id,
            gateway: selectedGateway,
          }).unwrap();
          setCheckoutData(result);
        } catch (err: any) {
          const msg =
            err?.data?.message || err?.message || 'Failed to initialize payment session. Please try again.';
          setCheckoutError(msg);
        }
      };
      initCheckout();
    }
  }, [course, isAuthenticated, selectedGateway]);

  // If gateway changed by user, re-initialize
  const handleGatewayChange = async (gatewayName: string) => {
    setSelectedGateway(gatewayName);
    setCheckoutData(null);
    setCheckoutError(null);
    if (!course?._id) return;
    try {
      const result = await createCheckout({
        courseId: course._id,
        gateway: gatewayName,
      }).unwrap();
      setCheckoutData(result);
    } catch (err: any) {
      setCheckoutError(err?.data?.message || 'Failed to switch payment gateway.');
    }
  };

  if (isLoadingCourse || !isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff447e] border-t-transparent" />
          <p className="text-sm font-semibold text-gray-500">Preparing secure checkout session...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-[#041c53] mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you are attempting to purchase does not exist.</p>
          <Link href="/courses" className="btn btn-primary">
            Browse All Courses
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f8fafc] py-10 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <Link
              href={`/courses/${slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#041c53] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Overview</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#041c53] mt-2">
              Secure Checkout & Enrollment
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Complete your one-time payment to gain immediate lifetime access to this masterclass.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Payment Form & Gateway Selection */}
            <div className="lg:col-span-7 space-y-6">
              {/* Gateway Selector (if multiple gateways available) */}
              {availableGateways.length > 1 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-[#041c53] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#ff447e]" />
                    <span>Select Payment Method</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableGateways.map((gw) => (
                      <button
                        key={gw.name}
                        type="button"
                        onClick={() => handleGatewayChange(gw.name)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          selectedGateway === gw.name
                            ? 'border-[#ff447e] bg-pink-50/40 shadow-xs ring-2 ring-[#ff447e]/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-[#041c53]">{gw.displayName}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{gw.flow} Checkout</p>
                        </div>
                        {selectedGateway === gw.name && (
                          <CheckCircle2 className="w-4 h-4 text-[#ff447e]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Payment Container */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#041c53]">Payment Details</h2>
                    <p className="text-xs text-gray-500">
                      Enter your card or preferred payment option below.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant Access</span>
                  </div>
                </div>

                {checkoutError ? (
                  <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>Unable to initialize checkout</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">{checkoutError}</p>
                    <button
                      onClick={() => handleGatewayChange(selectedGateway)}
                      className="btn btn-primary text-xs py-2 px-4"
                    >
                      Try Again
                    </button>
                  </div>
                ) : isCreatingCheckout || !checkoutData ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff447e] border-t-transparent" />
                    <p className="text-xs font-semibold text-gray-400">
                      Loading payment gateway elements...
                    </p>
                  </div>
                ) : checkoutData.gateway === 'stripe' && checkoutData.clientSecret ? (
                  <StripeElementsCheckout
                    publishableKey={checkoutData.publicConfig?.publishableKey || ''}
                    clientSecret={checkoutData.clientSecret}
                    orderId={checkoutData.orderId}
                    orderNumber={checkoutData.orderNumber}
                    amount={checkoutData.amount}
                    currency={checkoutData.currency}
                    courseSlug={course.slug}
                  />
                ) : checkoutData.redirectUrl ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-sm text-gray-600">
                      You will be redirected to {selectedGateway.toUpperCase()} to securely complete your
                      payment.
                    </p>
                    <a
                      href={checkoutData.redirectUrl}
                      className="btn btn-primary inline-flex items-center gap-2 py-3.5 px-8"
                    >
                      <span>Proceed to {selectedGateway.toUpperCase()}</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Payment method ready.</p>
                )}
              </div>

              {/* Trust & Guarantee Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#041c53] to-[#0a2a6e] text-white flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Full Lifetime Masterclass Access</h4>
                  <p className="text-[11px] text-gray-300 leading-snug mt-0.5">
                    Includes all future video updates, interactive quizzes, downloadable guides, and a
                    verifiable completion certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xl shadow-slate-100 space-y-6">
                <h3 className="text-base font-extrabold text-[#041c53] border-b border-gray-100 pb-3">
                  Order Summary
                </h3>

                {/* Course Item Card */}
                <div className="flex gap-4">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                    alt={course.title}
                    className="w-24 h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ff447e]/10 text-[#ff447e]">
                      {course.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#041c53] mt-1 line-clamp-2 leading-snug">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      By {course.instructor?.name || 'Fin2u Faculty Mentor'}
                    </p>
                  </div>
                </div>

                {/* Course Features List */}
                <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#ff447e]" />
                    <span>{course.duration || 120} minutes on-demand masterclass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#ff447e]" />
                    <span>{course.lessons?.length || 0} structured video lessons & syllabus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#ff447e]" />
                    <span>Accredited Certificate of Completion</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-100 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Course Tuition</span>
                    <span className="font-semibold text-gray-800">
                      {course.currency || 'MYR'} {course.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform & Gateway Fee</span>
                    <span className="font-semibold text-emerald-600">FREE (RM 0.00)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 text-sm font-black text-[#041c53]">
                    <span>Total Amount Due</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-bold mr-1">{course.currency || 'MYR'}</span>
                      <span className="text-2xl text-[#ff447e] font-black">
                        {course.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buyer Profile Preview */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-xs">
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#041c53] truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
