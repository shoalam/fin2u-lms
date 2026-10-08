'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Award,
  User,
  UserCheck,
  LifeBuoy,
  CreditCard,
  Receipt,
  Flag,
} from 'lucide-react';
import DashboardUserMenu from '@/components/common/DashboardUserMenu';

interface AdminSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  user: any;
  pendingAppsCount?: number;
  pendingTicketsCount?: number;
}

export default function AdminSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  pendingAppsCount = 0,
  pendingTicketsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navSections = [
    {
      group: 'Core Management',
      items: [
        {
          id: 'overview',
          label: 'Dashboard Overview',
          href: '/admin',
          icon: LayoutDashboard,
          active: pathname === '/admin',
        },
        {
          id: 'orders',
          label: 'Orders & Revenue',
          href: '/admin/orders',
          icon: Receipt,
          active: pathname.startsWith('/admin/order'),
        },
        {
          id: 'courses',
          label: 'Course Catalog',
          href: '/admin/courses',
          icon: BookOpen,
          active: pathname.startsWith('/admin/course'),
        },
        {
          id: 'enrollments',
          label: 'Student Enrollments',
          href: '/admin/enrollments',
          icon: Layers,
          active: pathname.startsWith('/admin/enrollment'),
        },
        {
          id: 'students',
          label: 'Student Directory',
          href: '/admin/students',
          icon: GraduationCap,
          active: pathname.startsWith('/admin/student'),
        },
      ],
    },
    {
      group: 'Faculty & Community',
      items: [
        {
          id: 'mentors',
          label: 'Mentors & Approvals',
          href: '/admin/mentors',
          icon: Award,
          badge: pendingAppsCount > 0 ? `${pendingAppsCount} New` : null,
          badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
          active: pathname.startsWith('/admin/mentor'),
        },
        {
          id: 'groups',
          label: 'Learning Groups',
          href: '/admin/groups',
          icon: Users,
          active: pathname.startsWith('/admin/group'),
        },
        {
          id: 'members',
          label: 'Member Directory',
          href: '/members',
          icon: UserCheck,
          active: pathname.startsWith('/members'),
        },
        {
          id: 'messages',
          label: 'Direct Messages',
          href: '/admin/messages',
          icon: MessageSquare,
          active: pathname.startsWith('/admin/messages'),
        },
        {
          id: 'users',
          label: 'User Access Control',
          href: '/admin/users',
          icon: ShieldCheck,
          active: pathname.startsWith('/admin/user'),
        },
        {
          id: 'reports',
          label: 'Content Reports',
          href: '/admin/reports',
          icon: Flag,
          active: pathname.startsWith('/admin/report'),
        },
      ],
    },
    {
      group: 'Platform',
      items: [
        {
          id: 'support',
          label: 'Support & Helpdesk',
          href: '/admin/support',
          icon: LifeBuoy,
          badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} New` : null,
          badgeColor: 'bg-[#ff447e]/25 text-pink-300 border border-[#ff447e]/40',
          active: pathname.startsWith('/admin/support'),
        },
        {
          id: 'profile',
          label: 'My Admin Profile',
          href: '/admin/profile',
          icon: User,
          active: pathname === '/admin/profile',
        },
        {
          id: 'website',
          label: 'System & CMS Settings',
          href: '/admin/settings',
          icon: Settings,
          active: pathname.startsWith('/admin/setting') || pathname.startsWith('/admin/website'),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#041c53] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#0d286d] shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 bg-[#03153d]">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff447e] to-[#ff7b9f] text-white flex items-center justify-center shadow-lg shadow-[#ff447e]/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white truncate">Fin2u Admin</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#ff447e]/20 text-[#ff447e] border border-[#ff447e]/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">Control Center</p>
              </div>
            )}
          </Link>

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
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                  {section.group}
                </p>
              )}
              {sidebarCollapsed && <div className="h-px bg-white/10 my-2 mx-2" />}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group relative ${
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
                    {!sidebarCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || (item.active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Quick Shortcuts Section */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                External & Live
              </p>
            )}

            <Link
              href="/admin/messages"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
              title={sidebarCollapsed ? 'Messages' : undefined}
            >
              <MessageSquare className="w-5 h-5 shrink-0 text-[#ff447e]" />
              {!sidebarCollapsed && <span className="truncate flex-1">Messages</span>}
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff447e]/20 text-[#ff447e] border border-[#ff447e]/30">
                  Inbox
                </span>
              )}
            </Link>

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
              title={sidebarCollapsed ? 'View Live Site' : undefined}
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
    </>
  );
}
