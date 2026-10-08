'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─── */
type RouteItem = {
  path: string;
  label: string;
  desc: string;
  tags: string[];
};

type Slide = {
  id: string;
  nav: string;
  count?: string;
  dot: string;
};

/* ─── Data ─── */
const SLIDES: Slide[] = [
  { id: 'cover',     nav: 'Cover',             dot: '#6366f1' },
  { id: 'overview',  nav: 'Platform Overview',  dot: '#8b5cf6' },
  { id: 'arch',      nav: 'Architecture Map',   dot: '#c084fc' },
  { id: 'public',    nav: 'Public Routes',      dot: '#6366f1', count: '15' },
  { id: 'auth',      nav: 'Auth Routes',        dot: '#8b5cf6', count: '6'  },
  { id: 'admin',     nav: 'Admin Routes',       dot: '#f59e0b', count: '22' },
  { id: 'mentor',    nav: 'Mentor Routes',      dot: '#10b981', count: '12' },
  { id: 'student',   nav: 'Student Routes',     dot: '#3b82f6', count: '10' },
  { id: 'summary',   nav: 'Summary',            dot: '#ec4899' },
];

const PUBLIC_ROUTES: RouteItem[] = [
  { path: '/', label: 'Home Page', desc: 'Landing page with platform hero, featured courses, testimonials, and CTA sections.', tags: ['SEO', 'Marketing'] },
  { path: '/courses', label: 'Course Catalog', desc: 'Browse all available courses with search, filter, and category navigation.', tags: ['Public', 'Search'] },
  { path: '/courses/[slug]', label: 'Course Detail Page', desc: 'Individual course landing — curriculum, instructor, reviews, and enrollment CTA.', tags: ['Dynamic', 'SEO'] },
  { path: '/groups', label: 'Study Groups', desc: 'Public listing of all community study groups available to join.', tags: ['Community'] },
  { path: '/groups/[slug]', label: 'Group Detail', desc: 'Individual study group page with members, discussions, and join options.', tags: ['Dynamic'] },
  { path: '/mentors-portal', label: 'Mentors Portal', desc: 'Public-facing mentors directory — discover expert instructors and their specializations.', tags: ['Directory'] },
  { path: '/mentorship-application', label: 'Become a Mentor', desc: 'Application form for users who want to become instructors on the platform.', tags: ['Form', 'Onboarding'] },
  { path: '/members', label: 'Member Directory', desc: 'Community member listing — explore the Fin2U learner community.', tags: ['Community'] },
  { path: '/messages', label: 'Messages', desc: 'Platform messaging system for communication between users.', tags: ['Messaging'] },
  { path: '/profile', label: 'User Profile', desc: 'Public user profile page — bio, courses, achievements, and social links.', tags: ['Profile'] },
  { path: '/dashboard', label: 'General Dashboard', desc: 'Shared dashboard landing with role-based redirects to the appropriate portal.', tags: ['Redirect'] },
  { path: '/checkout', label: 'Checkout', desc: 'Course purchase checkout flow with payment gateway integration.', tags: ['Payment'] },
  { path: '/verify-certificate', label: 'Certificate Verification', desc: 'Public tool to verify the authenticity of a Fin2U completion certificate.', tags: ['Public Tool'] },
  { path: '/support', label: 'Support Center', desc: 'Help center with FAQs, ticket submission, and platform support resources.', tags: ['Support'] },
  { path: '/privacy-policy & /terms-of-service', label: 'Legal Pages', desc: 'Platform legal documentation — privacy policy and terms of service.', tags: ['Legal'] },
];

const AUTH_ROUTES: RouteItem[] = [
  { path: '/login', label: 'Login Page', desc: 'Email/password authentication with "remember me" and social login options.', tags: ['Auth', 'Email'] },
  { path: '/sign-in', label: 'Sign In (OAuth)', desc: 'OAuth-based sign-in flow — Google, GitHub, and other social providers.', tags: ['OAuth', 'Social'] },
  { path: '/register', label: 'Registration', desc: 'New user account creation with full profile setup and role selection.', tags: ['Onboarding'] },
  { path: '/verify-email', label: 'Email Verification', desc: 'Email OTP/link verification step after registration to activate the account.', tags: ['Security'] },
  { path: '/forgot-password', label: 'Forgot Password', desc: 'Password recovery — enter email to receive a secure reset link.', tags: ['Recovery'] },
  { path: '/reset-password', label: 'Reset Password', desc: 'Secure password reset form accessed via the recovery email link with token validation.', tags: ['Security', 'Token'] },
];

