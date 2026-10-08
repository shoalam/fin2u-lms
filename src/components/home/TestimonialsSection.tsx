'use client';

import { Star, Quote, CheckCircle2, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Testimonials Data ─────────────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Ken Chong',
    role: 'SME Business Owner',
    company: 'Chong Logistics Sdn Bhd',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    content:
      'The PDPA Compliance course gave our company exact actionable checklists. Rather than theoretical jargon, we received direct answers from industry mentors in the community group.',
    rating: 5,
    course: 'PDPA Compliance Masterclass',
  },
  {
    name: 'Melissa Wong',
    role: 'Corporate Secretary',
    company: 'InnoCorp Solutions',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    content:
      'Fin2u Academy sets a new standard for Malaysian professional upskilling. The quizzes after each module solidified my practical understanding of Companies Act regulations.',
    rating: 5,
    course: 'Companies Act 2016 Essentials',
  },
  {
    name: 'Ahmad Faiz',
    role: 'Digital Strategist & Consultant',
    company: 'Faiz Media Agency',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    content:
      'The SEO monetization course helped me triple organic inbound leads within 3 months. Learning directly from mentors who manage real Malaysian accounts makes a huge difference.',
    rating: 5,
    course: 'SEO & Content Monetization',
  },
  {
    name: 'Sarah Lim',
    role: 'HR Manager',
    company: 'TechBridge Corp',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    content:
      'The employment law module was incredibly practical. I could immediately apply what I learned to our HR policies. The mentor community was super active and responsive.',
    rating: 5,
    course: 'Employment Law for HR Professionals',
  },
  {
    name: 'David Tan',
    role: 'Tax Consultant',
    company: 'TaxPro Advisory',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    content:
      'The GST & SST masterclass is a goldmine for Malaysian tax professionals. The case studies were realistic and the peer discussions helped clarify grey areas.',
    rating: 5,
    course: 'GST & SST Masterclass',
  },
  {
    name: 'Rachel Tan',
    role: 'Senior Financial Analyst',
    company: 'Apex Capital Group',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    content:
      'The financial modeling masterclass completely transformed our investment pitch decks. The step-by-step Excel models provided in the course saved us hundreds of hours.',
    rating: 5,
    course: 'Corporate Financial Modeling',
  },
];

/* Create triple set for seamless infinite scrolling */
const displayList = [...testimonials, ...testimonials, ...testimonials];

/* ─── Testimonial Card Component ────────────────────────────────────────── */
function TestimonialCard({ item }: { item: (typeof testimonials)[0] }) {
  return (
    <div className="relative flex flex-col justify-between rounded-3xl p-7 bg-white border border-slate-200/90 hover:border-[#ff447e]/40 hover:shadow-lg transition-all duration-300 h-full group">
      <Quote
        className="absolute top-5 right-5 w-10 h-10 text-slate-100 group-hover:text-pink-100 pointer-events-none transition-colors duration-300"
      />
      <div>
        {/* Rating & Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-xs font-bold text-slate-700 ml-1.5">5.0</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} /> Verified Learner
          </span>
        </div>

        {/* Course Badge */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#ff447e] mb-3">{item.course}</p>

        {/* Content */}
        <p className="text-sm leading-relaxed italic text-slate-600 mb-6">
          &ldquo;{item.content}&rdquo;
        </p>
      </div>

      {/* Author Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <img
          src={item.avatar}
          alt={item.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-xs group-hover:border-pink-200 transition-colors duration-300"
        />
        <div>
          <h4 className="text-sm font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors duration-200">
            {item.name}
          </h4>
          <p className="text-xs font-medium text-slate-500">
            {item.role} &middot; <span className="text-slate-700">{item.company}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Section Component ────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const totalOriginal = testimonials.length;
  // Start in the middle chunk so looping left or right is completely seamless
  const [currentIndex, setCurrentIndex] = useState(totalOriginal);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);
  const isSlidingRef = useRef(false);

  useEffect(() => {
    const updateVisibleCards = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setVisibleCards(1);
        } else if (window.innerWidth < 1024) {
          setVisibleCards(2);
        } else {
          setVisibleCards(3);
        }
      }
    };
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  /* Navigation Handler */
  const handleNext = useCallback(() => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      isSlidingRef.current = false;
    }, 450);
  }, []);

  const handlePrev = useCallback(() => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isSlidingRef.current = false;
    }, 450);
  }, []);

  const handleDotClick = (index: number) => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    // Move to corresponding index in the middle chunk
    setCurrentIndex(totalOriginal + index);
    setTimeout(() => {
      isSlidingRef.current = false;
    }, 450);
  };

  /* Seamless wrapping logic when reaching bounds of the cloned array */
  useEffect(() => {
    if (currentIndex >= totalOriginal * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalOriginal);
      }, 450);
      return () => clearTimeout(timer);
    }
    if (currentIndex < totalOriginal) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalOriginal * 2 - 1);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalOriginal]);

  /* Autoplay with hover pause */
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, handleNext]);

  /* Active dot calculation (0-based within original items) */
  const activeDot = ((currentIndex % totalOriginal) + totalOriginal) % totalOriginal;

  /*
    Responsive Slide Width Math:
    - Mobile:  1 card per view (100% per card)
    - Tablet:  2 cards per view (50% per card)
    - Desktop: 3 cards per view (33.3333% per card)
  */
  const totalItems = displayList.length;
  const transformPercent = (currentIndex / totalItems) * 100;

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff447e]/10 text-[#ff447e] text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff447e]/20">
            <Quote className="w-3.5 h-3.5" />
            <span>Learner Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#041c53] tracking-tight leading-tight">
            Trusted by 5,000+ Learners &amp; Leaders
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base lg:text-lg font-normal">
            See how Malaysian entrepreneurs, consultants, and professionals grow through Fin2u Academy.
          </p>
        </div>

        {/* Slider Container */}
        <div
          className="relative px-0 sm:px-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Overflow Clip */}
          <div className="overflow-hidden rounded-2xl py-4">

            {/* Slider Track */}
            <div
              className="flex"
              style={{
                width: `${(totalItems / visibleCards) * 100}%`,
                transform: `translateX(-${transformPercent}%)`,
                transition: isTransitioning ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              }}
            >
              {displayList.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 sm:px-3 flex-shrink-0"
                  style={{ width: `${100 / totalItems}%` }}
                >
                  <TestimonialCard item={item} />
                </div>
              ))}
            </div>

          </div>

          {/* Previous Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#041c53] hover:bg-[#ff447e] hover:text-white hover:border-[#ff447e] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#041c53] hover:bg-[#ff447e] hover:text-white hover:border-[#ff447e] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-9">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to review ${idx + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeDot
                  ? 'w-8 h-2.5 bg-[#ff447e] shadow-xs'
                  : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Trust Banner Footer */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff447e]/10 border border-[#ff447e]/20 text-[#ff447e] flex items-center justify-center">
              <ThumbsUp size={22} />
            </div>
            <div>
              <p className="text-base font-extrabold text-[#041c53]">Ready to upgrade your skillset?</p>
              <p className="text-xs text-slate-500">Join over 5,000+ satisfied learners on Fin2u Academy.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
            <span className="text-[#041c53] ml-2 font-extrabold">4.9 / 5.0 Rating</span>
          </div>
        </div>

      </div>
    </section>
  );
}
