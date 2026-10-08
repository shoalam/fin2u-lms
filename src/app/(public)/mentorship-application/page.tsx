'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Award,
  CheckCircle,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Upload,
  ExternalLink,
  BookOpen,
  Briefcase,
  HelpCircle,
  Check,
  Mail,
  AlertCircle,
  LogIn,
  RefreshCw,
  Sparkles,
  UserCheck,
  Clock,
} from 'lucide-react';
import {
  useSubmitMentorApplicationMutation,
  useLazyCheckMentorApplicationEmailQuery,
} from '@/store/api/adminApi';
import { useResendVerificationMutation } from '@/store/api/authApi';
import FileUploader from '@/components/common/FileUploader';
import { StorageFolders } from '@/constants/storage-folders';

const TRAINING_MODE_OPTIONS = [
  'Physical',
  'Online Live (Zoom, Google Meet, Microsoft Team)',
  'E-learning (Pre-recorded)',
];

const LANGUAGE_OPTIONS = ['Bahasa', 'English', 'Chinese'];

const CATEGORY_OPTIONS = [
  'Digital (etc digital marketing, google SEO, e-commerce, email marketing...)',
  'Productivity (etc Microsoft Excel, Powerpoint, Google Slides, Canva...)',
  'Management (etc leadership, coaching, mentoring...)',
  'Soft Skills (etc communication, interpersonal, relationship...)',
  'Sales & Marketing',
  'HR related (etc. employment act, payroll, contract...)',
  'Account & Finance',
  'Health & Safety',
  'Certification (etc. Halal, ISO, HACCP, CIDB, ESG framework...)',
];

