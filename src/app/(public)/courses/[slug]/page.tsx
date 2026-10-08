'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGetCourseBySlugQuery } from '@/store/api/courseApi';
import { useGetCourseQuizzesQuery } from '@/store/api/quizApi';
import {
  useEnrollCourseMutation,
  useCheckEnrollmentStatusQuery,
  useGetMyEnrollmentsQuery,
} from '@/store/api/enrollmentApi';
import { useGetMyOrdersQuery } from '@/store/api/paymentApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  Star,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  PlayCircle,
  FileQuestion,
  Users,
  ShieldCheck,
  ArrowRight,
  Share2,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CourseDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: courseData, isLoading, error } = useGetCourseBySlugQuery(slug);
  const course: any = courseData?.course || (courseData as any)?.data?.course || courseData;

  const { data: quizzes = [] } = useGetCourseQuizzesQuery(course?._id || '', {
    skip: !course?._id,
  });

  const { data: enrollmentStatus, refetch: refetchStatus } = useCheckEnrollmentStatusQuery(
    course?._id || slug || '',
    {
      skip: (!course?._id && !slug) || !isAuthenticated,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: myEnrollments = [], refetch: refetchMyEnrollments } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const { data: myOrdersData, refetch: refetchMyOrders } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  const isFreeCourse = course?.type === 'free' || (course?.price || 0) <= 0;

  const handleEnrollOrBuy = async () => {
    if (!isAuthenticated) {
      const target = isFreeCourse ? `/courses/${slug}` : `/checkout/${slug}`;
      router.push(`/sign-in?redirect=${encodeURIComponent(target)}`);
      return;
    }

    if (!course?._id) return;

    // For paid courses, navigate directly to secure checkout
    if (!isFreeCourse) {
      router.push(`/checkout/${course.slug}`);
      return;
    }

    // For free courses, enroll immediately without checkout or card form
    try {
      await enrollCourse(course._id).unwrap();
      await Promise.all([refetchStatus(), refetchMyEnrollments(), refetchMyOrders()]);
      setEnrollMessage('Enrolled successfully! Redirecting to classroom...');
      setTimeout(() => {
        router.push(`/learn/${course.slug}`);
      }, 800);
    } catch (err: any) {
      setEnrollMessage(err?.data?.message || 'Failed to enroll in course');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff447e] border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-[#041c53] mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you are looking for does not exist or has been retired.</p>
          <Link href="/courses" className="btn btn-primary">
            Browse All Courses
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const instructorId =
    course?.instructor?._id ||
    course?.instructor?.id ||
    (typeof course?.instructor === 'string' ? course?.instructor : null);
  const currentUserId = user?.id || (user as any)?._id;
  const isInstructor = Boolean(
    currentUserId && instructorId && instructorId.toString() === currentUserId.toString()
  );
  const isAdmin = user?.role === 'admin';

  const hasInMyEnrollments = Boolean(
    myEnrollments &&
    myEnrollments.some((e: any) => {
      const cid = e?.course?._id || e?.course?.id || (typeof e?.course === 'string' ? e?.course : null);
      const cslug = e?.course?.slug;
      return (
        (cid && course?._id && cid.toString() === course._id.toString()) ||
        (cslug && course?.slug && cslug === course.slug) ||
        (cslug && slug && cslug.toLowerCase() === slug.toLowerCase())
      );
    })
  );

  const hasPaidOrder = Boolean(
    myOrdersData?.orders?.some((order: any) => {
      const orderCourseId =
        order?.course?._id ||
        order?.course?.id ||
        (typeof order?.course === 'string' ? order?.course : null);
      const orderCourseSlug = order?.course?.slug || order?.courseSnapshot?.slug;
      const matchesCourse =
        (orderCourseId && course?._id && orderCourseId.toString() === course._id.toString()) ||
        (orderCourseSlug && course?.slug && orderCourseSlug === course.slug) ||
        (orderCourseSlug && slug && orderCourseSlug.toLowerCase() === slug.toLowerCase());
      return matchesCourse && (order.status === 'paid' || order.status === 'processing');
    })
  );

  const hasInUserArray = Boolean(
    (user as any)?.enrolledCourses?.some((c: any) => {
      const cid = c?._id || c?.id || (typeof c === 'string' ? c : null);
      const cslug = c?.slug;
      return (
        (cid && course?._id && cid.toString() === course._id.toString()) ||
        (cslug && course?.slug && cslug === course.slug) ||
        (cslug && slug && cslug.toLowerCase() === slug.toLowerCase())
      );
    })
  );

  const isEnrolled = Boolean(
    enrollmentStatus?.isEnrolled ||
    hasInMyEnrollments ||
    hasPaidOrder ||
    hasInUserArray ||
    isInstructor ||
    isAdmin
  );

  return (
    <>
      <Header />

      {/* Hero section with dark navy styling */}
      <section className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ff447e] text-white uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white capitalize">
                  {course.level}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 uppercase">
                  {course.type}
                </span>
                {isEnrolled && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isInstructor ? 'Course Faculty' : 'Already Enrolled'}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                {course.shortDescription || course.description.slice(0, 160) + '...'}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructor?.avatar || 'https://ui-avatars.com/api/?name=Fin2u+Mentor'}
                    alt={course.instructor?.name || 'Instructor'}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                  <span>
                    Created by{' '}
                    <span className="font-semibold text-white">{course.instructor?.name || 'Fin2u Expert'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-white">{course.rating || 5.0}</span>
                  <span className="text-gray-400">({course.ratingCount || 1} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{course.enrollmentCount} students enrolled</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="pt-2">
                  <Link
                    href={`/learn/${course.slug}`}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff447e] to-[#ff2a6d] hover:from-[#ff2a6d] hover:to-[#ff1357] text-white font-bold text-sm shadow-xl shadow-pink-500/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>
                      {isInstructor
                        ? 'Course Faculty — Open Lesson Player'
                        : 'Already Enrolled — Go to Lesson Player'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Sidebar */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Syllabus, Objectives, Requirements, Reviews */}
            <div className="lg:col-span-8 space-y-10">
              {/* Objectives */}
              {course.objectives && course.objectives.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-[#041c53] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#ff447e]" />
                    <span>What You'll Learn</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.objectives.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-[#ff447e] shrink-0 mt-1" />
                        <span className="text-sm text-gray-700 leading-snug">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Curriculum */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#041c53]">Course Curriculum</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.lessons?.length || 0} lessons · {course.duration || 0} total minutes
                    </p>
                  </div>
                  {isEnrolled && (
                    <Link
                      href={`/learn/${course.slug}`}
                      className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1"
                    >
                      Go to Lesson Player <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson: any, idx: number) => {
                      const lessonRow = (
                        <div
                          className={`p-4 flex items-center justify-between transition-colors ${
                            isEnrolled
                              ? 'hover:bg-pink-50/40 cursor-pointer group'
                              : 'hover:bg-gray-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PlayCircle className="w-5 h-5 text-[#ff447e] shrink-0 group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-sm font-semibold text-[#041c53] group-hover:text-[#ff447e] transition-colors">
                                {lesson.order}. {lesson.title}
                              </p>
                              <span className="text-xs text-gray-400 capitalize">{lesson.type}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {lesson.duration > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {lesson.duration}m
                              </span>
                            )}
                            {isEnrolled ? (
                              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <PlayCircle className="w-3 h-3" />
                                <span>Play</span>
                              </span>
                            ) : lesson.isPreview ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Preview
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Locked</span>
                            )}
                          </div>
                        </div>
                      );

                      return isEnrolled ? (
                        <Link key={idx} href={`/learn/${course.slug}`}>
                          {lessonRow}
                        </Link>
                      ) : (
                        <div key={idx}>{lessonRow}</div>
                      );
                    })
                  ) : (
                    <p className="p-4 text-sm text-gray-500">No lessons uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Assessment Quizzes */}
              {quizzes.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-[#041c53] mb-4 flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-[#ff447e]" />
                    <span>Course Quizzes & Assessments</span>
                  </h3>
                  <div className="space-y-3">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="p-4 rounded-xl border border-gray-100 flex items-center justify-between bg-gray-50/50"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-[#041c53]">{quiz.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {quiz.totalQuestions} questions · Time limit: {quiz.timeLimitMinutes} mins · Passing: {quiz.passingPercentage}%
                          </p>
                        </div>
                        {isEnrolled ? (
                          <Link
                            href={`/learn/${course.slug}?tab=quiz&quizId=${quiz._id}`}
                            className="btn btn-outline-primary text-xs py-1.5 px-3"
                          >
                            Take Quiz
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Enroll to Take</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Description */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#041c53] mb-4">About this Course</h3>
                <div className="prose text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-[#041c53] mb-4">Prerequisites & Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    {course.requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Pricing & Enrollment Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white/90 text-[#ff447e] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <PlayCircle className="w-8 h-8" />
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Price display */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      {course.type === 'free' ? (
                        <span className="text-3xl font-extrabold text-emerald-600">FREE</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500 font-bold">{course.currency || 'MYR'}</span>
                          <span className="text-3xl font-extrabold text-[#041c53]">{course.price}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700 uppercase">
                      {course.type} Access
                    </span>
                  </div>

                  {/* Enroll CTA */}
                  {enrollMessage && (
                    <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {enrollMessage}
                    </div>
                  )}

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {isInstructor
                            ? 'You are the author of this masterclass.'
                            : isAdmin
                            ? 'You have administrative access to this course.'
                            : 'You have enrolled in this masterclass.'}
                        </span>
                      </div>
                      <Link
                        href={`/learn/${course.slug}`}
                        className="btn btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2 font-bold shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.01]"
                      >
                        <PlayCircle className="w-5 h-5" />
                        <span>Already Enrolled — Go to Lesson Player</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnrollOrBuy}
                      disabled={isEnrolling}
                      className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isEnrolling ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : isFreeCourse ? (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Enroll For Free</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Buy Masterclass — {course.currency || 'MYR'} {course.price}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Course Highlights Checklist */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      THIS COURSE INCLUDES
                    </p>
                    <div className="space-y-2.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#ff447e]" />
                        <span>{course.duration || 120} minutes on-demand learning</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#ff447e]" />
                        <span>{course.lessons?.length || 0} lessons & syllabus guides</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FileQuestion className="w-4 h-4 text-[#ff447e]" />
                        <span>{quizzes.length} knowledge check quizzes</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-[#ff447e]" />
                        <span>Verifiable Certificate of Completion</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#ff447e]" />
                        <span>Full lifetime access to community</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Bio Box */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.instructor?.avatar || 'https://ui-avatars.com/api/?name=Mentor'}
                        alt={course.instructor?.name || 'Mentor'}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#041c53]">{course.instructor?.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{course.instructor?.headline || 'Mentor'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
