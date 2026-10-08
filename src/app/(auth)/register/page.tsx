'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import {
  UserPlus,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCw,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  // Handle resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError(null);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || nickname;
      const res = await sendOtp({
        email: cleanEmail,
        purpose: 'register',
        name: fullName || undefined,
      }).unwrap();

      if (res.devOtpCode) {
        setDevCode(res.devOtpCode);
      }
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to send verification code.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

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
      setFormError('Please enter all 6 digits of your code.');
      return;
    }

    setFormError(null);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || nickname;
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        code: fullCode,
        rememberMe,
        name: fullName || undefined,
        role,
      }).unwrap();

      dispatch(setCredentials({ user: res.user, token: res.token }));

      if (role === 'mentor') {
        router.push('/mentor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Invalid code. Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          {/* Top Banner */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff447e] to-[#041c53] text-white shadow-lg mb-4">
              {step === 'details' ? <UserPlus className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-extrabold text-[#041c53]">
              {step === 'details' ? 'Join Fin2u Academy' : 'Verify Your Email'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {step === 'details'
                ? 'Create your free account with instant passwordless sign-in.'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Form Card */}
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
                  Auto Fill & Finish
                </button>
              </div>
            )}

            {step === 'details' ? (
              <form onSubmit={handleStartRegistration} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-[#ff447e]">*</span>
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
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Yeoh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-1">
                      Nickname / Handle
                    </label>
                    <input
                      id="nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="alexy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#ff447e] focus:ring-2 focus:ring-[#ff447e]/20 outline-none text-slate-900 text-sm bg-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Account Type */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Account Goal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-3 rounded-xl border text-left transition ${
                        role === 'student'
                          ? 'border-[#ff447e] bg-pink-50/50 text-[#041c53]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">🎓 Learner / Student</div>
                      <div className="text-[11px] text-slate-500">Access free & paid courses</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('mentor')}
                      className={`p-3 rounded-xl border text-left transition ${
                        role === 'mentor'
                          ? 'border-[#ff447e] bg-pink-50/50 text-[#041c53]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">🌟 Mentor / Instructor</div>
                      <div className="text-[11px] text-slate-500">Publish courses & coach</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-[#ff447e] to-[#041c53] hover:opacity-95 shadow-lg shadow-[#ff447e]/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <>
                        <RotateCw className="w-5 h-5 animate-spin" />
                        Sending One-Time Code...
                      </>
                    ) : (
                      <>
                        Continue with Email Code
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('details');
                      setFormError(null);
                    }}
                    className="hover:text-[#041c53] font-medium"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSendingOtp}
                    onClick={(e) => handleStartRegistration(e)}
                    className="hover:text-[#ff447e] font-semibold text-[#041c53] disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Already have an account */}
          <div className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-[#ff447e] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
