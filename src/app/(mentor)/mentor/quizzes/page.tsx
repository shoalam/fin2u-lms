'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetMentorQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  MentorQuizItem,
  QuizQuestion,
} from '@/store/api/quizApi';
import {
  Award,
  FileQuestion,
  BookOpen,
  PlusCircle,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Check,
  Percent,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function MentorQuizzesPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter & Pagination States
  const [quizSearch, setQuizSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [quizSort, setQuizSort] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<MentorQuizItem | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    course: '',
    timeLimitMinutes: 15,
    passingPercentage: 70,
    isPublished: true,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        points: 1,
      },
    ],
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(quizSearch);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [quizSearch]);

  const {
    data: mentorQuizzesData,
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
    isFetching: isFetchingQuizzes,
  } = useGetMentorQuizzesQuery({
    courseId: selectedCourseFilter || undefined,
    status:
      selectedStatusFilter === 'all'
        ? undefined
        : selectedStatusFilter === 'published'
        ? 'true'
        : 'false',
    search: debouncedSearch || undefined,
    sort: quizSort,
    page: currentPage,
    limit: pageLimit,
  });

  const [createQuiz, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdatingQuiz }] = useUpdateQuizMutation();
  const [deleteQuiz, { isLoading: isDeletingQuiz }] = useDeleteQuizMutation();

  const quizzes = mentorQuizzesData?.quizzes || [];
  const pagination = mentorQuizzesData?.pagination || {
    total: 0,
    page: 1,
    limit: pageLimit,
    pages: 1,
  };
  const stats = mentorQuizzesData?.stats || {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCourses: 0,
    publishedQuizzes: 0,
  };
  const mentorCourses = mentorQuizzesData?.courses || [];

  const handleSort = (field: string) => {
    const [currentField, currentDir] = quizSort.split(':');
    if (currentField === field) {
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';
      setQuizSort(`${field}:${nextDir}`);
    } else {
      setQuizSort(`${field}:asc`);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDir] = quizSort.split(':');
    if (currentField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />;
    }
    return currentDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#ff447e]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#ff447e]" />
    );
  };

  const handleOpenCreateModal = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      course: mentorCourses[0]?._id || '',
      timeLimitMinutes: 15,
      passingPercentage: 70,
      isPublished: true,
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: '',
          points: 1,
        },
      ],
    });
    setQuizModalOpen(true);
  };

  const handleOpenEditModal = (quiz: MentorQuizItem) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      course: typeof quiz.course === 'object' ? quiz.course._id : (quiz.course as any) || '',
      timeLimitMinutes: quiz.timeLimitMinutes || 15,
      passingPercentage: quiz.passingPercentage || 70,
      isPublished: quiz.isPublished ?? true,
      questions:
        quiz.questions && quiz.questions.length > 0
          ? quiz.questions.map((q: any) => ({
              question: q.question || '',
              options: q.options || ['', '', '', ''],
              correctOptionIndex: q.correctOptionIndex || 0,
              explanation: q.explanation || '',
              points: q.points || 1,
            }))
          : [
              {
                question: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                explanation: '',
                points: 1,
              },
            ],
    });
    setQuizModalOpen(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.course) {
      alert('Please fill in required fields.');
      return;
    }

    try {
      if (editingQuiz) {
        await updateQuiz({
          id: editingQuiz._id,
          title: quizForm.title,
          description: quizForm.description,
          course: quizForm.course,
          timeLimitMinutes: quizForm.timeLimitMinutes,
          passingPercentage: quizForm.passingPercentage,
          isPublished: quizForm.isPublished,
          questions: quizForm.questions as any,
        }).unwrap();
      } else {
        await createQuiz({
          title: quizForm.title,
          description: quizForm.description,
          course: quizForm.course,
          timeLimitMinutes: quizForm.timeLimitMinutes,
          passingPercentage: quizForm.passingPercentage,
          isPublished: quizForm.isPublished,
          questions: quizForm.questions as any,
        }).unwrap();
      }
      setQuizModalOpen(false);
      refetchQuizzes();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save quiz');
    }
  };

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteQuiz(id).unwrap();
      refetchQuizzes();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleAddQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: '',
          points: 1,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    if (quizForm.questions.length <= 1) return;
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      const opts = [...updated[qIndex].options];
      opts[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return { ...prev, questions: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ff447e] text-xs font-bold border border-white/15">
            <Award className="w-3.5 h-3.5" />
            <span>Assessments & Certification Audits</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">Curriculum Quizzes & Exams</h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Configure passing grade thresholds, review student submission scores, and manage masterclass quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchQuizzes()}
            disabled={isFetchingQuizzes}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Assessments"
          >
            <RefreshCw className={`w-4 h-4 text-[#ff447e] ${isFetchingQuizzes ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary text-xs py-3 px-5 flex items-center gap-2 shadow-lg shadow-[#ff447e]/30 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Total Assessments</span>
          <p className="text-xl font-black text-[#041c53]">{stats.totalQuizzes}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Question Bank Size</span>
          <p className="text-xl font-black text-blue-600">{stats.totalQuestions}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Assessed Curricula</span>
          <p className="text-xl font-black text-indigo-600">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-gray-400">Published Active</span>
          <p className="text-xl font-black text-emerald-600">{stats.publishedQuizzes}</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search assessments by title..."
            value={quizSearch}
            onChange={(e) => setQuizSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
          />
          {quizSearch && (
            <button
              onClick={() => setQuizSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCourseFilter}
            onChange={(e) => {
              setSelectedCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e] max-w-[200px] truncate"
          >
            <option value="">All Authored Courses</option>
            {mentorCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <select
            value={quizSort}
            onChange={(e) => {
              setQuizSort(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="title:asc">Title (A-Z)</option>
            <option value="title:desc">Title (Z-A)</option>
            <option value="timeLimitMinutes:desc">Longest Duration</option>
            <option value="passingPercentage:desc">Highest Passing Grade</option>
          </select>

          <select
            value={pageLimit}
            onChange={(e) => {
              setPageLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes Content */}
      {isLoadingQuizzes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#041c53]">No Quizzes or Assessments Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {debouncedSearch || selectedCourseFilter || selectedStatusFilter !== 'all'
              ? 'No assessments matched your query. Try resetting filters.'
              : 'Create certification exams and quizzes for your authored masterclasses.'}
          </p>
          <button onClick={handleOpenCreateModal} className="btn btn-primary text-xs py-2.5 px-5">
            Create Assessment
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#ff447e] line-clamp-1 max-w-[140px]">
                    {q.course?.category || 'General'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      q.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {q.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[#041c53] line-clamp-1 group-hover:text-[#ff447e] transition-colors">
                    {q.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    Course: <span className="font-semibold text-gray-600">{q.course?.title || 'Masterclass'}</span>
                  </p>
                  {q.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1.5">{q.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Questions</span>
                    <span className="font-black text-[#041c53]">{q.totalQuestions || 0}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Pass Rate</span>
                    <span className="font-black text-emerald-600">{q.passingPercentage}%</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Duration</span>
                    <span className="font-black text-[#ff447e]">{q.timeLimitMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">
                  Created {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit Quiz"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(q._id, q.title)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                  <th
                    onClick={() => handleSort('title')}
                    className="py-3.5 px-5 cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assessment Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Associated Course</th>
                  <th className="py-3.5 px-4 text-center">Questions</th>
                  <th
                    onClick={() => handleSort('passingPercentage')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Passing Score</span>
                      {getSortIcon('passingPercentage')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('timeLimitMinutes')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Duration</span>
                      {getSortIcon('timeLimitMinutes')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {quizzes.map((q) => (
                  <tr key={q._id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-[#041c53]">{q.title}</p>
                        {q.description && (
                          <p className="text-[11px] text-gray-400 line-clamp-1">{q.description}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-700 line-clamp-1">{q.course?.title || 'Masterclass'}</p>
                      <span className="text-[10px] text-gray-400">{q.course?.category || 'General'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#041c53]">
                      {q.totalQuestions || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {q.passingPercentage}%
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-500 font-semibold">
                      {q.timeLimitMinutes} mins
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          q.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {q.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(q._id, q.title)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server Pagination Controls */}
      {pagination.total > 0 && (
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-[#041c53]">{(currentPage - 1) * pageLimit + 1}</span> to{' '}
            <span className="font-bold text-[#041c53]">
              {Math.min(currentPage * pageLimit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-[#041c53]">{pagination.total}</span> course assessments
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetchingQuizzes}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => {
                  if (pagination.pages <= 7) return true;
                  if (p === 1 || p === pagination.pages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (
                    idx > 0 &&
                    typeof arr[idx - 1] === 'number' &&
                    (p as number) - (arr[idx - 1] as number) > 1
                  ) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((pageItem, idx) => {
                  if (typeof pageItem === 'string') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  const isSelected = pageItem === currentPage;
                  return (
                    <button
                      key={pageItem}
                      onClick={() => setCurrentPage(pageItem)}
                      disabled={isFetchingQuizzes}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#ff447e] text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageItem}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={currentPage >= pagination.pages || isFetchingQuizzes}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUIZ MODAL */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">
                    {editingQuiz ? 'Edit Curriculum Assessment' : 'Create Course Assessment'}
                  </h3>
                  <p className="text-xs text-gray-400">Configure questions, duration, and pass score threshold.</p>
                </div>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Select Authored Course *
                  </label>
                  <select
                    required
                    value={quizForm.course}
                    onChange={(e) => setQuizForm({ ...quizForm, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="">-- Choose Course --</option>
                    {mentorCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 1 Certification Quiz"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions or scope of topics tested..."
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={quizForm.timeLimitMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Pass Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={quizForm.passingPercentage}
                    onChange={(e) => setQuizForm({ ...quizForm, passingPercentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={quizForm.isPublished ? 'true' : 'false'}
                    onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-[#041c53]">
                    Questions Bank ({quizForm.questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-[#ff447e] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {quizForm.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#041c53]">
                          Question #{qIndex + 1}
                        </span>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Enter the question prompt..."
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct-opt-${qIndex}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', optIdx)}
                              className="accent-[#ff447e]"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, optIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuiz || isUpdatingQuiz}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  {isCreatingQuiz || isUpdatingQuiz ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
