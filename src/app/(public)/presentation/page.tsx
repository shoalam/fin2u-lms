'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─── */
type Slide = {
  id: string;
  nav: string;
  badge: string;
  dot: string;
  subtitle: string;
};

type AppFeature = {
  id: string;
  category: 'Learner' | 'Mentor' | 'Admin' | 'Public' | 'Security';
  title: string;
  desc: string;
  route: string;
  status: 'Live & Active' | 'Automated' | 'Integrated';
  icon: string;
  highlights: string[];
  techStack: string[];
};

/* ─── Master Slides ─── */
const SLIDES: Slide[] = [
  { id: 'cover',       nav: 'Cover',                badge: 'Welcome',      dot: '#6366f1', subtitle: 'Fin2U LMS Features & Capabilities Presentation' },
  { id: 'overview',    nav: 'Executive Summary',   badge: 'Overview',     dot: '#8b5cf6', subtitle: 'Unified 3-Portal Ecosystem & Core Value Propositions' },
  { id: 'public-learner',nav: 'Learner Features',   badge: 'For Students', dot: '#3b82f6', subtitle: 'Course Discovery, Video Classroom, Quizzes & Certificates' },
  { id: 'mentor',      nav: 'Mentor Features',      badge: 'For Instructors',dot: '#10b981',subtitle: 'Curriculum Builder, Live Streams & Direct Payouts' },
  { id: 'admin',       nav: 'Admin Features',       badge: 'Governance',   dot: '#f59e0b', subtitle: 'Analytics Dashboard, Moderation Queue & Payouts' },
  { id: 'explorer',    nav: 'Feature Explorer',     badge: 'Full Matrix',  dot: '#ec4899', subtitle: 'Searchable & Filterable Application Features Catalog' },
  { id: 'journey',     nav: 'User Workflows',       badge: 'User Flows',   dot: '#06b6d4', subtitle: 'Step-by-Step Interactive Walkthrough across Roles' },
  { id: 'tech-sec',    nav: 'Tech & Security',      badge: 'Architecture', dot: '#a855f7', subtitle: 'Next.js App Router, Stripe PCI Compliance & RBAC' },
  { id: 'summary',     nav: 'Client Takeaways',     badge: 'Conclusion',   dot: '#6366f1', subtitle: 'Platform Readiness & Demonstration CTA' },
];

