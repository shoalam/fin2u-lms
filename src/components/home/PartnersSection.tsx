'use client';

import { Building2, Newspaper } from 'lucide-react';

export default function PartnersSection() {
  const mediaPartners = [
    { name: 'Media Partner 1', logo: 'https://fin2u.net/wp-content/uploads/elementor/thumbs/msg-329965228-24959-pw5n8xla29vggr55r54j5ofzrfwl0xq5a2b6lzk8ow.png' },
    { name: 'Media Partner 2', logo: 'https://fin2u.net/wp-content/uploads/elementor/thumbs/msg-329965228-24958-pw5n75o95jfyj9q04dhwg4knd8nmhioed9y5z670g0.png' },
    { name: 'Media Partner 3', logo: 'https://fin2u.net/wp-content/uploads/elementor/thumbs/msg-329965228-24957-pw5n7zr388l4usib8qhynwzedkjdbtzt5etpc0yeww.png' },
    { name: 'Media Partner 4', logo: 'https://fin2u.net/wp-content/uploads/elementor/thumbs/Untitled-1-pw5n70180j88lly71b2515zvsxff7c20ci193ifdhc.png' },
  ];

  const ecoPartners = [
    'https://fin2u.net/wp-content/uploads/2022/09/b9.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b3.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_12_8999173220-300x62.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_2_8281880341.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_10_3154723360.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b2.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b1.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b7.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b6.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b5.png',
    'https://fin2u.net/wp-content/uploads/2022/09/Asset-2face3.png',
    'https://fin2u.net/wp-content/uploads/2022/09/b8.png',
    'https://fin2u.net/wp-content/uploads/2022/10/b10.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_4_8801320796.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_6_8716234736.png',
    'https://fin2u.net/wp-content/uploads/2024/10/imageedit_8_5147345943-300x64.png',
  ];

  // Duplicate arrays for infinite seamless marquee loop
  const mediaList = [...mediaPartners, ...mediaPartners, ...mediaPartners, ...mediaPartners];
  const ecoList = [...ecoPartners, ...ecoPartners];

  return (
    <section className="py-14 bg-gradient-to-b from-white via-gray-50/50 to-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        
        {/* Media Partners Ticker */}
        <div className="mb-14">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Newspaper size={16} className="text-[#ff447e]" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Featured In & Media Coverage</h3>
          </div>

          <div className="relative overflow-hidden group">
            {/* Gradient Mask edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee flex items-center gap-6 py-2">
              {mediaList.map((p, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-pink-200 transition-all duration-300 group/card flex items-center justify-center shrink-0"
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-10 sm:h-12 w-auto object-contain grayscale opacity-60 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ecosystem Partners Ticker */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Building2 size={16} className="text-[#041c53]" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Trusted Ecosystem & Industry Partners</h3>
          </div>

          <div className="relative overflow-hidden group">
            {/* Gradient Mask edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-reverse flex items-center gap-5 py-2">
              {ecoList.map((logo, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group/card flex items-center justify-center h-16 w-36 sm:w-44 shrink-0"
                >
                  <img
                    src={logo}
                    alt={`Partner ${i + 1}`}
                    className="max-h-9 max-w-full object-contain grayscale opacity-50 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


