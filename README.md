# 🌐 Fin2u Academy — Frontend Web Application

The frontend client for **Fin2u Academy**, built with **Next.js 14 (App Router)**, **TypeScript**, **Redux Toolkit + RTK Query**, and **Tailwind CSS v4**.

---

## 🏗️ Architecture & Route Groups

The frontend is structured using Next.js App Router route groups for clean separation of concerns and layout nesting:

```
client/src/app/
├── (public)/                 # Publicly accessible pages
│   ├── page.tsx              # Homepage (Hero, Featured Courses, Partners, Testimonials)
│   ├── courses/              # Course Catalog & Category Filters
│   ├── free-courses/         # Free Tier Courses Filter
│   ├── member-courses/       # Complimentary Member Courses
│   ├── premium-courses/      # Premium Courses
│   ├── courses/[slug]/       # Course Details & Curriculum Preview
│   ├── mentors-portal/       # Instructor Directory
│   ├── mentorship-application/ # Instructor Application Form
│   ├── support/              # Support & Helpdesk Articles
│   ├── terms-of-service/     # Legal Terms
│   └── privacy-policy/       # Privacy Policy
│
├── (auth)/                   # Authentication Flows
│   ├── sign-in/              # User Login
│   └── register/             # Account Registration
│
├── (student)/                # Authenticated Student Hub
│   ├── student/dashboard/    # Student Dashboard (Enrolled courses, stats, quick access)
│   ├── student/courses/      # Enrolled Course List & Progress
│   ├── student/learn/[slug]/ # Distraction-free Course Player & Lesson Tracker
│   ├── student/members/      # Community Member Directory
│   ├── student/groups/       # Social Groups, Discussion Feeds & Forums
│   ├── student/messages/     # Direct Messages & System Notifications
│   └── student/profile/      # User Profile Management
│
├── (mentor)/                 # Mentor Portal
│   ├── mentor/dashboard/     # Mentor Dashboard & Analytics
│   ├── mentor/courses/       # Course Authoring & Curriculum Builder
│   └── mentor/students/      # Enrolled Student Roster
│
└── (admin)/                  # Administrator Portal
    ├── admin/dashboard/      # System Analytics & Overview
    ├── admin/courses/        # Course Approvals & Catalog Management
    ├── admin/users/          # User Management & Role Elevation
    ├── admin/mentors/        # Mentor Application Queue
    ├── admin/settings/       # Website Settings & CMS Banners
    └── admin/support/        # Support Ticket Inbox
```

---

## ⚡ State Management & Data Fetching

- **Redux Toolkit**: Manages global application state (Authentication user state, UI toggles, modals).
- **RTK Query**: Handles server communication, automatic cache invalidation, polling, and optimistic mutations:
  - `authApi`: Sign in, registration, session refresh, current user profile.
  - `courseApi`: Course queries, filtering, reviews, and curriculum payloads.
  - `enrollmentApi`: Enrollment actions, lesson progress updates.
  - `groupApi`: Group feeds, join/leave, post creation, invitations & notifications.
  - `adminApi`: Content management, user role updates, CMS settings.

---

## 🎨 Styling & Design System

- **Tailwind CSS v4**: Utility-first CSS configured with custom brand tokens:
  - **Primary**: `#ff447e` (Rose/Pink)
  - **Secondary**: `#041c53` (Dark Navy Blue)
  - **Background**: Modern glassmorphism surfaces and dark/light contrast cards.
- **Lucide React**: Crisp, modern iconography across all layouts.
- **Swiper.js**: Touch-friendly, smooth carousels for partner logos, featured courses, and student testimonials.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=Fin2u Academy
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```
