'use client';

import React, { useState } from 'react';
import { useVerifyCertificateQuery } from '@/store/api/enrollmentApi';
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifyCertificatePage() {
  const [searchInput, setSearchInput] = useState('');
  const [activeCode, setActiveCode] = useState('');

  const { data: cert, isLoading, isError, error } = useVerifyCertificateQuery(activeCode, {
    skip: !activeCode,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveCode(searchInput.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-pink-50 text-[#ff447e] shadow-sm mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#041c53] tracking-tight">
            Certificate Verification Portal
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Verify the authenticity of digital credentials and certificates issued by Fin2u Academy.
          </p>
        </div>

        {/* Verification Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Certificate Code (e.g. F2U-XXXX-XXXX or FIN2U-CERT-123456)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff447e] transition-colors uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="px-8 py-3.5 bg-[#041c53] hover:bg-[#ff447e] text-white font-bold text-sm rounded-2xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Verify Now</span>
            </button>
          </form>
        </div>

        {/* Result Area */}
        {activeCode && (
          <div className="space-y-6">
            {isLoading && (
              <div className="text-center py-12 text-gray-400">
                <div className="w-8 h-8 border-3 border-[#ff447e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Validating credential on the blockchain/ledger...</p>
              </div>
            )}

            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-red-900">Certificate Not Found</h3>
                <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto">
                  No valid credential was found matching &ldquo;{activeCode}&rdquo;. Please verify the verification code and try again.
                </p>
              </div>
            )}

            {cert && (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/20 shadow-xl overflow-hidden relative">
                {/* Verified Ribbon */}
                <div className="bg-emerald-500 text-white py-2 px-6 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Verified Credential — Fin2u Academy</span>
                </div>

                <div className="p-6 sm:p-10 space-y-8">
                  {/* Title & Metadata */}
                  <div className="text-center space-y-2 border-b border-gray-100 pb-6">
                    <span className="text-[11px] font-extrabold text-[#ff447e] tracking-widest uppercase">
                      Certificate of Completion
                    </span>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-[#041c53]">
                      {cert.courseTitle}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      Certificate ID: {cert.certificateNumber} • Verification Code: {cert.verificationCode}
                    </p>
                  </div>

                  {/* Recipient Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Awarded To</span>
                        <h4 className="text-sm font-bold text-[#041c53]">{cert.studentName}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#ff447e] flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Instructor</span>
                        <h4 className="text-sm font-bold text-[#041c53]">{cert.instructorName || 'Certified Mentor'}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Issue Date</span>
                        <h4 className="text-sm font-bold text-[#041c53]">
                          {new Date(cert.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Course Details Link */}
                  {cert.course && (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white">
                      <div className="flex items-center gap-3">
                        {cert.course.thumbnail && (
                          <img
                            src={cert.course.thumbnail}
                            alt={cert.course.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-[#041c53]">{cert.course.title}</h4>
                          <span className="text-[10px] text-gray-400">{cert.course.category || 'Professional Development'}</span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${cert.course.slug || cert.course._id}`}
                        className="btn btn-secondary text-xs px-3 py-1.5"
                      >
                        View Course
                      </Link>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => window.print()}
                      className="btn btn-primary text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Print / Save Certificate</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        alert('Verification link copied to clipboard!');
                      }}
                      className="btn btn-secondary text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Link</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
