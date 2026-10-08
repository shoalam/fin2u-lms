'use client';

import { use, useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useGetCourseBySlugQuery } from '@/store/api/courseApi';
import {
  useGetCourseQuizzesQuery,
  useGetQuizForStudentQuery,
  useSubmitQuizMutation,
  QuizResult,
} from '@/store/api/quizApi';
import {
  useCheckEnrollmentStatusQuery,
  useUpdateLessonProgressMutation,
  useEnrollCourseMutation,
  useGetMyEnrollmentsQuery,
} from '@/store/api/enrollmentApi';
import { useGetMyOrdersQuery } from '@/store/api/paymentApi';
import {
  PlayCircle,
  CheckCircle2,
  CheckCircle,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  Lock,
  RefreshCw,
  Search,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Share2,
  Sparkles,
  Menu,
  X,
  HelpCircle,
  Check,
  Plus,
  Trash2,
  Flame,
  Sliders,
  Tv,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

interface UserNote {
  id: string;
  timestamp: string;
  lessonIndex: number;
  text: string;
  createdAt: string;
}

interface CommunityQuestion {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  question: string;
  details?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: {
    author: string;
    avatar: string;
    timeAgo: string;
    text: string;
    isInstructor?: boolean;
  }[];
}

export default function CoursePlayerPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuizId = searchParams.get('quizId');
  const initialTab = searchParams.get('tab') === 'quiz' ? 'quiz' : 'overview';

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Queries
  const { data: courseData, isLoading: isLoadingCourse } = useGetCourseBySlugQuery(slug);
  const course: any = courseData?.course || (courseData as any)?.data?.course || courseData;

  const {
    data: enrollmentStatus,
    isLoading: isLoadingEnrollment,
    isFetching: isFetchingEnrollment,
    refetch: refetchEnrollment,
  } = useCheckEnrollmentStatusQuery(course?._id || slug || '', {
    skip: (!course?._id && !slug) || !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: myEnrollments = [],
    isLoading: isLoadingMyEnrollments,
    refetch: refetchMyEnrollments,
  } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: myOrdersData,
    isLoading: isLoadingMyOrders,
    refetch: refetchMyOrders,
  } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const [enrollCourse, { isLoading: isEnrollingFree }] = useEnrollCourseMutation();
  const [enrollFreeError, setEnrollFreeError] = useState<string | null>(null);

  const { data: quizzes = [] } = useGetCourseQuizzesQuery(course?._id || '', {
    skip: !course?._id,
  });

  // Access validation: Instructor of this course, Admin, or Enrolled Student
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
    hasInUserArray
  );
  const hasAccess = isInstructor || isAdmin || isEnrolled;
  const isFreeCourse = course?.type === 'free' || (course?.price || 0) <= 0;

  const isCheckingAccess = Boolean(
    isLoadingCourse ||
    (isLoadingEnrollment || (isFetchingEnrollment && !enrollmentStatus)) ||
    (isLoadingMyEnrollments && myEnrollments.length === 0)
  );

  const handleRefreshAccess = async () => {
    try {
      await Promise.all([
        refetchEnrollment(),
        refetchMyEnrollments(),
        refetchMyOrders(),
      ]);
      showToast('Enrollment status refreshed.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleFreeEnroll = async () => {
    if (!course?._id) return;
    try {
      setEnrollFreeError(null);
      await enrollCourse(course._id).unwrap();
      await Promise.all([refetchEnrollment(), refetchMyEnrollments()]);
      showToast('🎉 Enrolled successfully! Welcome to the classroom.');
    } catch (err: any) {
      setEnrollFreeError(err?.data?.message || 'Failed to enroll in course. Please try again.');
    }
  };

  // Player and Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources' | 'qa' | 'quiz'>(
    initialTab as any
  );
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(initialQuizId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Selected quiz query
  const { data: activeQuiz, isLoading: isLoadingQuiz } = useGetQuizForStudentQuery(
    selectedQuizId || '',
    {
      skip: !selectedQuizId,
    }
  );

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [submitQuiz, { isLoading: isSubmittingQuiz }] = useSubmitQuizMutation();
  const [updateProgress, { isLoading: isUpdatingProgress }] = useUpdateLessonProgressMutation();

  // Local Notebook state
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Community Q&A state
  const [questions, setQuestions] = useState<CommunityQuestion[]>([
    {
      id: 'q1',
      author: 'Ahmad Faiz',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      timeAgo: '2 days ago',
      question: 'What is the optimal keyword density for Malaysian multilingual websites?',
      details: 'Should we optimize separately for English and Bahasa Melayu pages, or use hreflang annotations?',
      upvotes: 12,
      replies: [
        {
          author: 'Instructor Support',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          timeAgo: '1 day ago',
          text: 'Great question! In Malaysia, multilingual targeting works best when maintaining dedicated URL directories (/en/ and /ms/) with proper hreflang tags.',
          isInstructor: true,
        },
      ],
    },
    {
      id: 'q2',
      author: 'Nurul Huda',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      timeAgo: '4 days ago',
      question: 'How long does Google take to index new backlink profiles in 2026?',
      details: 'I just placed a tier-1 editorial mention on a local tech portal.',
      upvotes: 7,
      replies: [
        {
          author: 'Tan Wei Kang',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
          timeAgo: '3 days ago',
          text: 'Typically 3 to 14 business days depending on crawl budget and authority score.',
        },
      ],
    },
  ]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionDetails, setNewQuestionDetails] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);

  // Course lessons derived
  const lessons = useMemo(() => course?.lessons || [], [course?.lessons]);
  const activeLesson = lessons[activeLessonIndex] || null;

  const enrollment = enrollmentStatus?.enrollment;
  const completedLessonIds = useMemo(
    () => (enrollment?.completedLessons || []).map((id: any) => id.toString()),
    [enrollment?.completedLessons]
  );
  const isCurrentLessonCompleted = Boolean(
    activeLesson?._id && completedLessonIds.includes(activeLesson._id.toString())
  );
  const completedCount = completedLessonIds.length;
  const totalLessons = lessons.length;
  const calculatedProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Filtered lessons for sidebar
  const filteredLessons = useMemo(() => {
    return lessons.filter((l: any) =>
      l.title.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [lessons, searchFilter]);

  // Video URL helper
  const parsedVideo = useMemo(() => {
    const rawUrl = activeLesson?.videoUrl?.trim();
    if (!rawUrl) return { type: 'empty' as const, url: '' };

    const ytMatch = rawUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube' as const,
        url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      };
    }

    const vimeoMatch = rawUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo' as const,
        url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&byline=0&portrait=0`,
      };
    }

    return { type: 'html5' as const, url: rawUrl };
  }, [activeLesson?.videoUrl]);

  // Dynamic lesson overview content
  const lessonSummaryContent = useMemo(() => {
    if (activeLesson?.content && activeLesson.content.trim().length > 10) {
      return activeLesson.content;
    }
    return `### 📌 Unit Overview: ${activeLesson?.title || 'Course Module'}

In this interactive module, you will master practical implementation strategies tailored for Malaysian businesses and regional digital frameworks. 

#### Key Learning Goals:
- **Core Principles**: Understanding algorithmic indicators, user engagement metrics, and regional search intent.
- **Hands-On Setup**: Step-by-step guidance on setting up analytical dashboards, auditing crawl errors, and tracking keyword visibility.
- **Actionable Execution**: Real-world case study workflows tested across Malaysian SMEs and e-commerce enterprises.

> 💡 **Pro-Tip**: Take notes in the **Notebook tab** and complete the quiz at the end of the module to lock in your certification eligibility.`;
  }, [activeLesson]);

  // Auth redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/learn/${slug}`);
    }
  }, [isAuthenticated, router, slug]);

  // Sync initial quiz
  useEffect(() => {
    if (quizzes.length > 0 && !selectedQuizId) {
      setSelectedQuizId(quizzes[0]._id);
    }
  }, [quizzes, selectedQuizId]);

  // Load notes from localStorage
  useEffect(() => {
    if (!course?._id) return;
    try {
      const saved = localStorage.getItem(`fin2u_notes_${course._id}`);
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [course?._id]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  // Action handlers
  const handleMarkComplete = async () => {
    if (!course?._id || !activeLesson?._id) return;
    try {
      await updateProgress({
        courseId: course._id,
        lessonId: activeLesson._id.toString(),
      }).unwrap();
      refetchEnrollment();
      showToast('🎉 Lesson completed! Progress updated.');

      if (activeLessonIndex === lessons.length - 1 && calculatedProgress >= 80) {
        setShowCelebration(true);
      } else if (autoAdvance && activeLessonIndex < lessons.length - 1) {
        setTimeout(() => {
          setActiveLessonIndex((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update progress.');
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      setActiveTab('overview');
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
      setActiveTab('overview');
    }
  };

  // Save notes helper
  const saveNotesToStorage = (updatedNotes: UserNote[]) => {
    setNotes(updatedNotes);
    if (course?._id) {
      try {
        localStorage.setItem(`fin2u_notes_${course._id}`, JSON.stringify(updatedNotes));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: UserNote = {
      id: Date.now().toString(),
      timestamp: `Lesson ${activeLessonIndex + 1}`,
      lessonIndex: activeLessonIndex,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString('en-MY', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    saveNotesToStorage([newNote, ...notes]);
    setNewNoteText('');
    showToast('📝 Note saved!');
  };

  const handleDeleteNote = (id: string) => {
    saveNotesToStorage(notes.filter((n) => n.id !== id));
    showToast('Note deleted.');
  };

  const handleExportNotes = () => {
    if (notes.length === 0) {
      showToast('No notes to export.');
      return;
    }
    const content = notes
      .map((n) => `[${n.timestamp} - ${n.createdAt}]\n${n.text}\n`)
      .join('\n----------------------------------------\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.slug || 'course'}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes downloaded successfully.');
  };

  const handleUpvoteQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const hasUpvoted = q.hasUpvoted;
          return {
            ...q,
            upvotes: hasUpvoted ? q.upvotes - 1 : q.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return q;
      })
    );
  };

  const handlePostQuestion = () => {
    if (!newQuestionTitle.trim()) return;
    const newQ: CommunityQuestion = {
      id: `q_${Date.now()}`,
      author: user?.name || 'You (Learner)',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      timeAgo: 'Just now',
      question: newQuestionTitle.trim(),
      details: newQuestionDetails.trim(),
      upvotes: 1,
      hasUpvoted: true,
      replies: [],
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionTitle('');
    setNewQuestionDetails('');
    setShowAskModal(false);
    showToast('Question posted to community!');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('🔗 Course link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuizId || !activeQuiz) return;

    const formattedAnswers = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
      questionIndex: parseInt(qIdx, 10),
      selectedOptionIndex: optIdx,
    }));

    try {
      const result = await submitQuiz({
        id: selectedQuizId,
        submission: { answers: formattedAnswers },
      }).unwrap();
      setQuizResult(result);
      if (result.passed) {
        showToast('🏆 Great job! You passed the quiz.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to submit quiz.');
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrevLesson();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleMarkComplete();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTheaterMode((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLessonIndex, lessons.length, autoAdvance]);

  // Loading View
  if (isLoadingCourse || (isCheckingAccess && !hasAccess)) {
    return (
      <div className="min-h-screen bg-[#02091b] flex flex-col items-center justify-center text-white space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff447e] border-t-transparent shadow-lg shadow-[#ff447e]/30" />
        <p className="text-sm font-semibold text-gray-400 animate-pulse">
          Verifying classroom enrollment & loading syllabus...
        </p>
      </div>
    );
  }

  // Not Found View
  if (!course) {
    return (
      <div className="min-h-screen bg-[#02091b] flex flex-col items-center justify-center text-white px-4">
        <div className="bg-[#041235] p-8 rounded-3xl border border-white/10 text-center max-w-md space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-[#ff447e] mx-auto" />
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <p className="text-xs text-gray-400">
            The course you are looking for does not exist or has been moved.
          </p>
          <Link href="/courses" className="btn btn-primary text-xs py-2.5 px-6 mt-2">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  // Access Restricted / Not Enrolled View
  if (!hasAccess && !isCheckingAccess && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02091b] flex flex-col items-center justify-center text-white px-4 py-12">
        <div className="bg-[#041235] p-8 sm:p-10 rounded-3xl border border-white/10 text-center max-w-lg w-full space-y-6 shadow-2xl shadow-black/50">
          <div className="w-16 h-16 rounded-2xl bg-[#ff447e]/10 border border-[#ff447e]/30 text-[#ff447e] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-white/10 text-[#ff447e]">
              Classroom Access Required
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{course.title}</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You must be enrolled in this masterclass to access the syllabus, video lectures, and certification quizzes.
            </p>
          </div>

          {enrollFreeError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
              {enrollFreeError}
            </div>
          )}

          {/* Course Summary Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left flex items-center gap-3.5">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'}
              alt={course.title}
              className="w-16 h-14 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{course.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {course.lessons?.length || 0} Lessons • {course.duration || 120} mins
              </p>
              <p className="text-xs font-black text-[#ff447e] mt-1">
                {isFreeCourse ? 'FREE Masterclass' : `${course.currency || 'MYR'} ${course.price?.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {isFreeCourse ? (
              <button
                type="button"
                onClick={handleFreeEnroll}
                disabled={isEnrollingFree}
                className="w-full btn btn-primary py-3.5 px-6 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/30 cursor-pointer disabled:opacity-60"
              >
                {isEnrollingFree ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Enrolling You Now...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Enroll For Free & Enter Classroom</span>
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/checkout/${course.slug}`}
                className="w-full btn btn-primary py-3.5 px-6 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff447e]/30"
              >
                <Lock className="w-4 h-4" />
                <span>Buy Masterclass & Unlock ({course.currency || 'MYR'} {course.price?.toFixed(2)})</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleRefreshAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Already Paid? Refresh Status</span>
            </button>

            <Link
              href={`/courses/${course.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Overview</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02091b] text-gray-100 flex flex-col font-sans selection:bg-[#ff447e] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#041235] text-white text-xs font-semibold px-4 py-3 rounded-2xl border border-[#ff447e]/40 shadow-2xl shadow-[#ff447e]/20 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#ff447e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-16 bg-[#041235]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0">
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-3 md:gap-4 truncate max-w-xl">
          <Link
            href={`/courses/${course.slug}`}
            className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Back to Course Overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Overview</span>
          </Link>

          <span className="text-white/20 hidden sm:inline">|</span>

          <div className="truncate">
            <h1 className="text-xs md:text-sm font-bold text-white truncate">{course.title}</h1>
            <p className="text-[11px] text-gray-400 truncate hidden sm:block">
              {activeTab === 'quiz'
                ? `Quiz: ${activeQuiz?.title || 'Assessment'}`
                : `Lesson ${activeLessonIndex + 1}: ${activeLesson?.title || 'Overview'}`}
            </p>
          </div>
        </div>

        {/* Right Side: Progress, Controls, Shortcuts */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Progress Widget */}
          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Course Progress
              </span>
              <p className="text-xs font-bold text-[#ff447e]">
                {calculatedProgress}% ({completedCount}/{totalLessons})
              </p>
            </div>
            <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff447e] to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${calculatedProgress}%` }}
              />
            </div>
          </div>

          {/* Autoplay Next Toggle */}
          <button
            onClick={() => {
              setAutoAdvance((prev) => !prev);
              showToast(`Autoplay next lesson: ${!autoAdvance ? 'Enabled' : 'Disabled'}`);
            }}
            className={`hidden lg:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              autoAdvance
                ? 'bg-[#ff447e]/15 border-[#ff447e]/40 text-[#ff447e]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Automatically load next lesson when finished"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Autoplay Next: {autoAdvance ? 'ON' : 'OFF'}</span>
          </button>

          {/* Theater Mode Button */}
          <button
            onClick={() => setIsTheaterMode((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isTheaterMode
                ? 'bg-[#ff447e]/20 border-[#ff447e] text-[#ff447e]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Theater Mode (T)"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Share Course"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isSidebarOpen
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-[#ff447e] border-[#ff447e] text-white shadow-md shadow-[#ff447e]/20'
            }`}
            title="Toggle Syllabus Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Player + Multi-Tabs */}
        <div
          className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
            isTheaterMode || !isSidebarOpen ? 'w-full' : 'lg:max-w-[70%] xl:max-w-[72%]'
          }`}
        >
          {/* Top Mode Selector Tabs */}
          <div className="bg-[#030e28] border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab !== 'quiz'
                    ? 'bg-[#ff447e] text-white shadow-lg shadow-[#ff447e]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Interactive Classroom</span>
              </button>

              {quizzes.length > 0 && (
                <button
                  onClick={() => {
                    setActiveTab('quiz');
                    if (quizzes.length > 0 && !selectedQuizId) {
                      setSelectedQuizId(quizzes[0]._id);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'quiz'
                      ? 'bg-[#ff447e] text-white shadow-lg shadow-[#ff447e]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileQuestion className="w-4 h-4" />
                  <span>Module Quizzes ({quizzes.length})</span>
                </button>
              )}
            </div>

            {/* Quick Completion Button in Header Bar */}
            {activeTab !== 'quiz' && (
              <button
                onClick={handleMarkComplete}
                disabled={Boolean(isUpdatingProgress)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isCurrentLessonCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCurrentLessonCompleted ? 'Completed' : 'Mark as Done'}</span>
              </button>
            )}
          </div>

          {/* MAIN PLAYER STAGE (When in Lesson Mode) */}
          {activeTab !== 'quiz' && (
            <div className="flex-1 flex flex-col">
              {/* Video Player Box */}
              <div className="relative aspect-video bg-[#010614] flex items-center justify-center overflow-hidden border-b border-white/10 group shadow-2xl">
                {parsedVideo.type === 'youtube' ? (
                  <iframe
                    className="w-full h-full"
                    src={parsedVideo.url}
                    title={activeLesson?.title || 'Course Lesson'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'vimeo' ? (
                  <iframe
                    className="w-full h-full"
                    src={parsedVideo.url}
                    title={activeLesson?.title || 'Course Lesson'}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'html5' ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={parsedVideo.url}
                    controls
                    onEnded={() => {
                      if (!isCurrentLessonCompleted) {
                        handleMarkComplete();
                      }
                    }}
                  />
                ) : (
                  /* High-Tech Presentation Poster Mode */
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#061947] via-[#030e29] to-[#010614]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,68,126,0.15),transparent_60%)]" />

                    <div className="relative z-10 max-w-lg space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff447e]/20 border border-[#ff447e]/40 text-[#ff447e] text-xs font-bold tracking-wide uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Lecture Unit {activeLessonIndex + 1}</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {activeLesson?.title || 'Interactive Lesson'}
                      </h2>

                      <p className="text-xs md:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                        Comprehensive curriculum breakdown with step-by-step reading materials, downloadable
                        resources, and assessment exercises.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleMarkComplete}
                          className={`btn text-xs py-2.5 px-5 font-bold flex items-center gap-2 ${
                            isCurrentLessonCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'btn-primary shadow-xl shadow-[#ff447e]/30'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isCurrentLessonCompleted ? 'Unit Completed' : 'Complete & Continue'}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('notes')}
                          className="btn btn-outline-white text-xs py-2.5 px-4 flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Take Notes</span>
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-gray-400 z-10">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#ff447e]" />
                        <span>Duration: {activeLesson?.duration || 20} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Level: {course.level || 'All Levels'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Quick Next/Prev Controls on Hover */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <button
                    onClick={handlePrevLesson}
                    disabled={activeLessonIndex === 0}
                    className="p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-[#ff447e] transition-all disabled:opacity-0 pointer-events-auto"
                    title="Previous Lesson (P)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <button
                    onClick={handleNextLesson}
                    disabled={activeLessonIndex === lessons.length - 1}
                    className="p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-[#ff447e] transition-all disabled:opacity-0 pointer-events-auto"
                    title="Next Lesson (N)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs Bar */}
              <div className="border-b border-white/10 bg-[#030c24] px-6 flex items-center gap-6 overflow-x-auto sticky top-0 z-10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-[#ff447e] text-[#ff447e]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Overview & Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-[#ff447e] text-[#ff447e]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Notebook {notes.length > 0 && `(${notes.length})`}</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'border-[#ff447e] text-[#ff447e]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Resources & Downloads</span>
                </button>

                <button
                  onClick={() => setActiveTab('qa')}
                  className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'qa'
                      ? 'border-[#ff447e] text-[#ff447e]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discussion Q&A ({questions.length})</span>
                </button>
              </div>

              {/* Sub-Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="p-6 md:p-8 space-y-8 max-w-4xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-[#ff447e] uppercase tracking-wider">
                          Module {activeLessonIndex + 1} of {lessons.length}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[11px] text-gray-400">
                          {activeLesson?.duration || 20} min duration
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                        {activeLesson?.title || 'Lesson Overview'}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleMarkComplete}
                        disabled={Boolean(isUpdatingProgress)}
                        className={`btn text-xs py-2.5 px-5 font-bold flex items-center gap-2 ${
                          isCurrentLessonCompleted
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                            : 'btn-primary shadow-lg shadow-[#ff447e]/20'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isCurrentLessonCompleted ? 'Completed' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed bg-[#041235]/50 p-6 md:p-8 rounded-3xl border border-white/10 shadow-inner">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Flame className="w-5 h-5 text-[#ff447e]" />
                          <span>Core Takeaways for Malaysian Practitioners</span>
                        </h3>
                        <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                          {lessonSummaryContent}
                        </div>
                      </div>
                    </div>

                    {course.objectives && course.objectives.length > 0 && (
                      <div className="bg-[#041235]/30 p-6 rounded-3xl border border-white/5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Mastery Objectives for this Course</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                          {course.objectives.map((obj: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <button
                        onClick={handlePrevLesson}
                        disabled={activeLessonIndex === 0}
                        className="btn btn-outline-white text-xs py-2.5 px-4 flex items-center gap-2 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Lesson</span>
                      </button>

                      <button
                        onClick={handleNextLesson}
                        disabled={activeLessonIndex === lessons.length - 1}
                        className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2 disabled:opacity-30"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: My Notebook */}
              {activeTab === 'notes' && (
                <div className="p-6 md:p-8 space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">My Personal Notebook</h3>
                      <p className="text-xs text-gray-400">
                        Notes are automatically saved locally on this device.
                      </p>
                    </div>

                    {notes.length > 0 && (
                      <button
                        onClick={handleExportNotes}
                        className="btn btn-outline-white text-xs py-2 px-3 flex items-center gap-1.5"
                        title="Download notes file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Notes</span>
                      </button>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className="bg-[#041235] p-5 rounded-2xl border border-white/10 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Add a note for Lesson {activeLessonIndex + 1}
                    </label>
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Write key concepts, questions, or ideas..."
                      rows={3}
                      className="w-full bg-[#02091b] text-sm text-gray-100 p-3.5 rounded-xl border border-white/10 focus:border-[#ff447e] outline-none resize-none transition-colors"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 pt-2">
                    {notes.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <FileText className="w-10 h-10 text-gray-500 mx-auto" />
                        <p className="text-xs text-gray-400">
                          You haven't written any notes yet. Create your first note above!
                        </p>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-[#041235]/60 p-4 rounded-2xl border border-white/10 flex items-start justify-between gap-4 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-bold text-[#ff447e]">{note.timestamp}</span>
                              <span>•</span>
                              <span>{note.createdAt}</span>
                            </div>
                            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {note.text}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Resources & Downloads */}
              {activeTab === 'resources' && (
                <div className="p-6 md:p-8 space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold text-white">Downloadable Course Resources</h3>
                    <p className="text-xs text-gray-400">
                      Curated templates, frameworks, and cheatsheets to accelerate your practical application.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#041235] border border-white/10 flex items-center justify-between gap-3 hover:border-[#ff447e]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ff447e]/20 text-[#ff447e] flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Malaysian SEO Audit Checklist 2026
                          </h4>
                          <p className="text-[11px] text-gray-400">2.4 MB · Comprehensive guide</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast('Downloading Malaysian SEO Audit Checklist...')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-[#ff447e] hover:text-white transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#041235] border border-white/10 flex items-center justify-between gap-3 hover:border-[#ff447e]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          XLS
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Keyword Matrix & ROI Calculator
                          </h4>
                          <p className="text-[11px] text-gray-400">1.1 MB · Spreadsheet Template</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast('Downloading ROI Calculator spreadsheet...')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Download Template"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#041235] border border-white/10 flex items-center justify-between gap-3 hover:border-[#ff447e]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                          DOC
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Link Building Outreach Script
                          </h4>
                          <p className="text-[11px] text-gray-400">850 KB · Ready-to-use email templates</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast('Downloading Outreach Scripts...')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#041235] border border-white/10 flex items-center justify-between gap-3 hover:border-[#ff447e]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          LINK
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Google Search Console Guide</h4>
                          <p className="text-[11px] text-gray-400">External official documentation</p>
                        </div>
                      </div>
                      <a
                        href="https://developers.google.com/search/docs"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Open Documentation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Q&A Community */}
              {activeTab === 'qa' && (
                <div className="p-6 md:p-8 space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Classroom Q&A</h3>
                      <p className="text-xs text-gray-400">
                        Ask questions and learn collaboratively with peers and instructors.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAskModal(true)}
                      className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ask a Question</span>
                    </button>
                  </div>

                  {/* Ask Question Modal / Inline Box */}
                  {showAskModal && (
                    <div className="bg-[#041235] p-5 rounded-2xl border border-[#ff447e]/40 space-y-3">
                      <h4 className="text-sm font-bold text-white">Ask your question</h4>
                      <input
                        type="text"
                        value={newQuestionTitle}
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        placeholder="What is your question? (e.g., How to handle duplicate canonical tags?)"
                        className="w-full bg-[#02091b] text-sm text-gray-100 px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-[#ff447e] outline-none"
                      />
                      <textarea
                        value={newQuestionDetails}
                        onChange={(e) => setNewQuestionDetails(e.target.value)}
                        placeholder="Include context or specific scenario (optional)..."
                        rows={2}
                        className="w-full bg-[#02091b] text-sm text-gray-100 p-3.5 rounded-xl border border-white/10 focus:border-[#ff447e] outline-none resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowAskModal(false)}
                          className="btn btn-ghost text-xs py-1.5 px-3 text-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePostQuestion}
                          disabled={!newQuestionTitle.trim()}
                          className="btn btn-primary text-xs py-1.5 px-4 font-bold disabled:opacity-40"
                        >
                          Post Question
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Questions Feed */}
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="bg-[#041235]/60 p-5 rounded-2xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={q.avatar}
                              alt={q.author}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <h5 className="text-xs font-bold text-white">{q.author}</h5>
                              <span className="text-[10px] text-gray-400">{q.timeAgo}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleUpvoteQuestion(q.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                              q.hasUpvoted
                                ? 'bg-[#ff447e]/20 border-[#ff447e] text-[#ff447e]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{q.upvotes}</span>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{q.question}</h4>
                          {q.details && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{q.details}</p>
                          )}
                        </div>

                        {/* Replies */}
                        {q.replies.length > 0 && (
                          <div className="pt-3 border-t border-white/5 space-y-2.5">
                            {q.replies.map((rep, idx) => (
                              <div
                                key={idx}
                                className="bg-[#02091b]/70 p-3 rounded-xl border border-white/5 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{rep.author}</span>
                                    {rep.isInstructor && (
                                      <span className="bg-[#ff447e]/20 text-[#ff447e] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                                        Instructor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-gray-500 text-[10px]">{rep.timeAgo}</span>
                                </div>
                                <p className="text-xs text-gray-300">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: INTERACTIVE QUIZ MODE */}
          {activeTab === 'quiz' && (
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
              {isLoadingQuiz ? (
                <div className="py-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff447e] border-t-transparent mx-auto" />
                </div>
              ) : activeQuiz ? (
                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Quiz Header */}
                  <div className="bg-[#041235] p-6 rounded-3xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ff447e] uppercase tracking-wider">
                        Assessment Exam
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>{activeQuiz.timeLimitMinutes} Minutes</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white">{activeQuiz.title}</h2>
                    {activeQuiz.description && (
                      <p className="text-xs text-gray-400">{activeQuiz.description}</p>
                    )}

                    <div className="pt-2 text-xs text-gray-400 flex items-center gap-4">
                      <span>Total Questions: {activeQuiz.totalQuestions}</span>
                      <span>Passing Score: {activeQuiz.passingPercentage}%</span>
                    </div>
                  </div>

                  {/* Results Screen */}
                  {quizResult ? (
                    <div className="space-y-6">
                      <div
                        className={`p-6 rounded-3xl border text-center space-y-3 ${
                          quizResult.passed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-red-950/40 border-red-500/40 text-red-200'
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                            quizResult.passed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          <Award className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-extrabold">
                          {quizResult.passed ? 'Congratulations! You Passed!' : 'Assessment Not Passed'}
                        </h3>
                        <p className="text-sm">
                          You scored <span className="font-bold">{quizResult.score}</span> out of{' '}
                          <span className="font-bold">{quizResult.totalPoints}</span> points (
                          <span className="font-bold">{quizResult.percentage}%</span>). Passing threshold is{' '}
                          {quizResult.passingPercentage}%.
                        </p>

                        <div className="pt-3">
                          <button
                            onClick={handleRetryQuiz}
                            className="btn btn-outline-white text-xs py-2 px-4 flex items-center gap-1.5 mx-auto"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retake Quiz</span>
                          </button>
                        </div>
                      </div>

                      {/* Answers Review */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                          Answers & Explanations Review
                        </h4>
                        <div className="space-y-4">
                          {quizResult.answers.map((ans, idx) => (
                            <div
                              key={idx}
                              className={`p-5 rounded-2xl border text-sm ${
                                ans.isCorrect
                                  ? 'bg-emerald-950/20 border-emerald-500/30'
                                  : 'bg-red-950/20 border-red-500/30'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <p className="font-bold text-white">
                                  {idx + 1}. {ans.question}
                                </p>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    ans.isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-red-500/20 text-red-300'
                                  }`}
                                >
                                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-300 mb-3">
                                <p>
                                  Your answer:{' '}
                                  <span className="font-semibold text-white">
                                    {ans.options[ans.selectedOptionIndex] || 'None'}
                                  </span>
                                </p>
                                {!ans.isCorrect && (
                                  <p className="text-emerald-400">
                                    Correct answer:{' '}
                                    <span className="font-semibold">
                                      {ans.options[ans.correctOptionIndex]}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {ans.explanation && (
                                <p className="text-xs text-gray-400 pt-2 border-t border-white/5">
                                  💡 <span className="font-semibold">Explanation:</span> {ans.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Active Quiz Questions */
                    <div className="space-y-6">
                      {activeQuiz.questions?.map((q, qIndex) => (
                        <div
                          key={q._id || qIndex}
                          className="bg-[#041235] p-6 rounded-2xl border border-white/10 space-y-4"
                        >
                          <div className="flex items-baseline justify-between">
                            <h4 className="font-bold text-base text-white">Question {qIndex + 1}</h4>
                            <span className="text-xs text-gray-400 font-medium">{q.points} pt</span>
                          </div>

                          <p className="text-sm text-gray-200 leading-relaxed">{q.question}</p>

                          <div className="space-y-2 pt-2">
                            {q.options.map((opt, oIndex) => {
                              const isSelected = selectedAnswers[qIndex] === oIndex;
                              return (
                                <button
                                  key={oIndex}
                                  type="button"
                                  onClick={() => handleSelectOption(qIndex, oIndex)}
                                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium flex items-center gap-3 transition-colors ${
                                    isSelected
                                      ? 'bg-[#ff447e]/20 border-[#ff447e] text-white'
                                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                                      isSelected
                                        ? 'border-[#ff447e] bg-[#ff447e] text-white font-bold'
                                        : 'border-white/30 text-gray-400'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIndex)}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length === 0}
                        className="btn btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#ff447e]/20 disabled:opacity-40"
                      >
                        {isSubmittingQuiz ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            <span>Submit Quiz for Grading</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-sm text-gray-400">No quizzes available for this course.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Syllabus & Course Navigation Sidebar */}
        {isSidebarOpen && !isTheaterMode && (
          <>
            {/* Mobile Backdrop Overlay */}
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            />

            <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-88 md:w-96 lg:static lg:w-80 xl:w-96 bg-[#030d24] border-l border-white/10 flex flex-col shrink-0 overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
              {/* Sidebar Header */}
              <div className="p-4 md:p-5 border-b border-white/10 space-y-3 bg-[#041235]/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Course Curriculum</h3>
                    <p className="text-[11px] text-gray-400">
                      {lessons.length} lessons · {quizzes.length} quizzes
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Real-time search filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search lessons & topics..."
                    className="w-full bg-[#02091b] text-xs text-gray-200 pl-8 pr-3 py-2 rounded-xl border border-white/10 focus:border-[#ff447e] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Scrollable Lessons & Quizzes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Lessons Syllabus */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    <span>Lessons ({filteredLessons.length})</span>
                    <span>{calculatedProgress}% Done</span>
                  </div>

                  {filteredLessons.map((lesson: any, idx: number) => {
                    const originalIndex = lessons.findIndex((l: any) => l._id === lesson._id);
                    const isSelected = activeTab !== 'quiz' && activeLessonIndex === originalIndex;
                    const isCompleted =
                      lesson._id && completedLessonIds.includes(lesson._id.toString());

                    return (
                      <button
                        key={lesson._id || idx}
                        onClick={() => {
                          setActiveTab('overview');
                          setActiveLessonIndex(originalIndex !== -1 ? originalIndex : idx);
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff447e]/20 border-[#ff447e] text-white shadow-md shadow-[#ff447e]/10'
                            : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isSelected
                                ? 'bg-[#ff447e] text-white'
                                : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>

                          <div className="truncate">
                            <p className="text-xs font-semibold truncate text-white">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              <span>{lesson.duration || 20}m</span>
                              <span>•</span>
                              <span className="capitalize">{lesson.type || 'video'}</span>
                            </div>
                          </div>
                        </div>

                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quizzes Syllabus */}
                {quizzes.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Course Assessments
                    </span>
                    {quizzes.map((quiz) => {
                      const isSelected = activeTab === 'quiz' && selectedQuizId === quiz._id;
                      return (
                        <button
                          key={quiz._id}
                          onClick={() => {
                            setActiveTab('quiz');
                            setSelectedQuizId(quiz._id);
                            setQuizResult(null);
                            setSelectedAnswers({});
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#ff447e]/20 border-[#ff447e] text-white shadow-md shadow-[#ff447e]/10'
                              : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FileQuestion className="w-4 h-4 text-[#ff447e] shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate text-white">{quiz.title}</p>
                              <span className="text-[10px] text-gray-400">
                                {quiz.totalQuestions} Questions · {quiz.passingPercentage}% to pass
                              </span>
                            </div>
                          </div>

                          <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Instructor Footer */}
              {course.instructor && (
                <div className="p-4 border-t border-white/10 bg-[#041235]/40 flex items-center gap-3">
                  <img
                    src={
                      course.instructor.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={course.instructor.name || 'Instructor'}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="truncate">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      Course Instructor
                    </span>
                    <p className="text-xs font-bold text-white truncate">
                      {course.instructor.name || 'Mentor'}
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* Celebration Modal when reaching completion */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#061947] to-[#02091b] border border-[#ff447e]/40 p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl shadow-[#ff447e]/30 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-[#ff447e]/20 text-[#ff447e] flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">Course Completed! 🎉</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Congratulations! You have completed all units in <span className="font-bold text-white">{course.title}</span>. Your accomplishment is recorded in your profile.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCelebration(false)}
                className="btn btn-outline-white text-xs py-2.5 px-4"
              >
                Keep Reviewing
              </button>
              <Link href="/dashboard" className="btn btn-primary text-xs py-2.5 px-5 font-bold">
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#041235] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#ff447e]" />
                <span>Keyboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Next Lesson</span>
                <kbd className="px-2 py-1 rounded bg-[#02091b] border border-white/20 font-mono text-[10px] text-white">
                  N
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Previous Lesson</span>
                <kbd className="px-2 py-1 rounded bg-[#02091b] border border-white/20 font-mono text-[10px] text-white">
                  P
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Mark Lesson Complete</span>
                <kbd className="px-2 py-1 rounded bg-[#02091b] border border-white/20 font-mono text-[10px] text-white">
                  M
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Toggle Theater Mode</span>
                <kbd className="px-2 py-1 rounded bg-[#02091b] border border-white/20 font-mono text-[10px] text-white">
                  T
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Show Shortcuts</span>
                <kbd className="px-2 py-1 rounded bg-[#02091b] border border-white/20 font-mono text-[10px] text-white">
                  ?
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="btn btn-primary w-full py-2 text-xs font-bold mt-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
