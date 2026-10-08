import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-[800px] mx-auto px-6 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-[#041c53]">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Compliance with Malaysian Personal Data Protection Act 2010 (PDPA)</p>

          <div className="prose text-sm text-gray-600 space-y-4">
            <p>
              Fin2u Digital Sdn. Bhd. is committed to protecting the privacy of our students, mentors, and partners. This Privacy Policy details how we collect, store, and process your personal information.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, enrolling in courses, submitting quiz responses, or applying to become a mentor.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">2. Use of Personal Data</h2>
            <p>
              Your data is utilized strictly to provide digital classroom access, verify quiz grading, process certificate issuance, and communicate platform updates.
            </p>
            <h2 className="text-lg font-bold text-[#041c53]">3. Data Protection & Security</h2>
            <p>
              In strict compliance with the Malaysian PDPA regulations, we maintain industry-standard encrypted storage and access safeguards to prevent unauthorized data breaches.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
