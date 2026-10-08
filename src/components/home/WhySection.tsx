'use client';

import { Clock, BookOpen, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { useGetPublicWebsiteSettingsQuery } from '@/store/api/adminApi';

const defaultFeatures = [
  {
    icon: Clock,
    title: 'Personalized Learning',
    description: 'Learn at your own pace with bite-sized video modules, downloadable checklists, and flexible study schedules tailored for busy professionals.',
    badge: 'Self-Paced',
    points: ['Lifetime Course Access', 'Learn Anywhere, Anytime', 'On-demand Mentorship Q&A'],
  },
  {
    icon: BookOpen,
    title: 'Practical & Applied Skills',
    description: 'Created exclusively by field practitioners. Focus on real Malaysian tax, compliance, marketing, and SME business case studies.',
    badge: 'Industry Standard',
    points: ['Actionable Frameworks', 'Malaysian Market Focused', 'Official Certificates'],
  },
  {
    icon: Users,
    title: 'Active Social Community',
    description: 'Engage directly in dedicated group channels, participate in peer discussions, ask mentors questions, and build lasting industry networks.',
    badge: 'Interactive',
    points: ['Private Member Groups', 'Direct Mentor Access', 'Peer Knowledge Exchange'],
  },
];

export default function WhySection() {
  const { data: settings } = useGetPublicWebsiteSettingsQuery();

  const sectionTitle = (settings as any)?.why?.title || 'Designed for Real Progress & Career Mastery';
  const sectionDescription =
    (settings as any)?.why?.description ||
    'We bridge the gap between traditional theory and real-world execution through social learning and expert guidance.';
  const features = defaultFeatures;

  return (
    <section className="py-20 bg-slate-50/80 relative overflow-hidden">
      {/* Subtle background ambient glows adhering to brand palette */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-[#ff447e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#041c53]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff447e]/10 text-[#ff447e] text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff447e]/20">
            <Sparkles size={14} />
            <span>Why Choose Fin2u</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#041c53] tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 mt-3 text-base sm:text-lg leading-relaxed">
            {sectionDescription}
          </p>
        </div>

        {/* 3 Unified Brand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#ff447e]/40 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Icon row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-[#041c53] text-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-[#ff447e] transition-colors duration-300">
                      <Icon size={26} />
                    </div>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 bg-[#ff447e]/10 text-[#ff447e] rounded-full border border-[#ff447e]/20">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#041c53] mb-3 group-hover:text-[#ff447e] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm mb-6">
                    {f.description}
                  </p>
                </div>

                {/* Key Points */}
                <div className="pt-5 border-t border-slate-100 space-y-2.5">
                  {f.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                      <CheckCircle2 size={16} className="text-[#ff447e] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
