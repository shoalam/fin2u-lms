'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MessageSquare, Lock } from 'lucide-react';
import Link from 'next/link';

function MessagesRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const queryString = searchParams.toString();
    const query = queryString ? `?${queryString}` : '';

    if (user?.role === 'admin') {
      router.replace(`/admin/messages${query}`);
    } else if (user?.role === 'mentor') {
      router.replace(`/mentor/messages${query}`);
    } else {
      router.replace(`/student/messages${query}`);
    }
  }, [isAuthenticated, user?.role, router, searchParams]);

  if (!isAuthenticated) {
    const returnUrl = `/messages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-pink-50 text-[#ff447e] rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#041c53]">Sign In Required</h2>
          <p className="text-sm text-gray-500">
            Messages are accessible via your dashboard panel. Please sign in to access your direct chat inbox.
          </p>
          <div className="pt-2">
            <Link href={`/sign-in?redirect=${encodeURIComponent(returnUrl)}`} className="btn btn-primary text-xs py-3 w-full">
              Sign In to Fin2u Academy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
        <h2 className="text-lg font-bold text-[#041c53]">Redirecting to Dashboard Messages...</h2>
        <p className="text-xs text-gray-500">
          Routing you to your {user?.role ? `${user.role.toUpperCase()} messages panel` : 'student messages'}...
        </p>
      </div>
    </div>
  );
}

export default function MessagesRedirectPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading...</div>}>
        <MessagesRedirectContent />
      </Suspense>
      <Footer />
    </>
  );
}