/* ─── Comprehensive App Feature Catalog ─── */
const APP_FEATURES: AppFeature[] = [
  /* Public & Learner */
  {
    id: 'f1',
    category: 'Public',
    title: 'Smart Course Catalog & Search',
    desc: 'Real-time keyword search, multi-category chips, difficulty level filters, and instant pricing cards.',
    route: '/courses',
    status: 'Live & Active',
    icon: '🔍',
    highlights: ['Debounced instant search', 'Category & difficulty filtering', 'Course rating distribution', 'Responsive grid view'],
    techStack: ['Next.js Server Components', 'URL State Params'],
  },
  {
    id: 'f2',
    category: 'Public',
    title: 'Dynamic Course Landing & Syllabus',
    desc: 'Rich course preview with expandable syllabus modules, free sample video lessons, and mentor profile.',
    route: '/courses/[slug]',
    status: 'Live & Active',
    icon: '📖',
    highlights: ['Expandable chapter accordion', 'Free video preview modal', 'Instructor bio & reviews', 'Direct enrollment CTA'],
    techStack: ['Dynamic [slug] Routing', 'HTML5 Video Modal'],
  },
  {
    id: 'f3',
    category: 'Learner',
    title: 'Stripe One-Click Checkout',
    desc: 'Secure checkout with Stripe Elements, supporting card payments, coupon codes, and instant enrollment.',
    route: '/checkout',
    status: 'Integrated',
    icon: '💳',
    highlights: ['Stripe PCI-DSS compliance', 'Order summary & coupons', 'Instant webhook enrollment', 'Automated PDF receipt'],
    techStack: ['Stripe SDK', 'Webhooks', 'Transactional Email'],
  },
  {
    id: 'f4',
    category: 'Learner',
    title: 'Personalized Student Dashboard',
    desc: 'Central command center displaying enrolled courses, % progress bars, continue learning shortcuts, and live streams.',
    route: '/student',
    status: 'Live & Active',
    icon: '🎓',
    highlights: ['Progress completion tracking', 'Resume last timestamp button', 'Upcoming webinar calendar', 'Enrolled course grid'],
    techStack: ['Zustand State', 'Role Auth Guard'],
  },
  {
    id: 'f5',
    category: 'Learner',
    title: 'Distraction-Free Video Classroom',
    desc: 'Core learning player with speed controls, collapsible lesson sidebar, personal notes, and lesson Q&A board.',
    route: '/learn/[slug]',
    status: 'Live & Active',
    icon: '🎥',
    highlights: ['Custom video player with speed controls', 'Curriculum checkmarks drawer', 'Timestamped notebook', 'Lesson Q&A discussion tab'],
    techStack: ['HLS Player', 'Local Storage Notes', 'WebSockets'],
  },
  {
    id: 'f6',
    category: 'Learner',
    title: 'Quizzes & Verified Certificates',
    desc: 'Interactive chapter assessments with instant scoring, retakes, and verifiable PDF certificate generation.',
    route: '/student/certificates',
    status: 'Automated',
    icon: '🏆',
    highlights: ['Multi-choice & coding quizzes', 'Minimum pass grade guard', 'Dynamic PDF certificate exporter', 'Public verification hash URL'],
    techStack: ['PDFKit', 'Verification Hash API'],
  },

  /* Mentor / Instructor */
  {
    id: 'f7',
    category: 'Mentor',
    title: 'Instructor Application & Onboarding',
    desc: 'Multi-step application wizard for aspiring mentors to submit resumes, credentials, and video samples.',
    route: '/mentorship-application',
    status: 'Live & Active',
    icon: '👨‍🏫',
    highlights: ['Multi-step application form', 'File upload for CV & certs', 'Specialization tag selection', 'Admin approval queue trigger'],
    techStack: ['React Hook Form', 'Cloud Upload'],
  },
  {
    id: 'f8',
    category: 'Mentor',
    title: 'Mentor Command Center & KPI',
    desc: 'Dashboard for instructors displaying gross earnings, active student counts, course performance, and student feedback.',
    route: '/mentor',
    status: 'Live & Active',
    icon: '📊',
    highlights: ['Real-time revenue metrics', 'Active student count tracker', 'Course publish/unpublish toggle', 'Pending Q&A notifications'],
    techStack: ['Recharts Analytics', 'Auth Role Guard'],
  },
  {
    id: 'f9',
    category: 'Mentor',
    title: 'Drag-and-Drop Course Studio',
    desc: 'Full course builder for structuring sections, uploading video lessons, attaching resources, and setting prices.',
    route: '/mentor/course',
    status: 'Live & Active',
    icon: '🛠',
    highlights: ['Drag-and-drop section reordering', 'Resumable video uploader', 'Rich text lesson editor', 'Pricing & discount manager'],
    techStack: ['dnd-kit', 'Tiptap Rich Text', 'Resumable Uploads'],
  },
  {
    id: 'f10',
    category: 'Mentor',
    title: 'Quiz & Assessment Creator',
    desc: 'Question bank studio for creating single-choice, multiple-choice, and true/false assessments with explanation notes.',
    route: '/mentor/quizzes',
    status: 'Live & Active',
    icon: '📝',
    highlights: ['Single & multi-choice questions', 'Automated grading rules', 'Explanation text boxes', 'Student result analytics'],
    techStack: ['Quiz Engine Schema', 'JSON Formatter'],
  },
  {
    id: 'f11',
    category: 'Mentor',
    title: 'Live Webinars & Community Groups',
    desc: 'Schedule live streaming sessions, manage study groups, send broadcast announcements, and answer direct messages.',
    route: '/mentor/community',
    status: 'Integrated',
    icon: '💬',
    highlights: ['Live stream scheduler (Zoom/WebRTC)', 'Dedicated study group feeds', 'Broadcast announcements to students', '1-on-1 direct messaging inbox'],
    techStack: ['WebSockets', 'WebRTC Video API'],
  },
  {
    id: 'f12',
    category: 'Mentor',
    title: 'Direct Bank Payouts Engine',
    desc: 'Transparent revenue reporting after platform commission split with instant bank withdrawal requests.',
    route: '/mentor/dashboard',
    status: 'Automated',
    icon: '💵',
    highlights: ['Monthly earnings chart', 'Platform commission split calculation', 'Payout request workflow', 'Historical payout logs & PDF export'],
    techStack: ['Stripe Connect', 'Financial Ledger API'],
  },

  /* Admin Governance */
  {
    id: 'f13',
    category: 'Admin',
    title: 'Platform Overview & Revenue KPI',
    desc: 'Real-time monitoring of gross platform revenue, total enrollments, active students, and mentor growth charts.',
    route: '/admin',
    status: 'Live & Active',
    icon: '⚙️',
    highlights: ['System revenue & enrollment metrics', 'Daily active users growth charts', 'Quick admin action shortcuts', 'System health indicators'],
    techStack: ['Recharts', 'Server-side Aggregations'],
  },
  {
    id: 'f14',
    category: 'Admin',
    title: 'Course Moderation Queue',
    desc: 'Audit submitted course drafts, inspect video content, and approve or reject publishing requests.',
    route: '/admin/courses',
    status: 'Live & Active',
    icon: '🛡',
    highlights: ['Submitted course audit queue', 'Content & video previewer', 'Approval / revision request tool', 'Category & tag manager'],
    techStack: ['State Workflow Engine', 'Moderation Logs'],
  },
  {
    id: 'f15',
    category: 'Admin',
    title: 'User & Permission Management',
    desc: 'Manage all student and mentor accounts, adjust user roles (Learner, Mentor, Admin), and suspend violative users.',
    route: '/admin/users',
    status: 'Live & Active',
    icon: '👥',
    highlights: ['User search & role filters', 'Role elevation (Learner ↔ Mentor ↔ Admin)', 'Account suspension controls', 'Activity log timeline'],
    techStack: ['Role-Based Access Control', 'JWT Auth'],
  },
  {
    id: 'f16',
    category: 'Admin',
    title: 'Payout Processing Queue',
    desc: 'Review mentor payout withdrawal requests, verify bank details, and execute payout disbursements.',
    route: '/admin/orders',
    status: 'Automated',
    icon: '🏦',
    highlights: ['Pending payout request queue', 'Bank account verification audit', 'Approve/Reject payout trigger', 'Platform commission rate editor'],
    techStack: ['Stripe Payouts API', 'Financial Audit Ledger'],
  },
];

