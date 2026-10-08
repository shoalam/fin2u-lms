'use client';

import React from 'react';
import ProfileManager from '@/components/profile/ProfileManager';

export default function MentorProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#041c53]">
            Mentor Faculty Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your verified instructor identity, course author credentials, and consultation details.
          </p>
        </div>
      </div>

      <ProfileManager forcedRole="mentor" />
    </div>
  );
}
