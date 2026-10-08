'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/profile');
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/admin/profile');
    } else if (user?.role === 'mentor') {
      router.replace('/mentor/profile');
    } else {
      router.replace('/student/profile');
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="flex flex-col items-center gap-4 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <Loader2 className="w-8 h-8 text-[#ff447e] animate-spin" />
        <div>
          <h2 className="text-lg font-black text-white">Opening Profile Studio...</h2>
          <p className="text-xs text-slate-400 mt-1">Redirecting you to your dedicated role panel</p>
        </div>
      </div>
    </div>
  );
}