const ADMIN_ROUTES: RouteItem[] = [
  { path: '/admin', label: 'Admin Dashboard', desc: 'Comprehensive analytics overview — revenue, enrollments, active users, and key metrics.', tags: ['Dashboard', 'Analytics'] },
  { path: '/admin/courses', label: 'Course Management', desc: 'Full CRUD for all courses — review, approve, suspend, and manage platform-wide.', tags: ['CRUD', 'Moderation'] },
  { path: '/admin/course', label: 'Individual Course View', desc: 'Deep dive — enrollments, revenue, reviews, and content audit.', tags: ['Detail'] },
  { path: '/admin/students', label: 'Student Management', desc: 'View, filter, and manage all student accounts — status, enrollments, activity logs.', tags: ['Users'] },
  { path: '/admin/student', label: 'Student Detail', desc: 'Individual student profile — purchase history, progress, quiz scores, and certificates.', tags: ['Detail'] },
  { path: '/admin/mentors', label: 'Mentor Management', desc: 'Manage all mentor accounts — approve applications, view payouts, monitor performance.', tags: ['Mentors', 'Payouts'] },
  { path: '/admin/mentor', label: 'Mentor Detail', desc: 'Individual mentor profile — courses, student count, revenue, and account controls.', tags: ['Detail'] },
  { path: '/admin/orders', label: 'Orders & Payments', desc: 'Full transaction history — course orders, refund management, and payment status.', tags: ['Finance', 'Payments'] },
  { path: '/admin/enrollments', label: 'Enrollment Management', desc: 'Platform-wide enrollment records — manual enrollment, bulk actions, status management.', tags: ['Enrollment'] },
  { path: '/admin/enrollment', label: 'Enrollment Detail', desc: 'View individual enrollment record with student, course, and payment info.', tags: ['Detail'] },
  { path: '/admin/groups', label: 'Group Management', desc: 'Manage all study groups — create, moderate, and delete community groups.', tags: ['Community'] },
  { path: '/admin/group', label: 'Group Detail', desc: 'Individual group admin view with member list and activity controls.', tags: ['Detail'] },
  { path: '/admin/users', label: 'User Management', desc: 'All platform users with role assignment and account controls.', tags: ['Users', 'Roles'] },
  { path: '/admin/users/[id]', label: 'User Detail', desc: 'Individual user profile management — permissions, activity, and account status.', tags: ['Dynamic'] },
  { path: '/admin/reports', label: 'Reports & Analytics', desc: 'Advanced reporting — revenue charts, growth metrics, course performance, and export.', tags: ['Analytics', 'Export'] },
  { path: '/admin/messages', label: 'Platform Messages', desc: 'Admin messaging center — broadcast announcements and manage communications.', tags: ['Messaging'] },
  { path: '/admin/support', label: 'Support Management', desc: 'Handle support tickets, respond to user queries, and manage helpdesk operations.', tags: ['Helpdesk'] },
  { path: '/admin/settings', label: 'Platform Settings', desc: 'Global platform configuration — general settings, branding, and integrations.', tags: ['Config'] },
  { path: '/admin/settings/payment', label: 'Payment Settings', desc: 'Configure payment gateways, commission rates, payout schedules, and fees.', tags: ['Payment'] },
  { path: '/admin/settings/email', label: 'Email Settings', desc: 'SMTP configuration and transactional email template management.', tags: ['Email', 'SMTP'] },
  { path: '/admin/website', label: 'Website Management', desc: 'CMS-style content management for public-facing website — hero, banners, pages.', tags: ['CMS'] },
  { path: '/admin/profile', label: 'Admin Profile', desc: 'Admin account management — personal info, password change, and security settings.', tags: ['Account'] },
];

