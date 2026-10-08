'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useResetPasswordMutation, useVerifyResetTokenQuery } from '@/store/api/authApi';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Validate token query
  const {
    data: verifyData,
    isLoading: isVerifying,
    isError: isTokenInvalid,
    error: tokenError,
  } = useVerifyResetTokenQuery(
    { email, token },
    { skip: !email || !token }
  );

  const [resetPasswordMutation, { isLoading: isSubmitting }] = useResetPasswordMutation();

  // Automatic redirect countdown on success
  useEffect(() => {
    let timer: any;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      router.push('/sign-in');
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please double check.');
      return;
    }

    setErrorMessage(null);
    try {
      await resetPasswordMutation({
        email,
        token,
        password,
      }).unwrap();

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || 'Failed to reset password. The link might have expired.'
      );
    }
  };

  // Missing parameters state
  if (!email || !token) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-[#041c53]">Invalid Reset Link</h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          This password reset link is missing required security verification parameters.
        </p>
        <div className="pt-3">
          <Link
            href="/forgot-password"
            className="btn btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Request New Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Token verifying state
  if (isVerifying) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-12 h-12 bg-blue-50 text-[#041c53] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#041c53]">Verifying Security Token</h2>
        <p className="text-xs text-gray-500">Checking the validity of your password reset request...</p>
      </div>
    );
  }

  // Invalid or expired token error state
  if (isTokenInvalid && !isSuccess) {
    const errorMsg =
      (tokenError as any)?.data?.message ||
      'This password reset link has expired or has already been used.';

    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-[#041c53]">Expired or Invalid Link</h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{errorMsg}</p>
        <div className="pt-3 space-y-2.5">
          <Link
            href="/forgot-password"
            className="btn btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Request Fresh Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="block text-xs font-bold text-gray-500 hover:text-[#041c53] transition-colors py-1.5"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm animate-in zoom-in-50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#041c53]">Password Reset Complete</h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Your password has been securely updated. You can now log into your Fin2u Academy account with your new credentials.
        </p>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
          Redirecting to Sign In in <strong className="text-[#ff447e] font-black">{countdown}s</strong>...
        </div>

        <div className="pt-2">
          <Link
            href="/sign-in"
            className="btn btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/25"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Password reset entry form
  return (
    <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#ff447e]/10 to-[#041c53]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="text-center relative">
        <div className="w-14 h-14 bg-gradient-to-tr from-[#ff447e]/20 to-[#ff447e]/10 text-[#ff447e] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#ff447e]/20">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#041c53] tracking-tight">Create New Password</h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Resetting password for <strong className="text-[#041c53]">{email}</strong>
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2.5 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] text-sm text-gray-800 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Repeat new password"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] text-sm text-gray-800 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Strength guidance */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Password Security Requirements</span>
          </div>
          <ul className="text-[10px] text-slate-500 space-y-0.5 list-disc pl-4">
            <li className={password.length >= 6 ? 'text-emerald-600 font-bold' : ''}>
              At least 6 characters in length
            </li>
            <li className={password && password === confirmPassword ? 'text-emerald-600 font-bold' : ''}>
              Both passwords match
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/25 transition-transform active:scale-[0.99]"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Save & Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <Link
            href="/sign-in"
            className="text-xs font-bold text-gray-500 hover:text-[#041c53] transition-colors"
          >
            Cancel & Return to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-pink-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">Loading security parameters...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
