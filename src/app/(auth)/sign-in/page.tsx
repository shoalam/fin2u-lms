'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import {
  LogIn,
  Mail,
  AlertCircle,
  ArrowRight,
  Shield,
  GraduationCap,
  BookOpen,
  Sparkles,
  Check,
  Send,
  CheckCircle2,
  KeyRound,
  RotateCw,
  Clock,
  Laptop,
} from 'lucide-react';

interface DemoAccount {
  role: 'admin' | 'mentor' | 'student';
  title: string;
  name: string;
  email: string;
  destination: string;
  tag: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    title: 'Admin',
    name: 'Alex Yeoh',
    email: 'admin@fin2u.net',
    destination: '/admin',
    tag: 'Admin Console',
    color: '#041c53',
    bgLight: 'bg-blue-50/70',
    borderColor: 'border-blue-200',
  },
  {
    role: 'mentor',
    title: 'Mentor',
    name: 'Sarah Tan',
    email: 'sarah@fin2u.net',
    destination: '/mentor/dashboard',
    tag: 'Mentor Studio',
    color: '#ff447e',
    bgLight: 'bg-pink-50/70',
    borderColor: 'border-pink-200',
  },
  {
    role: 'student',
    title: 'Student',
    name: 'Samantha Lee',
    email: 'samantha@fin2u.net',
    destination: '/student/dashboard',
    tag: 'Learner Portal',
    color: '#059669',
    bgLight: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
  },
];

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const initialEmail = searchParams.get('email') || '';
  const dispatch = useDispatch();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialEmail) {
      const savedEmail = localStorage.getItem('fin2u_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [initialEmail]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || email).trim().toLowerCase();
    if (!emailToSend || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSend)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError(null);
    try {
      const res = await sendOtp({ email: emailToSend, purpose: 'signin' }).unwrap();
      setEmail(emailToSend);
      if (res.devOtpCode) {
        setDevCode(res.devOtpCode);
      }
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to send login code. Please try again.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance focus to next digit
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all digits entered, trigger automatic verification
    if (newDigits.every((d) => d !== '') && index === 5) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async (explicitCode?: string) => {
    const fullCode = explicitCode || otpDigits.join('');
    if (fullCode.length < 6) {
      setFormError('Please enter all 6 digits of your login code.');
      return;
    }

    setFormError(null);
    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        code: fullCode,
        rememberMe,
      }).unwrap();

      if (rememberMe) {
        localStorage.setItem('fin2u_saved_email', email.trim().toLowerCase());
      }

      dispatch(setCredentials({ user: res.user, token: res.token }));

      // Redirect based on role or original redirect query
      if (res.user.role === 'admin' && redirect === '/dashboard') {
        router.push('/admin');
      } else if (res.user.role === 'mentor' && redirect === '/dashboard') {
        router.push('/mentor/dashboard');
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Invalid or expired code. Please check and try again.');
    }
  };

  const handleSelectDemo = (demo: DemoAccount) => {
    setEmail(demo.email);
    handleSendCode(demo.email);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#041c53] to-[#ff447e] text-white shadow-lg mb-4">
              {step === 'email' ? <Mail className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-extrabold text-[#041c53]">
              {step === 'email' ? 'Sign In to Fin2u' : 'Enter Verification Code'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {step === 'email'
                ? 'Passwordless access — enter your email to receive a secure one-time passcode.'
                : `We sent a 6-digit one-time code to ${email}`}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200/80">
            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <span className="flex-1">{formError}</span>
              </div>
            )}

            {devCode && step === 'otp' && (
              <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-amber-900 text-sm">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-800 block">Dev Mode Quick Code</span>
                  <span className="font-mono text-lg font-bold tracking-widest text-[#041c53]">{devCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devCode.split('');
                    setOtpDigits(digits);
                    handleVerify(devCode);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                >
                  Auto Fill & Login
                </button>
              </div>
            )}

            {step === 'email' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCode();
                }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none transition text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#ff447e] focus:ring-[#ff447e] h-4 w-4"
                    />
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#ff447e] to-[#041c53] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff447e] shadow-lg shadow-[#ff447e]/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                    Enter the 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-bold font-mono text-[#041c53] rounded-xl border-2 border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none transition"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={isVerifyingOtp || otpDigits.some((d) => !d)}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#ff447e] to-[#041c53] hover:opacity-95 shadow-lg shadow-[#ff447e]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setFormError(null);
                    }}
                    className="hover:text-[#041c53] font-medium"
                  >
                    ← Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSendingOtp}
                    onClick={() => handleSendCode()}
                    className="hover:text-[#ff447e] font-semibold text-[#041c53] disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {resendCooldown > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Accounts Switcher */}
            <div className="mt-8 pt-6 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff447e]" />
                  Quick Demo Accounts
                </span>
                <span className="text-[11px] text-slate-400">One-click OTP</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#ff447e] bg-slate-50 hover:bg-white text-left transition group"
                  >
                    <div className="text-xs font-bold text-[#041c53] group-hover:text-[#ff447e] truncate">
                      {demo.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{demo.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-500">
            By signing in, you agree to Fin2u Academy's{' '}
            <Link href="/terms-of-service" className="text-[#041c53] font-medium hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-[#041c53] font-medium hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e]"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
