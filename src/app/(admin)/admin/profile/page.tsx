'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import ProfileManager from '@/components/profile/ProfileManager';
import { ShieldCheck, User } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <>
      <AdminHeader
        title="Admin Executive Profile"
        icon={ShieldCheck}
      />

      <main className="flex-1 p-3.5 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <ProfileManager forcedRole="admin" />
      </main>
    </>
  );
}
