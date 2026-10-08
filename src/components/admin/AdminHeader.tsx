'use client';
import React from 'react';
import Link from 'next/link';
import { Menu, ChevronRight, ExternalLink, LucideIcon } from 'lucide-react';
import DashboardUserMenu from '@/components/common/DashboardUserMenu';
import { useAdminLayout } from '@/app/(admin)/admin/AdminContext';

interface AdminHeaderProps {
  setMobileMenuOpen?: (open: boolean) => void;
  title: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export default function AdminHeader({
  setMobileMenuOpen: propSetMobileMenuOpen,
  title,
  icon: Icon,
  actions,
}: AdminHeaderProps) {
  const { setMobileMenuOpen: contextSetMobileMenuOpen } = useAdminLayout();
  const setMobileMenuOpen = propSetMobileMenuOpen || contextSetMobileMenuOpen;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#041c53] hover:bg-gray-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#041c53]/5 text-[#041c53] flex items-center justify-center shrink-0 border border-gray-200/60">
            <Icon className="w-5 h-5 text-[#ff447e]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
              <Link href="/admin" className="hover:text-[#041c53] transition-colors">Admin Console</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#041c53] font-bold">{title}</span>
            </div>
            <h1 className="text-sm md:text-base font-extrabold text-[#041c53] truncate hidden sm:block">
              {title}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {actions}

        <Link
          href="/"
          target="_blank"
          className="btn btn-outline text-xs py-2 px-3 items-center gap-1.5 hidden md:flex"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Site</span>
        </Link>

        {/* Logged in user profile dropdown */}
        <DashboardUserMenu variant="header" />
      </div>
    </header>
  );
}