/* ─── Canvas Particle Background ─── */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; hue: number };
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.35 + 0.05,
        hue: Math.random() * 70 + 210,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const orbs = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, r: 380, c: 'rgba(99,102,241,0.06)' },
        { x: canvas.width * 0.85, y: canvas.height * 0.5, r: 420, c: 'rgba(16,185,129,0.05)' },
        { x: canvas.width * 0.5,  y: canvas.height * 0.85, r: 320, c: 'rgba(59,130,246,0.05)' },
      ];
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},75%,70%,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── Main Presentation Page Component ─── */
export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [featureCategory, setFeatureCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'Learner' | 'Mentor' | 'Admin'>('Learner');

  const total = SLIDES.length;

  const goSlide = useCallback((n: number) => {
    if (n === current) return;
    setDirection(n > current ? 'next' : 'prev');
    setExiting(current);
    setTimeout(() => setExiting(null), 500);
    setCurrent(n);
  }, [current]);

  const next = useCallback(() => { if (current < total - 1) goSlide(current + 1); }, [current, total, goSlide]);
  const prev = useCallback(() => { if (current > 0) goSlide(current - 1); }, [current, goSlide]);

  /* Keyboard listener */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  /* Auto Play Timer */
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      if (current < total - 1) {
        next();
      } else {
        setIsAutoPlay(false);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, current, total, next]);

  const touchStart = useRef(0);

  /* Filtered Features for Matrix Explorer */
  const filteredFeatures = APP_FEATURES.filter(f => {
    const matchesCat = featureCategory === 'All' || f.category === featureCategory;
    const matchesQuery = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getSlideStyle = (idx: number): React.CSSProperties => {
    const isActive  = idx === current;
    const isExiting = idx === exiting;

    let translateX = '0px';
    if (!isActive) {
      if (isExiting) {
        translateX = direction === 'next' ? '-60px' : '60px';
      } else {
        translateX = direction === 'next' ? '60px' : '-60px';
      }
    }

    return {
      position: 'absolute', inset: 0,
      padding: '36px 44px',
      overflowY: 'auto',
      opacity: isActive ? 1 : 0,
      transform: `translate3d(${translateX}, 0, 0) scale(${isActive ? 1 : 0.98})`,
      transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: isActive ? 'auto' : 'none',
      willChange: 'transform, opacity',
    };
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#04040f', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <AnimatedBackground />

      {/* ── Left Sidebar Navigation ── */}
      <aside style={{
        width: 280, flexShrink: 0, position: 'relative', zIndex: 10,
        background: 'rgba(4,4,15,0.92)', backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '0 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>F</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fin2U LMS</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feature Showcase</div>
            </div>
          </div>
        </div>

        {/* Slide Links */}
        <nav style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', padding: '6px 10px 4px' }}>Overview & Setup</div>
          {SLIDES.slice(0, 2).map((s, i) => (
            <SideNavItem key={s.id} slide={s} index={i} current={current} onClick={() => goSlide(i)} />
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', padding: '14px 10px 4px' }}>Features by Portal</div>
          {SLIDES.slice(2, 5).map((s, i) => (
            <SideNavItem key={s.id} slide={s} index={i + 2} current={current} onClick={() => goSlide(i + 2)} />
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', padding: '14px 10px 4px' }}>Deep Explorer & Workflows</div>
          {SLIDES.slice(5).map((s, i) => (
            <SideNavItem key={s.id} slide={s} index={i + 5} current={current} onClick={() => goSlide(i + 5)} />
          ))}
        </nav>

        {/* Route Index Callout */}
        <div style={{ margin: '0 14px', padding: '12px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>🗺 Route Architecture</div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>Complete technical index of all 65+ routes.</div>
          <a href="/routes-presentation" style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Open Route Index →
          </a>
        </div>
      </aside>

      {/* ── Main Viewport ── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* Top Control Bar */}
        <div style={{
          height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 36px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(4,4,15,0.7)', backdropFilter: 'blur(14px)',
        }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginRight: 10 }}>{SLIDES[current].nav}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>— {SLIDES[current].subtitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setIsAutoPlay(!isAutoPlay)}
              style={{ padding: '6px 12px', borderRadius: 8, background: isAutoPlay ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isAutoPlay ? '#10b981' : 'rgba(255,255,255,0.08)'}`, color: isAutoPlay ? '#34d399' : '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {isAutoPlay ? '⏸ Pause' : '▶ Presenter Mode (6s)'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <CtrlBtn onClick={prev} disabled={current === 0} label="←" />
              <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 44, textAlign: 'center', fontWeight: 600 }}>{current + 1} / {total}</span>
              <CtrlBtn onClick={next} disabled={current === total - 1} label="→" />
            </div>
          </div>
        </div>

        {/* Slide Content Frame */}
        <div
          style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
          onTouchStart={e => { touchStart.current = e.changedTouches[0].screenX; }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].screenX - touchStart.current;
            if (dx < -50) next();
            if (dx > 50) prev();
          }}
        >
          {/* ── SLIDE 0: Cover ── */}
          <div style={getSlideStyle(0)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <div style={{ textAlign: 'center', maxWidth: 760 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '6px 18px', borderRadius: 100, marginBottom: 24 }}>
                  🎓 Full Platform Features Presentation
                </div>
                <h1 style={{ fontSize: 'clamp(38px,5vw,58px)', fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(135deg,#f1f5f9 30%,#c4b5fd 70%,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
                  Fin2U LMS<br />Application Feature Showcase
                </h1>
                <p style={{ fontSize: 16.5, color: '#94a3b8', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px' }}>
                  A client-ready walkthrough demonstrating every feature of Fin2U Learning Management System — across Public Discovery, Student Learning, Mentor Studio, and Admin Governance.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
                  {[
                    { count: '16+', label: 'Core App Features', color: '#818cf8' },
                    { count: '3', label: 'Dedicated Portals', color: '#a78bfa' },
                    { count: '100%', label: 'RBAC Security', color: '#10b981' },
                    { count: 'Next.js 16', label: 'App Router DX', color: '#3b82f6' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.count}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                  <button onClick={() => goSlide(1)} style={{ padding: '13px 36px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    Explore Application Features →
                  </button>
                  <a href="/routes-presentation" style={{ padding: '13px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    View Technical Route Map
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── SLIDE 1: Executive Overview ── */}
          <div style={getSlideStyle(1)}>
            <SlideHeader badge="Executive Overview" title="Unified 3-Portal Architecture" desc="Fin2U LMS provides three distinct user experience portals built on a shared backend." badgeColor="#8b5cf6" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
              {[
                {
                  portal: '1. Student Experience',
                  icon: '🎓',
                  color: '#3b82f6',
                  bg: 'rgba(59,130,246,0.06)',
                  border: 'rgba(59,130,246,0.2)',
                  desc: 'Designed for focus, retention, & progress tracking.',
                  feats: ['Smart course search & filtering', 'Stripe Elements secure payment', 'Distraction-free video classroom player', 'Automated PDF verified certificates'],
                },
                {
                  portal: '2. Mentor Studio',
                  icon: '👨‍🏫',
                  color: '#10b981',
                  bg: 'rgba(16,185,129,0.06)',
                  border: 'rgba(16,185,129,0.2)',
                  desc: 'Built for course creation & revenue scaling.',
                  feats: ['Drag-and-drop course curriculum studio', 'Assessment & quiz question bank builder', 'Live stream scheduling & study groups', 'Transparent financial ledger & bank payouts'],
                },
                {
                  portal: '3. Admin Governance',
                  icon: '⚙️',
                  color: '#f59e0b',
                  bg: 'rgba(245,158,11,0.06)',
                  border: 'rgba(245,158,11,0.2)',
                  desc: 'Full control over content, users & finances.',
                  feats: ['Platform KPI & revenue analytics', 'Course moderation & approval queue', 'Role & access permissions manager', 'Payout withdrawal processing queue'],
                },
              ].map(card => (
                <div key={card.portal} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: card.color, marginBottom: 6 }}>{card.portal}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>{card.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {card.feats.map(f => (
                      <div key={f} style={{ fontSize: 12, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: card.color, fontSize: 14 }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SLIDE 2: Learner Features ── */}
          <div style={getSlideStyle(2)}>
            <SlideHeader badge="For Students" title="Learner Features & Classroom Player" desc="How students discover courses, enroll via Stripe, learn in an immersive player, and earn certificates." badgeColor="#3b82f6" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {APP_FEATURES.filter(f => f.category === 'Learner' || f.category === 'Public').slice(0, 6).map(f => (
                <FeatureCard key={f.id} feature={f} />
              ))}
            </div>
          </div>

          {/* ── SLIDE 3: Mentor Features ── */}
          <div style={getSlideStyle(3)}>
            <SlideHeader badge="For Instructors" title="Mentor Studio, Quizzes & Payouts" desc="Tools provided to instructors to build courses, engage students, and withdraw earnings." badgeColor="#10b981" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {APP_FEATURES.filter(f => f.category === 'Mentor').map(f => (
                <FeatureCard key={f.id} feature={f} />
              ))}
            </div>
          </div>

          {/* ── SLIDE 4: Admin Features ── */}
          <div style={getSlideStyle(4)}>
            <SlideHeader badge="Governance" title="Admin Governance & Operations" desc="How administrators oversee revenue, moderate courses, manage users, and process payouts." badgeColor="#f59e0b" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {APP_FEATURES.filter(f => f.category === 'Admin').map(f => (
                <FeatureCard key={f.id} feature={f} />
              ))}
            </div>
          </div>

          {/* ── SLIDE 5: Searchable Feature Explorer Matrix ── */}
          <div style={getSlideStyle(5)}>
            <SlideHeader badge="Full Matrix" title="Application Feature Explorer" desc="Filter and search through all 16+ core application features built into Fin2U LMS." badgeColor="#ec4899" />

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search features (e.g. Stripe, Video Player, Quiz, Payouts)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {['All', 'Public', 'Learner', 'Mentor', 'Admin'].map(cat => (
                  <button key={cat} onClick={() => setFeatureCategory(cat)}
                    style={{ padding: '8px 14px', borderRadius: 8, background: featureCategory === cat ? '#6366f1' : 'rgba(255,255,255,0.04)', border: `1px solid ${featureCategory === cat ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, color: featureCategory === cat ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
              {filteredFeatures.map(f => (
                <FeatureCard key={f.id} feature={f} compact />
              ))}
            </div>
          </div>

          {/* ── SLIDE 6: Interactive Workflow Walkthrough ── */}
          <div style={getSlideStyle(6)}>
            <SlideHeader badge="User Flows" title="Step-by-Step Interactive Workflow Walkthrough" desc="Select a role below to walk through the exact user flow sequence." badgeColor="#06b6d4" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {(['Learner', 'Mentor', 'Admin'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveWorkflowTab(tab)}
                  style={{ padding: '10px 24px', borderRadius: 10, background: activeWorkflowTab === tab ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeWorkflowTab === tab ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`, color: activeWorkflowTab === tab ? '#06b6d4' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {tab === 'Learner' ? '🎓 Learner Flow' : tab === 'Mentor' ? '👨‍🏫 Mentor Flow' : '⚙️ Admin Flow'}
                </button>
              ))}
            </div>

            {activeWorkflowTab === 'Learner' && (
              <WorkflowSteps steps={[
                { num: '01', title: 'Course Search & Catalog', desc: 'Visitor filters course catalog by domain & rating.', route: '/courses' },
                { num: '02', title: 'Syllabus & Video Preview', desc: 'Inspects curriculum breakdown & watches free sample lesson.', route: '/courses/[slug]' },
                { num: '03', title: 'Stripe One-Click Payment', desc: 'Enrolls securely using Stripe Elements credit card gateway.', route: '/checkout' },
                { num: '04', title: 'Student Dashboard', desc: 'Tracks active progress & resumes video lesson timestamp.', route: '/student' },
                { num: '05', title: 'Interactive Video Classroom', desc: 'Watches video lessons, takes notes, and posts Q&A questions.', route: '/learn/[slug]' },
                { num: '06', title: 'Quiz & Certificate Graduation', desc: 'Passes final module quiz & generates verified PDF certificate.', route: '/student/certificates' },
              ]} accent="#06b6d4" />
            )}

            {activeWorkflowTab === 'Mentor' && (
              <WorkflowSteps steps={[
                { num: '01', title: 'Instructor Application', desc: 'Expert submits CV, credentials, and video portfolio for approval.', route: '/mentorship-application' },
                { num: '02', title: 'Mentor Portal Access', desc: 'Accesses mentor command center upon admin verification.', route: '/mentor' },
                { num: '03', title: 'Curriculum Builder Studio', desc: 'Drags & drops modules, uploads videos, & sets pricing.', route: '/mentor/course' },
                { num: '04', title: 'Quiz Creator', desc: 'Builds question bank assessments & sets passing grade rules.', route: '/mentor/quizzes' },
                { num: '05', title: 'Community & Live Streams', desc: 'Hosts live webinars & moderates student study groups.', route: '/mentor/community' },
                { num: '06', title: 'Direct Bank Payouts', desc: 'Monitors net revenue split & requests direct bank payouts.', route: '/mentor/dashboard' },
              ]} accent="#10b981" />
            )}

            {activeWorkflowTab === 'Admin' && (
              <WorkflowSteps steps={[
                { num: '01', title: 'Platform Control Panel', desc: 'Monitors real-time gross revenue, DAU, and course sales.', route: '/admin' },
                { num: '02', title: 'Course Audit & Moderation', desc: 'Audits submitted mentor courses & approves publishing.', route: '/admin/courses' },
                { num: '03', title: 'User Role Governance', desc: 'Manages user accounts, elevates roles, & suspends violators.', route: '/admin/users' },
                { num: '04', title: 'Financial Payouts Queue', desc: 'Verifies mentor payout requests & executes bank transfers.', route: '/admin/orders' },
              ]} accent="#f59e0b" />
            )}
          </div>

          {/* ── SLIDE 7: Security & Tech Architecture ── */}
          <div style={getSlideStyle(7)}>
            <SlideHeader badge="Architecture" title="Security, Technology & Production Standards" desc="The core technical foundations ensuring performance, scalability, and security." badgeColor="#a855f7" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { title: 'Next.js 16 App Router', desc: 'File-system routing with Server Components for fast initial page load and SEO.', tags: ['SSR', 'Server Components'] },
                { title: 'Stripe PCI-DSS Payments', desc: 'Bank-grade security handling card checkout, webhooks, and automatic payouts.', tags: ['Stripe SDK', 'PCI Compliant'] },
                { title: 'Role-Based Access Control', desc: 'Server middleware guards ensuring users only access authorized portals.', tags: ['RBAC', 'Auth Guards'] },
                { title: 'Verifiable PDF Certificates', desc: 'Unique QR verification code & hash generated for every course completion.', tags: ['PDF Engine', 'Hash Verification'] },
                { title: 'Real-Time WebSockets', desc: 'Live Q&A notifications, chat, and stream updates delivered instantly.', tags: ['WebSockets', 'Socket.io'] },
                { title: 'TypeScript Throughout', desc: 'Full-stack type safety across components, props, API responses, and database schemas.', tags: ['TypeScript', 'Clean DX'] },
              ].map(box => (
                <div key={box.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', marginBottom: 6 }}>{box.title}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{box.desc}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {box.tags.map(t => (
                      <span key={t} style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(168,85,247,0.15)', color: '#e9d5ff' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SLIDE 8: Summary & CTA ── */}
          <div style={getSlideStyle(8)}>
            <SlideHeader badge="Conclusion" title="Client Presentation Summary" desc="Summary of application feature completeness and readiness for demonstration." badgeColor="#6366f1" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { count: '100%', title: 'Feature Complete', desc: 'All core learning & teaching modules fully operational.' },
                { count: '3', title: 'Role Portals', desc: 'Dedicated portals for Students, Mentors, and Admins.' },
                { count: '65+', title: 'App Routes', desc: 'Organized Next.js App Router route structure.' },
                { count: 'Ready', title: 'Client Demo', desc: 'Fully built and ready for live demonstration.' },
              ].map(s => (
                <div key={s.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#a5b4fc', marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: 24, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#a5b4fc', marginBottom: 6 }}>Ready for Live Demonstration</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Explore the live application or technical route architecture below:</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <a href="/" style={{ padding: '10px 22px', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Go to Homepage →</a>
                <a href="/courses" style={{ padding: '10px 22px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Explore Catalog →</a>
                <a href="/routes-presentation" style={{ padding: '10px 22px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Route Architecture →</a>
              </div>
            </div>
          </div>

        </div>{/* /slide container */}
      </main>

      {/* Bottom Progress Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 280, right: 0, height: 4, background: 'rgba(255,255,255,0.06)', zIndex: 100 }}>
        <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#3b82f6,#10b981,#f59e0b)', transition: 'width 0.4s ease', width: `${((current + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */
function FeatureCard({ feature, compact }: { feature: AppFeature; compact?: boolean }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: compact ? '14px 16px' : '20px 22px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
    }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: compact ? 20 : 24 }}>{feature.icon}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
            {feature.status}
          </span>
        </div>
        <div style={{ fontSize: compact ? 13.5 : 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{feature.title}</div>
        <div style={{ fontSize: compact ? 11.5 : 12.5, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{feature.desc}</div>

        {!compact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {feature.highlights.map(h => (
              <div key={h} style={{ fontSize: 11.5, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#818cf8' }}>✓</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#818cf8' }}>🔗 {feature.route}</span>
        <span style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>{feature.category}</span>
      </div>
    </div>
  );
}

function WorkflowSteps({ steps, accent }: { steps: { num: string; title: string; desc: string; route: string }[]; accent: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {steps.map(s => (
        <div key={s.num} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}30`, borderRadius: 14, padding: 18, position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: accent, marginBottom: 6 }}>STEP {s.num}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{s.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{s.desc}</div>
          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: accent }}>🔗 {s.route}</div>
        </div>
      ))}
    </div>
  );
}

function SlideHeader({ badge, title, desc, badgeColor = '#818cf8' }: { badge: string; title: string; desc: string; badgeColor?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '5px 14px', borderRadius: 100, marginBottom: 12,
        background: `${badgeColor}18`, border: `1px solid ${badgeColor}40`, color: badgeColor,
      }}>
        ✦ {badge}
      </div>
      <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 34px)', fontWeight: 800, marginBottom: 6, color: '#f1f5f9', lineHeight: 1.2 }}>{title}</h2>
      <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, maxWidth: 680 }}>{desc}</p>
    </div>
  );
}

function SideNavItem({ slide, index, current, onClick }: { slide: Slide; index: number; current: number; onClick: () => void }) {
  const isActive = index === current;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: `1px solid ${isActive ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
      fontSize: 13, fontWeight: 500,
      color: isActive ? '#f1f5f9' : '#94a3b8',
    }}
    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.color = '#f1f5f9'; }}}
    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: slide.dot, flexShrink: 0 }} />
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.nav}</span>
    </div>
  );
}

function CtrlBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 32, height: 32, borderRadius: 6,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      color: disabled ? '#334155' : '#94a3b8', cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}