const MENTOR_ROUTES: RouteItem[] = [
  { path: '/mentor', label: 'Mentor Dashboard', desc: 'Earnings overview, student counts, course performance metrics, and activity feed.', tags: ['Dashboard', 'Analytics'] },
  { path: '/mentor/courses', label: 'My Courses', desc: 'All courses created by the mentor — drafts, published, and archived with quick actions.', tags: ['Courses'] },
  { path: '/mentor/course', label: 'Course Editor', desc: 'Full course creation/editing — curriculum builder, video uploads, and pricing.', tags: ['Editor', 'Content'] },
  { path: '/mentor/dashboard', label: 'Analytics Dashboard', desc: 'Detailed analytics — enrollment trends, video watch time, quiz performance, and revenue.', tags: ['Analytics'] },
  { path: '/mentor/students', label: 'My Students', desc: 'View all enrolled students across courses — progress tracking and individual details.', tags: ['Students'] },
  { path: '/mentor/student', label: 'Student Detail', desc: 'Individual student view — progress per lesson, quiz scores, and completion status.', tags: ['Detail'] },
  { path: '/mentor/quizzes', label: 'Quiz Management', desc: 'Create and manage quizzes — question banks, MCQs, grading settings, and results.', tags: ['Quizzes', 'Assessment'] },
  { path: '/mentor/community', label: 'Community / Groups', desc: "Manage mentor's study groups — posts, member moderation, and announcements.", tags: ['Community'] },
  { path: '/mentor/messages', label: 'Messages', desc: 'Direct messaging with students and platform team communications.', tags: ['Messaging'] },
  { path: '/mentor/profile', label: 'Mentor Profile', desc: 'Public mentor profile editor — bio, expertise, social links, payout info, and avatar.', tags: ['Profile'] },
];

const STUDENT_ROUTES: RouteItem[] = [
  { path: '/student', label: 'Student Dashboard', desc: 'Personalized home — enrolled courses, recent activity, progress overview, and recommendations.', tags: ['Dashboard'] },
  { path: '/student/courses', label: 'My Enrolled Courses', desc: 'All courses the student is enrolled in — completion status and continue learning CTA.', tags: ['Courses'] },
  { path: '/learn/[slug]', label: 'Course Learning Page', desc: 'The core learning experience — video player, transcript, notes, lesson navigation, and Q&A.', tags: ['Video', 'Core'] },
  { path: '/student/progress', label: 'Progress Tracker', desc: 'Visual progress dashboard — completion percentages, lesson streaks, and learning goals.', tags: ['Progress'] },
  { path: '/student/quizzes', label: 'My Quizzes', desc: 'Quiz listing — pending, completed, and failed. Retake available quizzes and view scores.', tags: ['Quizzes'] },
  { path: '/student/certificates', label: 'My Certificates', desc: 'View and download earned completion certificates with share-to-LinkedIn capability.', tags: ['Certificates'] },
  { path: '/student/orders', label: 'Purchase History', desc: 'Complete transaction history — invoices, payment receipts, and enrollment records.', tags: ['Orders'] },
  { path: '/student/messages', label: 'Messages', desc: 'Direct messaging with mentors and platform support team.', tags: ['Messaging'] },
  { path: '/student/profile', label: 'Student Profile', desc: 'Profile editor — avatar, bio, learning preferences, notification settings, password change.', tags: ['Profile'] },
];

/* ─── Colour palette per role ─── */
const ROLE = {
  public:  { accent: '#6366f1', text: '#818cf8',  tagBg: 'rgba(99,102,241,0.15)',  tagColor: '#a5b4fc'  },
  auth:    { accent: '#8b5cf6', text: '#c4b5fd',  tagBg: 'rgba(139,92,246,0.15)', tagColor: '#c4b5fd'  },
  admin:   { accent: '#f59e0b', text: '#fbbf24',  tagBg: 'rgba(245,158,11,0.15)', tagColor: '#fbbf24'  },
  mentor:  { accent: '#10b981', text: '#34d399',  tagBg: 'rgba(16,185,129,0.15)', tagColor: '#34d399'  },
  student: { accent: '#3b82f6', text: '#60a5fa',  tagBg: 'rgba(59,130,246,0.15)', tagColor: '#60a5fa'  },
};

