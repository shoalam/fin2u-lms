'use client';

import React from 'react';
import ProfileManager from '@/components/profile/ProfileManager';

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#041c53]">
            Student Hub Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep your learner details up to date to generate accredited certificates and connect with mentors.
          </p>
        </div>
      </div>

      <ProfileManager forcedRole="student" />
    </div>
  );
}
