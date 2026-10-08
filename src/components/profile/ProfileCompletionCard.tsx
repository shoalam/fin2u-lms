'use client';

import React from 'react';
import {
  FileText,
  UserCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface CompletionSection {
  id: string;
  label: string;
  completed: number;
  total: number;
  icon: any;
  color: string;
}

interface ProfileCompletionCardProps {
  sections: CompletionSection[];
  overallPercentage: number;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  role: 'mentor' | 'student' | 'admin';
}

export default function ProfileCompletionCard({
  sections,
  overallPercentage,
  activeTab,
  onSelectTab,
  role,
}: ProfileCompletionCardProps) {
  const getRoleBadge = () => {
    if (role === 'admin') {
      return {
        label: 'Admin Profile Status',
        sub: 'Platform Administrator Credentials & Security Verification',
        color: 'from-purple-600 to-indigo-600',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    }
    if (role === 'mentor') {
      return {
        label: 'Faculty Verification Status',
        sub: 'Complete your mentor profile to author courses and receive bookings',
        color: 'from-[#ff447e] to-[#ff7b9f]',
        bg: 'bg-pink-50 text-[#ff447e] border-pink-200',
      };
    }
    return {
      label: 'Learner Profile Status',
      sub: 'Complete your profile to unlock verified course certificates',
      color: 'from-blue-600 to-cyan-600',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  };

  const badge = getRoleBadge();
  const isAllComplete = overallPercentage === 100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 via-[#041c53] to-[#0a276e] text-white relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#ff447e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-pink-200">
                <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#ff447e]" />
                {badge.label}
              </span>
              {isAllComplete ? (
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> 100% Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <AlertCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Action Required
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              Complete Your Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {badge.sub}
            </p>
          </div>

          {/* Percentage Counter Circle / Widget */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 md:p-5 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-none">
                {overallPercentage}%
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-pink-200 uppercase tracking-wider mt-0.5 sm:mt-1">
                Completed
              </p>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-3 sm:border-4 border-white/20 border-t-[#ff447e] flex items-center justify-center font-black text-xs text-white shadow-inner">
              ✓
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
          <div className="h-2.5 sm:h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${badge.color}`}
              style={{ width: `${Math.max(5, overallPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300 font-semibold px-0.5">
            <span>Overall: {overallPercentage}%</span>
            <span>{isAllComplete ? 'Profile Fully Verified' : 'Click any section below to update'}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Checklist Section */}
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50/60 border-t border-slate-100">
        <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">
          Profile Verification Checklist
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            const isDone = section.completed === section.total && section.total > 0;
            const isCurrent = activeTab === section.id;

            return (
              <button
                key={`${section.id || 'sec'}-${idx}`}
                type="button"
                onClick={() => onSelectTab(section.id)}
                className={`flex flex-col items-start justify-between p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                  isCurrent
                    ? 'bg-white border-[#ff447e] shadow-md ring-2 ring-[#ff447e]/20'
                    : isDone
                    ? 'bg-white border-emerald-200 hover:border-emerald-300 shadow-2xs'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5 sm:mb-2.5">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCurrent
                        ? 'bg-[#ff447e]/10 text-[#ff447e]'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {section.completed}/{section.total}
                  </span>
                </div>

                <div className="w-full">
                  <p
                    className={`text-[11px] sm:text-xs font-bold truncate leading-tight ${
                      isCurrent
                        ? 'text-[#041c53]'
                        : isDone
                        ? 'text-emerald-950 font-extrabold'
                        : 'text-slate-700'
                    }`}
                  >
                    {section.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 truncate">
                    {isDone ? (
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span>Edit details</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
