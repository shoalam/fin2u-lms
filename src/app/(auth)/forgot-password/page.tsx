'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setErrorMessage(null);
    try {
      const res: any = await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      setSubmittedEmail(email.trim().toLowerCase());
      setIsSuccess(true);
      if (res?.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || 'Something went wrong. Please check your email and try again.'
      );
    }
  };

  const handleResend = () => {
    setIsSuccess(false);
    setDevResetUrl(null);
  };

  return (
    <>
      <Header />
      <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-pink-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          {/* Subtle Decorative Background Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#ff447e]/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="text-center relative">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#ff447e]/20 to-[#ff447e]/10 text-[#ff447e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#ff447e]/20">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#041c53] tracking-tight">
              {isSuccess ? 'Check Your Inbox' : 'Forgot Password?'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {isSuccess
                ? `We've sent password reset instructions to your email address.`
                : 'Enter the email linked to your Fin2u account, and we will send you a secure link to reset your password.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2.5 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-emerald-900">Email dispatched to:</p>
                <p className="text-sm font-black text-[#041c53] break-all bg-white py-1.5 px-3 rounded-xl border border-emerald-200 shadow-xs">
                  {submittedEmail}
                </p>
                <p className="text-[11px] text-emerald-700 leading-relaxed pt-1">
                  The link will expire in <strong>60 minutes</strong>. Be sure to check your spam or junk folder if you don&apos;t see it shortly.
                </p>
              </div>

              {/* Quick Dev Preview Link if returned in dev mode */}
              {devResetUrl && (
                <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff447e]" />
                    <span>Developer Instant Link</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    SMTP Dev bypass link generated for local testing:
                  </p>
                  <Link
                    href={devResetUrl}
                    className="flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 bg-white p-2 rounded-xl border border-blue-200 truncate"
                  >
                    <span className="truncate pr-2">{devResetUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Try another email address</span>
                </button>

                <Link
                  href="/sign-in"
                  className="w-full py-3 px-4 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#041c53]/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] text-sm text-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#041c53] shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  We will never share your email address. You will receive a single-use secure reset token.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/25 transition-transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#041c53] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