export default function MentorshipApplicationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submitApplication, { isLoading }] = useSubmitMentorApplicationMutation();
  const [triggerCheckEmail, { isFetching: isCheckingEmail }] =
    useLazyCheckMentorApplicationEmailQuery();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [hrdcStatus, setHrdcStatus] = useState<'Certified' | 'Accredited' | 'No'>('No');
  const [trainingModes, setTrainingModes] = useState<string[]>(['E-learning (Pre-recorded)']);
  const [physicalCoverageArea, setPhysicalCoverageArea] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English', 'Bahasa']);
  const [courseCategories, setCourseCategories] = useState<string[]>([]);
  const [hasOtherCategory, setHasOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [trainerProfileUrl, setTrainerProfileUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [sampleCourseOutline, setSampleCourseOutline] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [comments, setComments] = useState('');

  // Prefill authenticated student's info
  useEffect(() => {
    if (user) {
      if ((user as any).firstName && !firstName) setFirstName((user as any).firstName);
      if ((user as any).lastName && !lastName) setLastName((user as any).lastName);
      if (user.name && !name) {
        setName(user.name);
        if (!firstName && !lastName) {
          const parts = user.name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
      }
      if (user.email && !email) setEmail(user.email);
      if ((user as any).phone && !phone) setPhone((user as any).phone);
      if ((user as any).social?.linkedin && !linkedin) setLinkedin((user as any).social.linkedin);
      setEmailExistsError(null);
    }
  }, [user]);

  // Check email duplicate for public guests
  useEffect(() => {
    if (isAuthenticated) {
      setEmailExistsError(null);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailExistsError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await triggerCheckEmail({ email: cleanEmail }).unwrap();
        if (res?.exists) {
          setEmailExistsError(
            res.message ||
              'This email is already registered on Fin2u. Please log in to your account and submit your mentor application.'
          );
        } else {
          setEmailExistsError(null);
        }
      } catch (e) {
        // ignore check errors
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email, isAuthenticated, triggerCheckEmail]);

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = submissionResult?.email || email.trim().toLowerCase();
    if (!targetEmail) return;

    try {
      const res: any = await resendVerification({ email: targetEmail }).unwrap();
      setResendStatus('success');
      setResendMessage(res?.message || 'A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setResendStatus('error');
      setResendMessage(err?.data?.message || err?.message || 'Failed to resend verification email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName =
      [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || name.trim();

    const payload = {
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      hrdcStatus,
      trainingModes,
      physicalCoverageArea: physicalCoverageArea.trim(),
      languages,
      courseCategories,
      otherCategory: hasOtherCategory ? otherCategory.trim() : '',
      trainerProfileUrls: trainerProfileUrl.trim() ? [trainerProfileUrl.trim()] : [],
      resumeUrl: resumeUrl.trim(),
      certificateUrl: certificateUrl.trim(),
      sampleCourseOutline: sampleCourseOutline.trim(),
      linkedin: linkedin.trim(),
      comments: comments.trim(),
    };

    try {
      const res: any = await submitApplication(payload).unwrap();
      setSubmissionResult(res?.data || res);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to submit mentor application';
      if (
        msg.includes('already exists') ||
        msg.includes('log in') ||
        msg.includes('registered')
      ) {
        setEmailExistsError(msg);
      } else {
        alert(msg);
      }
    }
  };

  return (
    <>
      <Header />
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white py-12 md:py-16">
        <div className="max-w-[900px] mx-auto px-6 text-center space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ff447e]/20 text-[#ff447e] border border-[#ff447e]/30">
            JOIN OUR FACULTY
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Fin2u Academy ~ Online Course Creator
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Partner with Malaysia&apos;s premier practical e-learning platform to monetize your expertise and reach thousands of ambitious professionals.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details & Value Proposition */}
            <div className="lg:col-span-4 space-y-6">
              {/* Value Proposition Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-base text-[#041c53]">Why Partner with Fin2u Academy?</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Started off as an e-learning platform (
                  <a href="https://fin2u.net" target="_blank" className="text-[#ff447e] underline font-semibold">
                    fin2u.net
                  </a>
                  ), Fin2u Academy is focused on localised and practical contents tailored to the Malaysian business landscape.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-pink-100 text-[#ff447e] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      1
                    </div>
                    <div>
                      <strong className="text-[#041c53] block">Leverage Our Platform</strong>
                      <span>Host your courses on our high-speed, modern LMS without managing server infrastructure.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#041c53] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      2
                    </div>
                    <div>
                      <strong className="text-[#041c53] block">Marketing Engine</strong>
                      <span>Let Fin2u be your marketing channel to reach companies, SMEs, and professionals across Malaysia.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      3
                    </div>
                    <div>
                      <strong className="text-[#041c53] block">HRDCorp Accredited</strong>
                      <span>Optional to appoint Fin2u as your certified HRDCorp Training Provider for claimable corporate training.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Insight Box */}
              <div className="bg-gradient-to-br from-[#041c53] to-[#0a2a6e] text-white rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#ff447e]">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Malaysian Market Opportunity</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  With a population of over 30 million people and strong internet penetration, Malaysia is rapidly adopting flexible, online workplace learning solutions.
                </p>
              </div>
            </div>

            {/* Right Column: Google Form fields */}
            {/* Right Column: Google Form fields */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
              {submitted ? (
                submissionResult?.requiresEmailVerification ? (
                  <div className="py-12 text-center space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-pink-50 text-[#ff447e] rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-pink-100">
                      <Mail className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff447e] bg-pink-50 px-3 py-1 rounded-full border border-pink-200 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-[#ff447e]" />
                        Action Required: Verify Email
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-[#041c53]">
                        Check Your Email Inbox
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        We sent an email verification link to{' '}
                        <strong className="text-[#041c53]">
                          {submissionResult?.email || email}
                        </strong>
                        . Please click the button in that email to confirm your email and submit your application for review.
                      </p>
                    </div>

                    {/* Resend box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left space-y-2.5">
                      <p className="text-[11px] text-gray-500">
                        Didn&apos;t receive the email? Check your Spam/Junk folder or click below to resend:
                      </p>
                      {resendStatus === 'error' && (
                        <p className="text-[11px] text-rose-600 font-medium">{resendMessage}</p>
                      )}
                      {resendStatus === 'success' && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                          ✓ {resendMessage}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#041c53] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                      >
                        {isResending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff447e]" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-[#ff447e]" />
                        )}
                        <span>{isResending ? 'Resending...' : 'Resend Verification Email'}</span>
                      </button>
                    </div>

                    <div className="pt-2 flex justify-center gap-3">
                      <Link href="/" className="btn btn-primary text-xs py-2.5 px-6">
                        Return to Homepage
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-[#041c53]">Application Received!</h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for applying to partner with Fin2u Academy as an Online Course Creator. Our academic partnership team will review your proposal and reach out to you within 2–3 business days.
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                      <Link href="/" className="btn btn-primary text-xs py-2.5 px-6">
                        Return to Homepage
                      </Link>
                      <Link href="/courses" className="btn btn-outline text-xs py-2.5 px-6">
                        Explore Existing Courses
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-extrabold text-[#041c53]">Partner Details Form</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                    </p>
                  </div>

                  {/* Authenticated user notification */}
                  {isAuthenticated && user && (
                    <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-3 text-xs text-[#041c53]">
                      <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Applying as logged in member: {user.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Your application will be directly linked to your verified account ({user.email}). No email verification required.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Existing account warning for public applicant */}
                  {!isAuthenticated && emailExistsError && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block text-amber-950">
                            Account Already Exists
                          </strong>
                          <span>{emailExistsError}</span>
                        </div>
                      </div>
                      <Link
                        href={`/sign-in?redirect=${encodeURIComponent('/mentorship-application')}`}
                        className="px-4 py-2 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white font-bold flex items-center gap-1.5 flex-shrink-0 shadow-sm transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In & Apply</span>
                      </Link>
                    </div>
                  )}

                  {/* Section 1: Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#ff447e] uppercase tracking-wider flex items-center gap-1.5">
                      <span>1. Personal & Contact Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#041c53] mb-1.5">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#041c53] mb-1.5">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#041c53]">
                            Email <span className="text-red-500">*</span>
                          </label>
                          {isCheckingEmail && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              Checking...
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          readOnly={isAuthenticated}
                          placeholder="e.g. trainer@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs md:text-sm focus:outline-none ${
                            emailExistsError
                              ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus:border-amber-500'
                              : isAuthenticated
                              ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                              : 'border-gray-200 focus:border-[#ff447e]'
                          }`}
                        />
                        {emailExistsError && !isAuthenticated && (
                          <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span>Registered email. Please sign in to apply.</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#041c53] mb-1.5">
                          Phone number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +60 12-345 6789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: HRDC Certification */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#041c53]">
                      Are you a HRDC certified / accredited trainer? <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['Certified', 'Accredited', 'No'] as const).map((status) => (
                        <label
                          key={status}
                          className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                            hrdcStatus === status
                              ? 'border-[#ff447e] bg-pink-50/50 text-[#ff447e] shadow-2xs'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="hrdcStatus"
                            value={status}
                            checked={hrdcStatus === status}
                            onChange={() => setHrdcStatus(status)}
                            className="text-[#ff447e] focus:ring-0"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Training Modes */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#041c53]">
                      I can conduct training in (multiple choice) <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-2">
                      {TRAINING_MODE_OPTIONS.map((mode) => {
                        const checked = trainingModes.includes(mode);
                        return (
                          <div
                            key={mode}
                            onClick={() => toggleArrayItem(trainingModes, setTrainingModes, mode)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-medium cursor-pointer transition-all ${
                              checked
                                ? 'border-[#ff447e] bg-pink-50/30 text-[#041c53]'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#ff447e]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                            <span>{mode}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 4: Physical Coverage Area */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#041c53]">
                      For physical training, your coverage area can be?
                    </label>
                    <p className="text-[11px] text-gray-400">
                      List down as many as you can, starting with your first choice. Example: KL, Selangor, Ipoh, Penang
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. KL, Selangor, Johor Bahru, Penang"
                      value={physicalCoverageArea}
                      onChange={(e) => setPhysicalCoverageArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                    />
                  </div>

                  {/* Section 5: Languages */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#041c53]">
                      Language(s) that I can use to train: <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const checked = languages.includes(lang);
                        return (
                          <button
                            type="button"
                            key={lang}
                            onClick={() => toggleArrayItem(languages, setLanguages, lang)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                              checked
                                ? 'bg-[#041c53] text-white border-[#041c53]'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5 text-[#ff447e]" />}
                            <span>{lang}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 6: Category of Course Topics */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-[#041c53]">
                        Category of course topics: <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-gray-400 mt-0.5">Can select multiple categories</p>
                    </div>

                    <div className="space-y-2">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const checked = courseCategories.includes(cat);
                        return (
                          <div
                            key={cat}
                            onClick={() => toggleArrayItem(courseCategories, setCourseCategories, cat)}
                            className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                              checked
                                ? 'border-[#ff447e] bg-pink-50/30 text-[#041c53] font-semibold'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#ff447e] mt-0.5 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                            )}
                            <span>{cat}</span>
                          </div>
                        );
                      })}

                      {/* Other category checkbox */}
                      <div
                        onClick={() => setHasOtherCategory(!hasOtherCategory)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          hasOtherCategory
                            ? 'border-[#ff447e] bg-pink-50/30 text-[#041c53] font-semibold'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {hasOtherCategory ? (
                          <CheckSquare className="w-4 h-4 text-[#ff447e] mt-0.5 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span>Other topics</span>
                      </div>

                      {hasOtherCategory && (
                        <div className="pl-7 pt-1">
                          <input
                            type="text"
                            placeholder="Specify other course category..."
                            value={otherCategory}
                            onChange={(e) => setOtherCategory(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff447e]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 7: Trainer Profile & Portfolio Links */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-[#041c53] mb-1">
                        Trainer Profile / Portfolio Link
                      </label>
                      <p className="text-[11px] text-gray-400 mb-1.5">
                        Link to your Google Drive, Dropbox, website, or resume document (Max 10 MB per file)
                      </p>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or https://yourportfolio.com"
                        value={trainerProfileUrl}
                        onChange={(e) => setTrainerProfileUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <FileUploader
                        label="Resume / CV Document (Optional)"
                        value={resumeUrl}
                        onChange={setResumeUrl}
                        folder={StorageFolders.MENTORS_RESUMES}
                        accept=".pdf,.doc,.docx"
                        helperText="Upload your latest CV or resume in PDF or Word format (Max 25MB)."
                      />
                    </div>

                    <div>
                      <FileUploader
                        label="HRDC / Professional Certificate (Optional)"
                        value={certificateUrl}
                        onChange={setCertificateUrl}
                        folder={StorageFolders.MENTORS_CERTIFICATES}
                        accept=".pdf,.png,.jpg,.jpeg"
                        helperText="Upload certified credentials or accreditation document (PDF/Image)."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#041c53] mb-1">
                        Sample Course Outline / Syllabus Link (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/... or https://drive.google.com/..."
                        value={sampleCourseOutline}
                        onChange={(e) => setSampleCourseOutline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#041c53] mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.linkedin.com/in/yourname"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#041c53] mb-1">Comments / Course Concept</label>
                      <textarea
                        rows={3}
                        placeholder="Share any special thoughts, existing client list, or proposed course format..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary w-full py-3.5 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-2xl shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isLoading ? 'Submitting Application...' : 'Submit Mentor Application'}</span>
                    </button>
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                      By submitting, you agree to Fin2u Academy terms and mentor partnership guidelines.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
