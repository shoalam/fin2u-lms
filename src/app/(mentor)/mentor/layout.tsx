'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  MessageSquare,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Home,
  PlusCircle,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';
import DashboardUserMenu from '@/components/common/DashboardUserMenu';

import { useGetGroupsQuery } from '@/store/api/groupApi';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: invitationsData } = useGetGroupsQuery(
    { type: 'invitations', limit: 10 },
    { skip: !isAuthenticated }
  );

  const { data: manageRequestsData } = useGetGroupsQuery(
    { type: 'manage-requests', limit: 10 },
    { skip: !isAuthenticated }
  );

  const pendingInvitesCount = invitationsData?.groups?.length || 0;
  const pendingManageRequestsCount = (manageRequestsData?.groups || []).reduce((acc: number, g: any) => {
    return acc + ((g.membershipRequests || []).filter((r: any) => r.status === 'pending').length);
  }, 0);
  const totalGroupsBadgeCount = pendingInvitesCount + pendingManageRequestsCount;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-800">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e]" />
      </div>
    );
  }

  // Guard for unauthorized visitors
  if (!isAuthenticated || (user?.role !== 'mentor' && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#ff447e]/10 text-[#ff447e] rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#041c53]">Mentor Studio Access</h2>
          <p className="text-sm text-gray-500">
            You need a verified Mentor account to access the course creator studio and faculty tools.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/mentorship-application" className="btn btn-primary text-xs py-3">
              Apply to Become a Mentor
            </Link>
            <Link href="/student/dashboard" className="btn btn-outline text-xs py-2.5">
              Go to Student Dashboard
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 mt-1">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mentorNavItems = [
    {
      label: 'Studio Dashboard',
      href: '/mentor/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/mentor/dashboard',
    },
    {
      label: 'Course Creator',
      href: '/mentor/courses',
      icon: BookOpen,
      active: pathname.startsWith('/mentor/course'),
    },
    {
      label: 'My Students',
      href: '/mentor/students',
      icon: Users,
      active: pathname.startsWith('/mentor/student'),
    },
    {
      label: 'Quiz Management',
      href: '/mentor/quizzes',
      icon: Award,
      active: pathname === '/mentor/quizzes',
    },
    {
      label: 'Faculty Community',
      href: '/mentor/community',
      icon: MessageSquare,
      active: pathname === '/mentor/community',
      badge: totalGroupsBadgeCount > 0 ? `${totalGroupsBadgeCount} New` : undefined,
    },
    {
      label: 'Explore Catalog',
      href: '/courses',
      icon: Compass,
      active: pathname === '/courses',
    },
    {
      label: 'Learning Groups',
      href: '/groups',
      icon: Users,
      active: pathname.startsWith('/groups'),
      badge: totalGroupsBadgeCount > 0 ? `${totalGroupsBadgeCount} New` : undefined,
    },
    {
      label: 'Member Directory',
      href: '/members',
      icon: UserCheck,
      active: pathname.startsWith('/members'),
    },
    {
      label: 'Direct Messages',
      href: '/mentor/messages',
      icon: MessageSquare,
      active: pathname.startsWith('/mentor/messages'),
      badge: 'Inbox',
    },
    {
      label: 'My Faculty Profile',
      href: '/mentor/profile',
      icon: UserIcon,
      active: pathname === '/mentor/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* MENTOR SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#041c53] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#0d286d] shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Sidebar Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 bg-[#03153d]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff447e] to-[#ff7b9f] text-white flex items-center justify-center shadow-lg shadow-[#ff447e]/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white truncate">Mentor Studio</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#ff447e]/20 text-[#ff447e] border border-[#ff447e]/30">
                    Faculty
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">Course Authoring</p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                Mentor Tools
              </p>
            )}

            {mentorNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    item.active
                      ? 'bg-gradient-to-r from-[#ff447e] to-[#e0336b] text-white shadow-md shadow-[#ff447e]/25'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      item.active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  {!sidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff447e]/20 text-[#ff447e] border border-[#ff447e]/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Additional portals */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                Switch Workspaces
              </p>
            )}

            <Link
              href="/student/dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
              title={sidebarCollapsed ? 'Student Portal' : undefined}
            >
              <Award className="w-5 h-5 shrink-0 text-blue-400" />
              {!sidebarCollapsed && <span className="truncate flex-1">Student Portal</span>}
            </Link>

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
                title={sidebarCollapsed ? 'Admin Console' : undefined}
              >
                <ShieldCheck className="w-5 h-5 shrink-0 text-purple-400" />
                {!sidebarCollapsed && <span className="truncate flex-1">Admin Console</span>}
              </Link>
            )}

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
              title={sidebarCollapsed ? 'Live Website' : undefined}
            >
              <ExternalLink className="w-5 h-5 shrink-0 text-emerald-400" />
              {!sidebarCollapsed && <span className="truncate flex-1">Live Website</span>}
            </Link>
          </div>
        </div>

        {/* Sidebar Footer / User Profile Dropdown */}
        <div className="p-3 border-t border-white/10 bg-[#03153d]">
          <DashboardUserMenu variant="sidebar" sidebarCollapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#041c53]/5 text-[#041c53] flex items-center justify-center shrink-0 border border-gray-200/60">
                <GraduationCap className="w-5 h-5 text-[#ff447e]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                  <span>Mentor Studio</span>
                  <span>/</span>
                  <span className="text-[#041c53] font-bold">Faculty Dashboard</span>
                </div>
                <h1 className="text-sm md:text-base font-extrabold text-[#041c53] truncate hidden sm:block">
                  Instructor Studio
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/mentor/messages"
              className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5 hidden sm:flex"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#ff447e]" />
              <span>Inbox</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="btn btn-outline text-xs py-2 px-3 items-center gap-1.5 hidden md:flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>

            {/* Profile dropdown */}
            <DashboardUserMenu variant="header" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
