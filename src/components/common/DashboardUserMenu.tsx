'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { logout } from '@/store/authSlice';
import {
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ExternalLink,
  ChevronUp,
  Sparkles,
  Users,
  UserCheck,
  Mail,
} from 'lucide-react';
import { useGetGroupsQuery } from '@/store/api/groupApi';

interface DashboardUserMenuProps {
  variant?: 'header' | 'sidebar';
  sidebarCollapsed?: boolean;
}

export default function DashboardUserMenu({
  variant = 'header',
  sidebarCollapsed = false,
}: DashboardUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: invitationsData } = useGetGroupsQuery(
    { type: 'invitations', limit: 5 },
    { skip: !user }
  );

  const { data: manageRequestsData } = useGetGroupsQuery(
    { type: 'manage-requests', limit: 10 },
    { skip: !user }
  );

  const pendingInvitesCount = invitationsData?.groups?.length || 0;
  const pendingManageRequestsCount = (manageRequestsData?.groups || []).reduce((acc: number, g: any) => {
    return acc + ((g.membershipRequests || []).filter((r: any) => r.status === 'pending').length);
  }, 0);
  const totalAlertsCount = pendingInvitesCount + pendingManageRequestsCount;

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    router.push('/sign-in');
  };

  const getRoleTitle = (role?: string) => {
    if (role === 'admin') return 'System Super Admin';
    if (role === 'mentor') return 'Verified Instructor';
    return 'Enrolled Learner';
  };

  const getProfileHref = (role?: string) => {
    if (role === 'admin') return '/admin/profile';
    if (role === 'mentor') return '/mentor/profile';
    return '/student/profile';
  };

  const getMessagesHref = (role?: string) => {
    if (role === 'admin') return '/admin/messages';
    if (role === 'mentor') return '/mentor/messages';
    return '/student/messages';
  };

  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=ff447e&color=fff`;

  // Render Sidebar Variant
  if (variant === 'sidebar') {
    return (
      <div ref={dropdownRef} className="relative w-full">
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-expanded={isOpen}
          title={sidebarCollapsed ? user?.name || 'User Profile' : undefined}
          className={`w-full flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={user?.name || 'Profile'}
              className="w-9 h-9 rounded-xl object-cover border border-white/20"
            />
            {totalAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9px] ring-2 ring-[#041c53] shadow-xs animate-pulse">
                {totalAlertsCount}
              </span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#041c53]" />
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate group-hover:text-pink-200 transition-colors">
                  {user?.name || 'Account'}
                </p>
                <ChevronUp
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                {getRoleTitle(user?.role)}
              </p>
            </div>
          )}
        </button>

        {/* Dropdown Menu (Upward popover) */}
        {isOpen && (
          <div
            className={`absolute bottom-full mb-2 z-50 bg-[#03153d]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden py-2 divide-y divide-white/10 ${
              sidebarCollapsed ? 'left-0 w-64' : 'left-0 right-0 w-full'
            } animate-in fade-in slide-in-from-bottom-2 duration-150 text-white`}
          >
            {/* Header info */}
            <div className="px-4 py-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-extrabold text-white truncate mt-0.5">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 space-y-0.5 text-xs font-semibold">
              <Link
                href={getProfileHref(user?.role)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#ff447e]" />
                <span>My Profile</span>
              </Link>

              {user?.role === 'admin' ? (
                <Link
                  href="/admin/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Admin Settings</span>
                </Link>
              ) : (
                <Link
                  href={getProfileHref(user?.role)}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Account Settings</span>
                </Link>
              )}

              <Link
                href={getMessagesHref(user?.role)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span>Direct Messages</span>
              </Link>

              <Link
                href="/groups?type=invitations"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Group Invitations</span>
                </div>
                {pendingInvitesCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                    {pendingInvitesCount}
                  </span>
                )}
              </Link>

              <Link
                href="/groups"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Group Join Requests</span>
                </div>
                {pendingManageRequestsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                    {pendingManageRequestsCount}
                  </span>
                )}
              </Link>

              <Link
                href="/members"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Member Directory</span>
              </Link>
            </div>

            {/* Portals Section */}
            <div className="p-1.5 space-y-0.5 text-xs font-semibold">
              <p className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                Switch Portal
              </p>

              <Link
                href="/student/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Student Hub</span>
              </Link>

              {(user?.role === 'mentor' || user?.role === 'admin') && (
                <Link
                  href="/mentor/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#ff447e]" />
                  <span>Mentor Studio</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Header Variant
  return (
    <div ref={dropdownRef} className="relative">
      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white hover:bg-gray-50 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all text-left group cursor-pointer"
      >
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={user?.name || 'Profile'}
            className="w-8 h-8 rounded-xl object-cover border border-gray-200"
          />
          {totalAlertsCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9px] ring-2 ring-white shadow-xs animate-pulse">
              {totalAlertsCount}
            </span>
          ) : (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#041c53] truncate max-w-[120px]">
              {user?.name || 'My Account'}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 block truncate">
            {getRoleTitle(user?.role)}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#ff447e]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Downward popover) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden py-2 divide-y divide-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800">
          {/* Header info */}
          <div className="px-4 py-3 bg-gradient-to-r from-pink-50/50 via-blue-50/30 to-purple-50/40">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ff447e]/10 text-[#ff447e]">
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium truncate">Fin2u Portal</span>
            </div>
            <p className="text-sm font-extrabold text-[#041c53] truncate mt-1">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          {/* Navigation Links */}
          <div className="p-2 space-y-0.5 text-xs font-semibold">
            <Link
              href={getProfileHref(user?.role)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-[#ff447e]" />
              <span>User Profile</span>
            </Link>

            {user?.role === 'admin' ? (
              <Link
                href="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Admin Settings</span>
              </Link>
            ) : (
              <Link
                href={getProfileHref(user?.role)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Account Settings</span>
              </Link>
            )}

            <Link
              href={getMessagesHref(user?.role)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-pink-500" />
              <span>Direct Messages</span>
            </Link>

            <Link
              href="/groups?type=invitations"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Group Invitations</span>
              </div>
              {pendingInvitesCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  {pendingInvitesCount}
                </span>
              )}
            </Link>

            <Link
              href="/groups"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Group Join Requests</span>
              </div>
              {pendingManageRequestsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                  {pendingManageRequestsCount}
                </span>
              )}
            </Link>

            <Link
              href="/members"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#041c53] hover:bg-pink-50/60 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Member Directory</span>
            </Link>
          </div>

          {/* Switch Portal Section */}
          <div className="p-2 space-y-0.5 text-xs font-semibold">
            <p className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Switch Workspaces
            </p>

            <Link
              href="/student/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Portal</span>
            </Link>

            {(user?.role === 'mentor' || user?.role === 'admin') && (
              <Link
                href="/mentor/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-50 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#ff447e]" />
                <span>Mentor Studio</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-50 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              href="/"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Website</span>
            </Link>
          </div>

          {/* Logout button */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
