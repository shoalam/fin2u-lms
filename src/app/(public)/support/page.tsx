'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  CheckCircle2,
  BookOpen,
  Award,
  CreditCard,
  UserCheck,
  LifeBuoy,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetPublicWebsiteSettingsQuery,
  useSubmitSupportInquiryMutation,
} from '@/store/api/adminApi';

interface FAQItem {
  id: string;
  category: string;
  q: string;
  a: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'access-courses',
    category: 'courses',
    q: 'How do I access my enrolled courses and video lessons?',
    a: 'Once logged in to your Fin2u Academy account, click on your profile avatar or go directly to your Student Dashboard. Under "My Enrolled Courses", click on any course or "Continue Learning" to open the interactive Lesson Player with HD video streaming, notes, quizzes, and resources.',
  },
  {
    id: 'free-courses',
    category: 'courses',
    q: 'Are the free courses really 100% free with no hidden charges?',
    a: 'Yes! All courses marked with the "FREE" badge are completely free to enroll in. You get full access to all video modules, downloadable resource attachments, community discussion groups, and end-of-course assessments.',
  },
  {
    id: 'quiz-retakes',
    category: 'courses',
    q: 'Can I retake quizzes if I do not pass on the first attempt?',
    a: 'Absolutely. You can retake any module quiz as many times as needed. Our system will record your highest passing score to help you achieve your course completion certificate.',
  },
  {
    id: 'certificate-verification',
    category: 'certificates',
    q: 'Are Fin2u certificates verifiable by employers and institutions?',
    a: 'Yes! Upon completing 100% of the lessons and passing all required quizzes, you will be issued a verifiable digital certificate. Each certificate includes a unique verification ID and a tamper-proof QR code that employers can check on our platform verification portal.',
  },
  {
    id: 'download-cert',
    category: 'certificates',
    q: 'How and when can I download my certificate of completion?',
    a: 'Your certificate is generated automatically as soon as your course progress reaches 100%. You can view, download as PDF, or share it directly to your LinkedIn profile from your Student Dashboard under the "Certificates" tab.',
  },
  {
    id: 'payment-methods',
    category: 'billing',
    q: 'What payment methods do you accept for premium courses & memberships?',
    a: 'We accept FPX Online Banking (Maybank, CIMB, Public Bank, RHB, Hong Leong, etc.), Major Credit/Debit Cards (Visa, MasterCard, American Express), and e-Wallets (GrabPay, Touch n Go eWallet, Boost) through our secure 256-bit encrypted payment gateway.',
  },
  {
    id: 'refund-policy',
    category: 'billing',
    q: 'What is Fin2u Academy\'s refund policy?',
    a: 'We offer a 7-day money-back guarantee for premium courses, provided you have watched less than 30% of the course content and have not downloaded the final certificate of completion. Contact our billing desk at billing@fin2u.net for prompt assistance.',
  },
  {
    id: 'become-mentor',
    category: 'mentors',
    q: 'How do I apply to become a certified mentor or course instructor?',
    a: 'Visit our Mentors Portal at fin2u.net/mentors and click "Apply as Mentor". Fill out the trainer submission form with your professional credentials, domain expertise (Legal, Corporate Secretarial, Accounting, or Marketing), and upload your portfolio or CV for our editorial review.',
  },
  {
    id: 'technical-issues',
    category: 'technical',
    q: 'The video player isn\'t playing smoothly or buffering. How do I fix this?',
    a: 'Our player automatically adapts to your bandwidth. Try switching video quality in player settings (e.g. 720p or 480p), ensure hardware acceleration is enabled in your browser, or clear your browser cache. For optimal experience, we recommend using updated Google Chrome, Microsoft Edge, or Apple Safari.',
  },
  {
    id: 'group-networking',
    category: 'community',
    q: 'How do I join course discussion groups and ask mentors questions?',
    a: 'Every course has an affiliated community cohort group. Visit the "Groups & Community" tab at /groups to join topic discussions, ask instructors direct questions, download peer case studies, and network with Malaysian entrepreneurs and professionals.',
  },
];

