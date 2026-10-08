'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetMyCertificatesQuery, useGetMyEnrollmentsQuery } from '@/store/api/enrollmentApi';
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export default function StudentCertificatesPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const { data: certificates = [], isLoading: isLoadingCertificates } = useGetMyCertificatesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: enrollmentsData = [] } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrollments: any[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.enrollments || [];

  const completedCourses = enrollments.filter((e) => e.status === 'completed' || e.progress === 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-[#041c53] via-[#082977] to-[#041c53] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <Award className="w-3.5 h-3.5" />
            <span>Digital Accreditations & Badges</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Verifiable Certificates of Completion</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Official credentials earned upon 100% curriculum completion and passing required course examinations.
          </p>
        </div>
      </div>

      {/* Certificates Roster */}
      {isLoadingCertificates ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto" />
          <p className="text-xs text-gray-400 mt-2 font-semibold">Loading your earned certificates...</p>
        </div>
      ) : certificates.length === 0 && completedCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <Award className="w-14 h-14 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#041c53]">No Certificates Unlocked Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Complete 100% of your enrolled masterclasses to generate blockchain-verifiable digital diplomas.
          </p>
          <div>
            <Link href="/student/courses" className="btn btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5">
              <span>Continue Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(certificates.length > 0 ? certificates : completedCourses).map((item: any) => {
            const certNumber = item.certificateNumber || `FIN2U-CERT-${(item.course?._id || item._id).slice(-6).toUpperCase()}`;
            const verifyCode = item.verificationCode || `F2U-${(item.course?._id || item._id).slice(-8).toUpperCase()}`;
            const courseTitle = item.courseTitle || item.course?.title || 'Masterclass';
            const instructor = item.instructorName || item.course?.instructor?.name || 'Fin2u Mentor';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#041c53] truncate">{courseTitle}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Certified by {instructor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono">
                    ID: {certNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/verify-certificate`}
                      className="text-xs text-gray-500 hover:text-[#041c53] px-2 py-1 flex items-center gap-1 font-medium"
                      title="Verify Certificate"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verify</span>
                    </Link>
                    <button
                      onClick={() =>
                        setSelectedCert({
                          ...item,
                          courseTitle,
                          instructorName: instructor,
                          certificateNumber: certNumber,
                          verificationCode: verifyCode,
                        })
                      }
                      className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VERIFIABLE CERTIFICATE PREVIEW MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 md:p-12 shadow-2xl space-y-6 relative border-8 border-double border-[#041c53]/20 text-center">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff447e]">
                CERTIFICATE OF COMPLETION
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#041c53]">Fin2u Digital Academy</h2>
            </div>

            <p className="text-xs text-gray-500 uppercase tracking-widest">THIS ACKNOWLEDGES THAT</p>

            <h3 className="text-3xl font-extrabold text-[#ff447e] font-serif underline decoration-1 underline-offset-8">
              {selectedCert.studentName || user?.name}
            </h3>

            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              has successfully fulfilled all curriculum lessons, case reviews, and passed the official examination for
            </p>

            <h4 className="text-lg font-bold text-[#041c53]">{selectedCert.courseTitle}</h4>

            <div className="pt-8 border-t border-gray-100 flex items-center justify-between text-left text-xs">
              <div>
                <p className="font-bold text-[#041c53]">{selectedCert.instructorName || 'Certified Mentor'}</p>
                <p className="text-gray-400 text-[10px]">Lead Mentor, Fin2u Academy</p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] text-gray-400">VERIFICATION CODE</p>
                <p className="font-mono font-bold text-[#041c53]">
                  {selectedCert.verificationCode}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <Link
                href={`/verify-certificate`}
                className="btn btn-secondary text-xs py-2.5 px-5 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Credential</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
