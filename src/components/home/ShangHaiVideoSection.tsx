'use client';

import { Award, CheckCircle2, Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function ShangHaiVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-[#041c53] via-[#082467] to-[#041c53] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 right-10 w-96 h-96 bg-[#ff447e]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold tracking-widest uppercase mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span>NATIONAL MEDIA SPOTLIGHT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ShangHai Business Feature
          </h2>
          <p className="mt-3 text-gray-300 text-base sm:text-lg leading-relaxed font-normal">
            Founder Alex Yeoh shares how Fin2u Academy is transforming professional upskilling across Malaysia through social learning & active mentorship.
          </p>
        </div>

        {/* Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 shadow-2xl">
          
          {/* Video Container */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/15 group">
              <video
                src="https://filedn.com/lIEAGyJWO7qJsTa4CrRsiaz/CEO%20Message/ShangHai%20x%20Alex%20Yeoh.mp4"
                poster="https://filedn.com/lIEAGyJWO7qJsTa4CrRsiaz/CEO%20Message/pic1a.jpg"
                className="w-full h-full object-cover"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                preload="metadata"
                playsInline
              />

              {!isPlaying && (
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#ff447e] animate-ping" />
                  <span>Exclusive Interview with Alex Yeoh</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Copy & Features */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff447e]">
                PRESS INTERVIEW
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 leading-tight">
                Transforming Online Education in Malaysia
              </h3>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed italic border-l-2 border-[#ff447e] pl-4">
              "We built Fin2u Academy to eliminate the isolation of e-learning. Students interact directly with certified practitioners, engage in specialized peer channels, and get industry certificates."
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                'Practical skills tailored for Malaysian tax, compliance & SME growth',
                'Dedicated group channels & peer mentorship network',
                'Earn verifiable digital certificates for career advancement',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ff447e]/20 text-[#ff447e] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-200 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="https://fin2u.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-[#ff447e] transition-colors"
              >
                <span>Read article on ShangHai Media</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