export default function SupportPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: settingsData } = useGetPublicWebsiteSettingsQuery();
  const [submitInquiry, { isLoading: isSubmitting }] = useSubmitSupportInquiryMutation();

  const supportConfig = settingsData?.supportPage;
  const companyConfig = settingsData?.company;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('access-courses');

  // Contact Form State
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactCategory, setContactCategory] = useState('Course Access');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && !contactName) {
      setContactName(user.name || '');
    }
    if (user && !contactEmail) {
      setContactEmail(user.email || '');
    }
  }, [user]);

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'courses', label: 'Course Access', icon: BookOpen },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'mentors', label: 'Mentorship', icon: UserCheck },
    { id: 'technical', label: 'Technical Help', icon: LifeBuoy },
  ];

  // Dynamic FAQs with fallback
  const faqsList: FAQItem[] =
    supportConfig?.faqs && supportConfig.faqs.length > 0
      ? supportConfig.faqs
      : DEFAULT_FAQS;

  const filteredFaqs = faqsList.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await submitInquiry({
        name: contactName,
        email: contactEmail,
        topic: contactCategory,
        subject: contactSubject,
        message: contactMessage,
      }).unwrap();

      setIsSubmitted(true);
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || 'Failed to submit support ticket. Please try again.'
      );
    }
  };

  // Dynamic Content with fallbacks
  const heroBadge = supportConfig?.heroBadge || '24/7 Fin2u Knowledge & Help Desk';
  const heroTitle = supportConfig?.heroTitle || 'How Can We Assist You Today?';
  const heroSubtitle =
    supportConfig?.heroSubtitle ||
    'Find quick answers to common questions about course enrollments, free certificate verification, payment options, or reach out directly to our Malaysian support team.';

  const emailDesk = supportConfig?.emailDeskEmail || companyConfig?.supportEmail || 'support@fin2u.net';
  const emailHours = supportConfig?.emailDeskHours || '⚡ Average response: < 24 hours';
  const hotlinePhone = supportConfig?.hotlinePhone || companyConfig?.supportPhone || '+60 3-8080 0000';
  const hotlineHours = supportConfig?.hotlineHours || '🕒 Mon–Fri, 9:00 AM – 6:00 PM (MYT)';
  const communityLink = supportConfig?.communityLink || '/groups';

  const directBadge = supportConfig?.directAssistanceBadge || 'DIRECT ASSISTANCE';
  const directTitle = supportConfig?.directAssistanceTitle || 'Still Have Questions? Send Us a Message';
  const directSubtitle =
    supportConfig?.directAssistanceSubtitle ||
    'Our academic advisors, technical engineers, and mentor coordinators review tickets around the clock.';

  const operatingHours = supportConfig?.operatingHours && supportConfig.operatingHours.length > 0
    ? supportConfig.operatingHours
    : [
        'Monday – Friday: 9:00 AM – 6:00 PM (GMT+8)',
        'Saturday & Sunday: Email Support Only',
      ];

  const headquarters = supportConfig?.headquarters && supportConfig.headquarters.length > 0
    ? supportConfig.headquarters
    : [
        companyConfig?.address || 'Level 28, Menara Fin2u, Jalan Sultan Ismail,',
        '50250 Kuala Lumpur, Malaysia',
      ];

  const availableTopics = supportConfig?.topics && supportConfig.topics.length > 0
    ? supportConfig.topics
    : [
        'Course Access',
        'Certificates',
        'Billing',
        'Mentor Application',
        'Corporate Inquiry',
        'Technical Help',
        'General',
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#041c53]">
      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02133b] via-[#041c53] to-[#0b2b6d] text-white py-16 md:py-20">
        {/* Background Subtle Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff447e]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-extrabold uppercase tracking-widest border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#ff447e]" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {heroTitle}
          </h1>

          <p className="text-gray-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            {heroSubtitle}
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative bg-white rounded-2xl shadow-2xl p-1.5 flex items-center border border-white/20">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by keywords (e.g. certificate, lesson player, refund, quiz, free)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3 text-sm text-[#041c53] placeholder-gray-400 bg-transparent focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-2 text-xs font-bold text-gray-400 hover:text-[#041c53] px-2 py-1 bg-gray-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT CHANNELS */}
      <section className="relative -mt-8 z-20 max-w-5xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#041c53]">Email Desk</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Have an account, partnership, or billing inquiry? Send us a ticket.
            </p>
            <a
              href={`mailto:${emailDesk}`}
              className="text-xs font-bold text-[#ff447e] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{emailDesk}</span>
              <span>→</span>
            </a>
            <p className="text-[11px] text-gray-400 font-medium">{emailHours}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#041c53]">Direct Hotlines</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Call our headquarters during Malaysian business operating hours.
            </p>
            <a
              href={`tel:${hotlinePhone.replace(/\s+/g, '')}`}
              className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{hotlinePhone}</span>
              <span>→</span>
            </a>
            <p className="text-[11px] text-gray-400 font-medium">{hotlineHours}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#041c53]">Community Q&A</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connect with fellow students, alumni, and certified mentors.
            </p>
            <Link
              href={communityLink}
              className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Explore Member Groups</span>
              <span>→</span>
            </Link>
            <p className="text-[11px] text-gray-400 font-medium">💬 Instant peer & mentor collaboration</p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA: FAQS & CONTACT FORM */}
      <section className="py-14 max-w-5xl mx-auto px-6 w-full space-y-12">
        {/* FAQS HEADER & CATEGORY FILTER */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-[#041c53] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs md:text-sm text-gray-500 max-w-xl mx-auto">
              Select a category below or browse our curated answers for instant solutions.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#041c53] text-white shadow-md shadow-slate-900/10'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-[#041c53]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff447e]' : 'text-gray-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-extrabold text-base text-[#041c53]">No matching answers found</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  We couldn't find any FAQs matching "{searchQuery}". Please check your spelling or send us a support ticket below!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-bold text-[#ff447e] underline hover:text-[#e0336b]"
                >
                  Clear search & reset filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-pink-200 bg-pink-50/20 shadow-xs'
                        : 'border-gray-100 bg-gray-50/60 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleFaq(faq.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-[#041c53] cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#ff447e] shrink-0" />
                        <span className="font-extrabold text-[#041c53] leading-snug">{faq.q}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#ff447e] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-gray-700 leading-relaxed border-t border-pink-100/60 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SUBMIT A TICKET / CONTACT SUPPORT FORM (DIRECT ASSISTANCE) */}
        <div id="direct-assistance" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#ff447e] text-[10px] font-extrabold tracking-wider uppercase">
                  {directBadge}
                </span>
                <h3 className="text-2xl font-black text-[#041c53] tracking-tight">
                  {directTitle}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {directSubtitle}
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 text-[#041c53] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#041c53]">Operating Hours</h5>
                    {operatingHours.map((hourLine, idx) => (
                      <p key={idx} className="text-[11px] text-gray-500">
                        {hourLine}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 text-[#041c53] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#041c53]">Headquarters</h5>
                    {headquarters.map((hqLine, idx) => (
                      <p key={idx} className="text-[11px] text-gray-500">
                        {hqLine}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7 bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-100">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#041c53]">Support Ticket Submitted!</h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Fin2u Academy. Your support request has been registered in our system, and an academic or technical advisor will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn btn-outline text-xs py-2 px-5 font-bold"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Tan"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#041c53] focus:outline-none focus:border-[#ff447e] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. sarah@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#041c53] focus:outline-none focus:border-[#ff447e] font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Topic / Category *</label>
                      <select
                        value={contactCategory}
                        onChange={(e) => setContactCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#041c53] focus:outline-none focus:border-[#ff447e] font-medium"
                      >
                        {availableTopics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of issue"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#041c53] focus:outline-none focus:border-[#ff447e] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Detailed Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide details about your question, course title, or issue..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#041c53] focus:outline-none focus:border-[#ff447e] font-medium leading-relaxed resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary text-xs py-3 px-6 w-full flex items-center justify-center gap-2 font-bold shadow-md shadow-pink-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Support Ticket...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Support Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
