'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useGetPublicWebsiteSettingsQuery } from '@/store/api/adminApi';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { data: settings } = useGetPublicWebsiteSettingsQuery();

  const company = settings?.company;
  const social = settings?.socialLinks;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <>
      {/* Pre-footer High-Impact CTA Banner */}
      <section className="bg-[#041c53] relative overflow-hidden py-16 text-white border-t border-white/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff447e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-gradient-to-r from-pink-500/20 via-white/10 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff447e] text-white text-xs font-extrabold uppercase tracking-widest mb-3">
                <Sparkles size={14} /> Start Your Learning Journey
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Join 5,000+ Malaysian Professionals Upskilling Today
              </h3>
              <p className="text-gray-300 text-sm sm:text-base mt-2">
                Get unlimited access to free courses, community forums, and expert mentorship.
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
              {subscribed ? (
                <div className="px-6 py-3 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck size={18} /> Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                  <div className="relative w-full">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#ff447e] focus:ring-2 focus:ring-pink-500/30 transition-all"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg shrink-0 w-full sm:w-auto">
                    <span>Subscribe Free</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-[#020d2a] text-gray-400 py-16 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="mb-4 inline-block bg-white px-3.5 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform">
                <Image
                  src="/fin2u.png"
                  alt="Fin2u Academy"
                  width={160}
                  height={24}
                  className="object-contain"
                />
              </Link>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-400 mt-3 font-medium">
                {company?.name || 'Fin2u Digital Sdn. Bhd.'}<br />
                <span className="text-gray-500">
                  Company Registration No. {company?.regNo || '202001027417 (1383737-P)'}
                </span><br /><br />
                {company?.address || 'Unit I-01-05, Level 5, Block I, SetiaWalk, Persiaran Wawasan, Pusat Bandar Puchong, 47160 Puchong, Selangor, Malaysia.'}
              </p>
            </div>

            {/* Quick Navigation */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'All Courses', href: '/courses' },
                  { label: 'Community Groups', href: '/groups' },
                  { label: 'Verify Certificate', href: '/verify-certificate' },
                  { label: 'Free Courses', href: '/courses?type=free' },
                  { label: 'Premium Masterclasses', href: '/courses?type=premium' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-[#ff447e] transition-colors">
                      <ChevronRight size={13} className="text-[#ff447e]" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mentors */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Mentorship</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Mentor's Portal", href: '/mentors-portal' },
                  { label: 'Mentorship Application', href: '/mentorship-application' },
                  { label: 'Submit a Course', href: '/mentor/dashboard' },
                  { label: 'Mentor Support', href: '/support' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-[#ff447e] transition-colors">
                      <ChevronRight size={13} className="text-[#ff447e]" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Support & Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Help Center', href: '/support' },
                  { label: 'Terms of Service', href: '/terms-of-service' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-[#ff447e] transition-colors">
                      <ChevronRight size={13} className="text-[#ff447e]" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} {company?.name || 'Fin2u Digital Sdn. Bhd.'}. All rights reserved.</p>

            <div className="flex items-center gap-4">
              <a
                href={social?.facebook || 'https://www.facebook.com/Fin2uAcademy'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff447e] hover:text-white transition-all hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={social?.instagram || 'https://www.instagram.com/fin2u_academy/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff447e] hover:text-white transition-all hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={social?.linkedin || 'https://www.linkedin.com/company/fin2u-academy/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ff447e] hover:text-white transition-all hover:scale-110"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

