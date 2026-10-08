'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in?redirect=/dashboard');
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/admin');
    } else if (user?.role === 'mentor') {
      router.replace('/mentor/dashboard');
    } else {
      router.replace('/student/dashboard');
    }
  }, [isAuthenticated, user?.role, router]);

  return (
    <>
      <Header />
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
          <h2 className="text-lg font-bold text-[#041c53]">
            {user?.name ? `Welcome, ${user.name}` : 'Welcome to Fin2u'}
          </h2>
          <p className="text-xs text-gray-500">
            Routing to your {user?.role ? `${user.role.toUpperCase()} workspace` : 'dashboard'}...
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
