'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useGetMentorApplicationsQuery, useGetSupportInquiriesQuery } from '@/store/api/adminApi';
import { ShieldCheck } from 'lucide-react';
import { AdminContext } from './AdminContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: mentorAppsData } = useGetMentorApplicationsQuery(undefined, {
    skip: !mounted || user?.role !== 'admin',
  });
  const mentorApplications = mentorAppsData?.applications || (Array.isArray(mentorAppsData) ? mentorAppsData : []);
  const pendingAppsCount = mentorApplications.filter((a) => a.status === 'pending').length;

  const { data: supportInquiriesData } = useGetSupportInquiriesQuery(
    { status: 'pending', limit: 1 },
    { skip: !mounted || user?.role !== 'admin' }
  );
  const pendingTicketsCount = supportInquiriesData?.stats?.pending || 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 text-slate-800">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 text-slate-800">
        <div className="max-w-md w-full bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#ff447e]/10 text-[#ff447e] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#041c53]">Admin Console Restricted</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Access to this portal is restricted to authorized platform administrators only.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/sign-in?redirect=/admin" className="btn btn-primary text-xs py-3">
              Sign In with Admin Account
            </Link>
            <Link href="/" className="btn btn-outline text-xs py-2.5">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800">
        <AdminSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
          pendingAppsCount={pendingAppsCount}
          pendingTicketsCount={pendingTicketsCount}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
          }`}
        >
          {children}
        </div>
      </div>
    </AdminContext.Provider>
  );
}
