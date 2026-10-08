'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Mail,
  Send,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const dispatch = useDispatch();

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isMentorApp, setIsMentorApp] = useState(false);
  const [mentorAppName, setMentorAppName] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  // Resend state for expired or invalid links
  const [resendEmail, setResendEmail] = useState(email);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Automatically execute verification when token is present
  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setErrorMessage('Verification token is missing. Please check the link from your email.');
        return;
      }

      try {
        const res: any = await verifyEmail({ token, email: email || undefined }).unwrap();
        if (!isMounted) return;

        const isMentor = res?.isMentorApplication || res?.data?.isMentorApplication;
        if (isMentor) {
          setIsMentorApp(true);
          setMentorAppName(res?.name || res?.data?.name || null);
          setIsSuccess(true);
          return;
        }

        const user = res?.user || res?.data?.user;
        const authToken = res?.token || res?.data?.token;

        if (user && authToken) {
          dispatch(
            setCredentials({
              token: authToken,
              user,
            })
          );
        }

        setVerifiedUser(user);
        setIsSuccess(true);
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(
          err?.data?.message || err?.message || 'Invalid or expired verification link. Please request a fresh one.'
        );
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, email, verifyEmail, dispatch]);

  // Automatic redirect countdown on successful verification
  useEffect(() => {
    let timer: any;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      if (isMentorApp) {
        router.push('/');
      } else if (verifiedUser?.role === 'mentor') {
        router.push('/mentor/dashboard');
      } else if (verifiedUser?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student/dashboard');
      }
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router, verifiedUser, isMentorApp]);

  // Handle manual resend request
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (resendEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      setResendMessage('Please enter your email address.');
      setResendStatus('error');
      return;
    }

    try {
      const res: any = await resendVerification({ email: cleanEmail }).unwrap();
      setResendStatus('success');
      setResendMessage(res?.message || 'A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setResendStatus('error');
      setResendMessage(err?.data?.message || err?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden text-center">
      {/* Subtle Background Accent */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#ff447e]/10 to-[#041c53]/10 rounded-full blur-2xl pointer-events-none" />

      {/* 1. Loading State */}
      {isVerifying && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 bg-blue-50 text-[#041c53] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ff447e]" />
          </div>
          <h2 className="text-2xl font-black text-[#041c53]">Verifying Email Address</h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Confirming your security token and validating your details on Fin2u Academy...
          </p>
        </div>
      )}

      {/* 2. Success State */}
      {!isVerifying && isSuccess && (
        <div className="space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              {isMentorApp ? 'Application Confirmed' : 'Account Successfully Verified'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#041c53] tracking-tight">
              {isMentorApp ? 'Application In Review!' : 'Welcome to Fin2u!'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {isMentorApp ? (
                <>
                  Thank you{mentorAppName ? ` ${mentorAppName}` : ''}! Your email address has been verified and your Mentor Application is now confirmed for academic review.
                </>
              ) : verifiedUser?.name ? (
                <>
                  Hello <strong className="text-[#041c53]">{verifiedUser.name}</strong>, your email has been confirmed and your account is active.
                </>
              ) : (
                'Your email has been confirmed and your account is now ready for learning.'
              )}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
            Redirecting in <strong className="text-[#ff447e] font-black">{countdown}s</strong>...
          </div>

          <div className="pt-2">
            <Link
              href={
                isMentorApp
                  ? '/'
                  : verifiedUser?.role === 'mentor'
                  ? '/mentor/dashboard'
                  : verifiedUser?.role === 'admin'
                  ? '/admin'
                  : '/student/dashboard'
              }
              className="btn btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/25"
            >
              <span>{isMentorApp ? 'Return to Homepage' : 'Go to Dashboard Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Error / Invalid Token State */}
      {!isVerifying && !isSuccess && errorMessage && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-rose-200 shadow-sm">
            <AlertCircle className="w-9 h-9 text-rose-500" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#041c53]">Verification Link Expired</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Resend Verification Form */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#041c53]">
              <Mail className="w-4 h-4 text-[#ff447e]" />
              <span>Resend Verification Email</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Enter your registration email below to receive a new activation link:
            </p>

            <form onSubmit={handleResend} className="space-y-2.5">
              <input
                type="email"
                required
                value={resendEmail}
                onChange={(e) => {
                  setResendEmail(e.target.value);
                  setResendStatus('idle');
                }}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
              />

              {resendStatus === 'error' && (
                <p className="text-[11px] text-rose-600 font-medium">{resendMessage}</p>
              )}
              {resendStatus === 'success' && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                  ✓ {resendMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 px-3 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isResending ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Fresh Verification Link</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/sign-in"
              className="block text-xs font-bold text-gray-600 hover:text-[#041c53] transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Header />
      <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-pink-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">Loading verification parameters...</p>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
