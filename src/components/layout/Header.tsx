'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Search, ChevronDown, BookOpen, LayoutDashboard, HelpCircle, GraduationCap, Sparkles, User, Users, UserCheck, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';
import { useGetPublicWebsiteSettingsQuery } from '@/store/api/adminApi';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const { data: settings } = useGetPublicWebsiteSettingsQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  const announcement = settings?.announcement;
  const isAnnouncementActive = announcement && announcement.isEnabled;

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    router.push('/');
  };

  const dashboardUrl =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'mentor'
      ? '/mentor/dashboard'
      : '/student/dashboard';

  return (
    <>
      {/* Top CMS Announcement Bar if enabled */}
      {isAnnouncementActive && announcement?.text && (
        <div className="bg-gradient-to-r from-[#ff447e] to-[#e0336b] text-white text-xs font-semibold py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2">
          <Sparkles size={14} className="animate-pulse shrink-0" />
          <span>{announcement.text}</span>
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              className="underline font-bold hover:text-pink-100 ml-1 inline-flex items-center gap-0.5"
            >
              <span>Learn more</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">

        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center group">
          <Image
            src="/fin2u.png"
            alt="Fin2u Academy"
            width={160}
            height={24}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Courses dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#041c53] rounded-full hover:bg-pink-50 hover:text-[#ff447e] transition-all">
              <BookOpen size={16} className="text-[#ff447e]" />
              <span>Courses</span>
              <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            <div className="absolute top-full left-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
              <Link href="/courses" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <span>All Courses</span>
                <ArrowRight size={14} />
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <Link href="/courses?type=free" className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <span>Free Courses</span>
                <span className="badge badge-free">Free</span>
              </Link>
              <Link href="/courses?type=premium" className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <span>Premium Tracks</span>
                <span className="badge badge-premium">Premium</span>
              </Link>
            </div>
          </div>

          {/* Mentors dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#041c53] rounded-full hover:bg-pink-50 hover:text-[#ff447e] transition-all">
              <GraduationCap size={16} className="text-[#ff447e]" />
              <span>Mentors</span>
              <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            <div className="absolute top-full left-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
              <Link href="/mentors-portal" className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                Mentor&apos;s Hub
              </Link>
              <Link href="/mentorship-application" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <span>Apply as Mentor</span>
                <Sparkles size={14} className="text-amber-500" />
              </Link>
            </div>
          </div>

          {/* Community & Groups dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#041c53] rounded-full hover:bg-pink-50 hover:text-[#ff447e] transition-all">
              <Users size={16} className="text-[#ff447e]" />
              <span>Community</span>
              <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
              <Link href="/groups" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#ff447e]" />
                  <span>Learning Groups</span>
                </div>
                <ArrowRight size={14} />
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <Link href="/members" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e] transition-colors">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-[#ff447e]" />
                  <span>Members & Network</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Support */}
          <Link href="/support" className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#041c53] rounded-full hover:bg-pink-50 hover:text-[#ff447e] transition-all">
            <HelpCircle size={16} className="text-[#ff447e]" />
            <span>Support</span>
          </Link>
        </nav>

        {/* Right: Auth & CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/courses" className="p-2 text-gray-500 hover:text-[#ff447e] transition-colors rounded-full hover:bg-pink-50" title="Search courses">
            <Search size={18} />
          </Link>

          {isMounted && isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={dashboardUrl}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-[#ff447e] to-[#e0336b] hover:from-[#e0336b] hover:to-[#c72559] text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <LayoutDashboard size={16} />
                <span>Go to your Panel</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/sign-in" className="btn btn-ghost btn-sm text-[#041c53] font-bold hover:text-[#ff447e]">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm shadow-md shadow-pink-500/20">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/courses"
            className="p-2 text-gray-500 hover:text-[#ff447e] transition-colors rounded-full hover:bg-pink-50"
            title="Search courses"
          >
            <Search size={20} />
          </Link>
          <button
            className="p-2.5 text-[#041c53] hover:text-[#ff447e] hover:bg-pink-50 rounded-full transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-xl px-5 py-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-300 max-h-[calc(100dvh-75px)] overflow-y-auto">
          {/* User profile banner if logged in */}
          {isMounted && isAuthenticated && user && (
            <div className="p-3.5 bg-gradient-to-r from-pink-50/80 to-blue-50/80 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=ff447e&color=fff&size=80`
                  }
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#ff447e] shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#041c53] truncate">{user.name}</p>
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ff447e]/15 text-[#ff447e] mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 px-1">
              Explore Fin2u
            </span>

            <Link
              href="/courses"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen size={17} className="text-[#ff447e]" /> All Courses
              </span>
              <ArrowRight size={15} />
            </Link>

            <div className="pl-8 flex flex-col gap-1.5 my-1">
              <Link
                href="/courses?type=free"
                className="text-xs font-semibold text-gray-600 hover:text-[#ff447e] py-1"
                onClick={() => setMobileOpen(false)}
              >
                Free Courses
              </Link>
              <Link
                href="/courses?type=premium"
                className="text-xs font-semibold text-gray-600 hover:text-[#ff447e] py-1"
                onClick={() => setMobileOpen(false)}
              >
                Premium Tracks
              </Link>
            </div>

            <Link
              href="/mentors-portal"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <GraduationCap size={17} className="text-[#ff447e]" /> Mentors Hub
              </span>
            </Link>

            <Link
              href="/mentorship-application"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles size={17} className="text-amber-500" /> Apply as Mentor
              </span>
            </Link>

            <Link
              href="/groups"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <Users size={17} className="text-[#ff447e]" /> Learning Groups
              </span>
            </Link>

            <Link
              href="/members"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <UserCheck size={17} className="text-[#ff447e]" /> Members & Network
              </span>
            </Link>

            <Link
              href="/verify-certificate"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck size={17} className="text-emerald-600" /> Verify Certificate
              </span>
            </Link>

            <Link
              href="/support"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={17} className="text-[#ff447e]" /> Support & FAQ
              </span>
            </Link>
          </div>

          {/* Authenticated Role Workspaces */}
          {isMounted && isAuthenticated && (
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 px-1">
                My Workspace
              </span>

              <Link
                href="/student/dashboard"
                className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
                onClick={() => setMobileOpen(false)}
              >
                <User size={16} className="text-blue-500" /> Student Portal
              </Link>

              {(user?.role === 'mentor' || user?.role === 'admin') && (
                <Link
                  href="/mentor/dashboard"
                  className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
                  onClick={() => setMobileOpen(false)}
                >
                  <GraduationCap size={16} className="text-amber-500" /> Mentor Studio
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShieldCheck size={16} className="text-purple-500" /> Admin Console
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-bold text-[#041c53] hover:bg-pink-50 hover:text-[#ff447e]"
                onClick={() => setMobileOpen(false)}
              >
                <User size={16} className="text-gray-500" /> Account Settings
              </Link>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-gray-100">
            {isMounted && isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={dashboardUrl}
                  className="btn btn-primary w-full justify-center text-sm py-2.5 shadow-md shadow-pink-500/20"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={16} /> Go to your Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full justify-center text-sm py-2 text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/register"
                  className="btn btn-primary w-full justify-center py-2.5 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Create Free Account
                </Link>
                <Link
                  href="/sign-in"
                  className="btn btn-outline w-full justify-center py-2.5 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}

