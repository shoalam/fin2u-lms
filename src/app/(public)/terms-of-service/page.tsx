import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-[800px] mx-auto px-6 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-[#041c53]">Terms of Service</h1>
          <p className="text-xs text-gray-400">Last updated: September 2026</p>

          <div className="prose text-sm text-gray-600 space-y-4">
            <p>
              Welcome to Fin2u Academy, operated by Fin2u Digital Sdn. Bhd. (Registration No. 202001027417). By accessing or using our platform, you agree to be bound by these Terms of Service.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">1. Account Registration</h2>
            <p>
              You must provide accurate and complete information when registering an account. You are responsible for safeguarding your password and any activities under your account.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">2. Intellectual Property</h2>
            <p>
              All course content, videos, handouts, quizzes, and software are the intellectual property of Fin2u Digital Sdn. Bhd. or its respective instructors. You may not record, redistribute, or resell course materials without express written authorization.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">3. Refunds & Cancellation</h2>
            <p>
              Paid courses carry a 7-day satisfaction guarantee subject to our refund policy, provided less than 25% of the course curriculum has been accessed.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