/* ─── Sub-components ─── */
function RouteCard({ route, role }: { route: RouteItem; role: keyof typeof ROLE }) {
  const c = ROLE[role];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.2s, border-color 0.2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
    }}
    >
      {/* left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c.accent, borderRadius: '12px 0 0 12px', opacity: 0.7 }} />
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: c.text, marginBottom: 6, wordBreak: 'break-all' }}>{route.path}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{route.label}</div>
      <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.55 }}>{route.desc}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
        {route.tags.map(t => (
          <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.tagBg, color: c.tagColor }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function RoutesGrid({ routes, role }: { routes: RouteItem[]; role: keyof typeof ROLE }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
      {routes.map(r => <RouteCard key={r.path} route={r} role={role} />)}
    </div>
  );
}

function SlideHeader({ badge, badgeStyle, title, desc }: { badge: string; badgeStyle: React.CSSProperties; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 12, ...badgeStyle }}>{badge}</div>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 8, color: '#f1f5f9' }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 620 }}>{desc}</p>
    </div>
  );
}

/* ─── Canvas Background ─── */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    type P = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; hue: number };
    const particles: P[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.3 + 0.05,
        hue: Math.random() * 60 + 220,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const orbs = [
        { x: canvas.width * 0.1,  y: canvas.height * 0.2, r: 300, c: 'rgba(99,102,241,0.06)' },
        { x: canvas.width * 0.85, y: canvas.height * 0.6, r: 350, c: 'rgba(139,92,246,0.05)' },
        { x: canvas.width * 0.5,  y: canvas.height * 0.9, r: 280, c: 'rgba(168,85,247,0.04)' },
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
        ctx.fillStyle = `hsla(${p.hue},70%,70%,${p.alpha})`;
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

/* ─── Main Page ─── */
export default function RoutesPresentationPage() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const total = SLIDES.length;

  const goSlide = useCallback((n: number) => {
    if (n === current) return;
    setExiting(current);
    setTimeout(() => setExiting(null), 550);
    setCurrent(n);
  }, [current]);

  const next = useCallback(() => { if (current < total - 1) goSlide(current + 1); }, [current, total, goSlide]);
  const prev = useCallback(() => { if (current > 0) goSlide(current - 1); }, [current, goSlide]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const touchStart = useRef(0);

  const slideStyle = (idx: number): React.CSSProperties => {
    const isActive  = idx === current;
    const isExiting = idx === exiting;
    return {
      position: 'absolute', inset: 0,
      padding: '36px 40px',
      overflowY: 'auto',
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateX(0)' : isExiting ? 'translateX(-40px)' : 'translateX(40px)',
      transition: 'opacity 0.5s cubic-bezier(0.76,0,0.24,1), transform 0.5s cubic-bezier(0.76,0,0.24,1)',
      pointerEvents: isActive ? 'auto' : 'none',
    };
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#04040f', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <AnimatedBackground />

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, flexShrink: 0, position: 'relative', zIndex: 10,
        background: 'rgba(4,4,15,0.88)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0 }}>F</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fin2U LMS</div>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Route Architecture</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', padding: '8px 12px 4px' }}>Presentation</div>
          {SLIDES.slice(0, 3).map((s, i) => (
            <NavItem key={s.id} slide={s} index={i} current={current} onClick={() => goSlide(i)} />
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', padding: '16px 12px 4px' }}>Routes by Role</div>
          {SLIDES.slice(3).map((s, i) => (
            <NavItem key={s.id} slide={s} index={i + 3} current={current} onClick={() => goSlide(i + 3)} />
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Fin2U LMS Platform</div>
          <div>Full-Stack Learning Management System</div>
          <div style={{ marginTop: 8, color: '#6366f1', fontWeight: 600 }}>Confidential — 2026</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{
          height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(4,4,15,0.65)', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{SLIDES[current].nav}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
              Slide {current + 1} / {total}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CtrlBtn onClick={prev} disabled={current === 0} label="←" />
            <span style={{ fontSize: 12, color: '#475569', minWidth: 44, textAlign: 'center' }}>{current + 1} / {total}</span>
            <CtrlBtn onClick={next} disabled={current === total - 1} label="→" />
          </div>
        </div>

        {/* Slides */}
        <div
          style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
          onTouchStart={e => { touchStart.current = e.changedTouches[0].screenX; }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].screenX - touchStart.current;
            if (dx < -50) next();
            if (dx > 50) prev();
          }}
        >
          {/* SLIDE 0 – Cover */}
          <div style={slideStyle(0)}>
            <CoverSlide onNav={goSlide} />
          </div>

          {/* SLIDE 1 – Overview */}
          <div style={slideStyle(1)}>
            <SlideHeader
              badge="🌐 Platform Overview" title="Three Portals, One Platform"
              desc="Fin2U LMS is built on Next.js App Router with a clean role-based architecture. Each user role gets a dedicated, protected portal with tailored features."
              badgeStyle={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '🌍', name: 'Public Zone', desc: 'Accessible to all visitors — browse courses, groups, mentors, and platform content without logging in.', count: '15 routes', color: '#818cf8', accent: '#6366f1', slide: 3 },
                { icon: '🔐', name: 'Auth Zone',   desc: 'Authentication flows — login, register, forgot password, email verification, and OAuth sign-in.', count: '6 routes', color: '#c4b5fd', accent: '#8b5cf6', slide: 4 },
                { icon: '⚙️', name: 'Admin Portal', desc: 'Full platform management — users, courses, enrollments, orders, mentors, groups, reports, and settings.', count: '22+ routes', color: '#fbbf24', accent: '#f59e0b', slide: 5 },
                { icon: '👨‍🏫', name: 'Mentor Portal', desc: 'Course creation & management, student tracking, quiz management, community engagement, and earnings.', count: '12 routes', color: '#34d399', accent: '#10b981', slide: 6 },
                { icon: '🎓', name: 'Student Portal', desc: 'Personalized learning — enrolled courses, progress tracking, quiz taking, certificates, and messages.', count: '10 routes', color: '#60a5fa', accent: '#3b82f6', slide: 7 },
              ].map(c => (
                <div key={c.name} onClick={() => goSlide(c.slide)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.accent, fontFamily: 'monospace' }}>{c.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SLIDE 2 – Architecture */}
          <div style={slideStyle(2)}>
            <SlideHeader
              badge="🗺 Architecture Map" title="Route Group Structure"
              desc="Next.js App Router route groups organise the application into logical zones without affecting the URL structure."
              badgeStyle={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}
            />
            <ArchLayer label="Root: src/app/" labelColor="#94a3b8" boxes={[
              { label: '(public) — Public pages', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  color: '#a5b4fc' },
              { label: '(auth) — Authentication',  bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', color: '#c4b5fd' },
              { label: '(admin) — Admin panel',    bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
              { label: '(mentor) — Mentor portal', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
              { label: '(student) — Student zone', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#60a5fa' },
            ]} />
            <ArchLayer label="Admin: /admin/*" labelColor="#f59e0b" boxes={['Dashboard','Courses','Students','Mentors','Orders','Enrollments','Groups','Users','Reports','Messages','Settings','Support','Website'].map(l => ({ label: l, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#fcd34d' }))} small />
            <ArchLayer label="Mentor: /mentor/*" labelColor="#10b981" boxes={['Dashboard','Courses','Students','Quizzes','Community','Messages','Profile'].map(l => ({ label: l, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }))} small />
            <ArchLayer label="Student: /student/* and /learn/*" labelColor="#3b82f6" boxes={['Dashboard','My Courses','Learn (Player)','Progress','Quizzes','Certificates','Orders'].map(l => ({ label: l, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', color: '#93c5fd' }))} small />
          </div>

          {/* SLIDE 3 – Public */}
          <div style={slideStyle(3)}>
            <SlideHeader badge="🌍 Public Zone" title="Public Routes" desc="These pages are accessible to all visitors without authentication. They form the public face of the platform."
              badgeStyle={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }} />
            <RoutesGrid routes={PUBLIC_ROUTES} role="public" />
          </div>

          {/* SLIDE 4 – Auth */}
          <div style={slideStyle(4)}>
            <SlideHeader badge="🔐 Auth Zone" title="Authentication Routes" desc="Secure authentication flows handling user identity — login, registration, password recovery, and email verification."
              badgeStyle={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }} />
            <RoutesGrid routes={AUTH_ROUTES} role="auth" />
          </div>

          {/* SLIDE 5 – Admin */}
          <div style={slideStyle(5)}>
            <SlideHeader badge="⚙️ Admin Portal" title="Admin Routes" desc="Full platform control — administrators manage every aspect of the Fin2U LMS from a unified, feature-rich dashboard."
              badgeStyle={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }} />
            <RoutesGrid routes={ADMIN_ROUTES} role="admin" />
          </div>

          {/* SLIDE 6 – Mentor */}
          <div style={slideStyle(6)}>
            <SlideHeader badge="👨‍🏫 Mentor Portal" title="Mentor Routes" desc="A dedicated portal for instructors to create, manage, and grow their courses while engaging with their student community."
              badgeStyle={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }} />
            <RoutesGrid routes={MENTOR_ROUTES} role="mentor" />
          </div>

          {/* SLIDE 7 – Student */}
          <div style={slideStyle(7)}>
            <SlideHeader badge="🎓 Student Portal" title="Student Routes" desc="A personalized learning portal where students access their courses, track progress, take quizzes, and earn certificates."
              badgeStyle={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }} />
            <RoutesGrid routes={STUDENT_ROUTES} role="student" />
          </div>

          {/* SLIDE 8 – Summary */}
          <div style={slideStyle(8)}>
            <SlideHeader badge="✅ Summary" title="Platform at a Glance" desc="The Fin2U LMS route architecture is designed for clarity, security, and scalability — every route serves a clear purpose within its role zone."
              badgeStyle={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', color: '#f472b6' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { icon: '🌍', count: '15',   label: 'Public Routes',  sub: 'Open access, SEO-optimised pages',  color: '#a5b4fc', accent: '#6366f1' },
                { icon: '🔐', count: '6',    label: 'Auth Routes',    sub: 'Secure authentication flows',        color: '#c4b5fd', accent: '#8b5cf6' },
                { icon: '⚙️', count: '22+',  label: 'Admin Routes',   sub: 'Full platform management',           color: '#fbbf24', accent: '#f59e0b' },
                { icon: '👨‍🏫', count: '12',  label: 'Mentor Routes',  sub: 'Course creation and management',     color: '#34d399', accent: '#10b981' },
                { icon: '🎓', count: '10',   label: 'Student Routes', sub: 'Personalized learning experience',   color: '#60a5fa', accent: '#3b82f6' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.accent, borderRadius: '12px 0 0 12px', opacity: 0.7 }} />
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#f1f5f9' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#ec4899', borderRadius: '12px 0 0 12px', opacity: 0.7 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Key Architecture Highlights</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {[
                  { star: '#a5b4fc', title: 'Next.js App Router', body: 'Latest file-system-based routing with layouts and server components' },
                  { star: '#34d399', title: 'Route Group Isolation', body: 'Clean separation via (public), (auth), (admin), (mentor), (student) groups' },
                  { star: '#fbbf24', title: 'Role-Based Access Control', body: 'Every portal protected with server-side auth guards and middleware' },
                  { star: '#f472b6', title: 'Dynamic Routes', body: 'Slug/ID-based dynamic segments for courses, users, groups, and content' },
                  { star: '#60a5fa', title: 'Nested Layouts', body: 'Shared UI shells per role via layout.tsx files with sidebar and header' },
                  { star: '#c084fc', title: 'TypeScript Throughout', body: 'Full TypeScript (.tsx) for type safety, better DX, and maintainability' },
                ].map(h => (
                  <div key={h.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: h.star, fontSize: 16, marginTop: 1 }}>✦</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2, color: '#f1f5f9' }}>{h.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{h.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>{/* /slide area */}
      </main>

      {/* Progress bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 260, right: 0, height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 100 }}>
        <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7)', transition: 'width 0.4s ease', width: `${((current + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* ─── Helper components ─── */
function NavItem({ slide, index, current, onClick }: { slide: Slide; index: number; current: number; onClick: () => void }) {
  const isActive = index === current;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
      transition: 'all 0.2s',
      border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
      fontSize: 13.5, fontWeight: 500,
      color: isActive ? '#f1f5f9' : '#94a3b8',
    }}
    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = '#f1f5f9'; }}}
    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: slide.dot, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{slide.nav}</span>
      {slide.count && (
        <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: 20, color: '#475569' }}>{slide.count}</span>
      )}
    </div>
  );
}

function CtrlBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: 8,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      color: disabled ? '#334155' : '#94a3b8', cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}

function CoverSlide({ onNav }: { onNav: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
      <div style={{ textAlign: 'center', maxWidth: 700 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '6px 16px', borderRadius: 100, marginBottom: 28 }}>
          🎓 Learning Management System
        </div>
        <h1 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(135deg,#f1f5f9 30%,#c4b5fd 70%,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
          Fin2U LMS<br />Route Architecture
        </h1>
        <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
          A comprehensive, role-based routing system powering the Fin2U Learning Management Platform — designed for scalability, clarity, and seamless user experience.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
          {[
            { num: '65+', label: 'Total Routes' },
            { num: '5', label: 'Role Zones' },
            { num: '3', label: 'User Portals' },
            { num: 'Next.js', label: 'App Router' },
          ].map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {i > 0 && <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onNav(1)} style={{ padding: '12px 32px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Begin Presentation →
        </button>
      </div>
    </div>
  );
}

type ArchBox = { label: string; bg: string; border: string; color: string };

function ArchLayer({ label, labelColor, boxes, small }: { label: string; labelColor: string; boxes: ArchBox[]; small?: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 14 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {boxes.map(b => (
          <div key={b.label} style={{ padding: small ? '8px 14px' : '10px 16px', borderRadius: 10, fontSize: small ? 11 : 12.5, fontWeight: 600, background: b.bg, border: `1px solid ${b.border}`, color: b.color }}>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}
