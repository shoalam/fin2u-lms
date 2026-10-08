'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGetAdminUserDetailsQuery,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
} from '@/store/api/adminApi';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Award,
  GraduationCap,
  BookOpen,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield,
  CreditCard,
  HelpCircle,
  Users,
  Briefcase,
  Copy,
  Check,
  Star,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  Building2,
  Sparkles,
  Share2,
  Link2,
} from 'lucide-react';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser?: (user: any) => void;
  currentAdminId?: string;
}

export default function UserDetailsModal({
  userId,
  isOpen,
  onClose,
  onEditUser,
  currentAdminId,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'orders' | 'teaching' | 'quizzes' | 'groups'
  >('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    data: userDetails,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAdminUserDetailsQuery(userId || '', {
    skip: !isOpen || !userId,
  });

  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [toggleUserStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();

  if (!isOpen || !userId) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const user = userDetails?.user;
  const enrollments = userDetails?.enrollments || [];
  const orders = userDetails?.orders || [];
  const quizAttempts = userDetails?.quizAttempts || [];
  const createdCourses = userDetails?.createdCourses || [];
  const salesOrders = userDetails?.salesOrders || [];
  const groups = userDetails?.groups || [];
  const stats = userDetails?.stats || {
    totalEnrolled: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    avgProgress: 0,
    totalSpent: 0,
    quizzesTaken: 0,
    quizzesPassed: 0,
    totalCoursesCreated: 0,
    totalPublishedCourses: 0,
    totalStudentsTaught: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalReviews: 0,
  };

  const isSelf = user?._id === currentAdminId;
  const isActive = user?.isActive !== false;

  const handleRoleChange = async (newRole: 'student' | 'mentor' | 'admin') => {
    if (!user) return;
    try {
      await updateUserRole({ id: user._id, role: newRole }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    if (isSelf) {
      alert('Cannot suspend your own active administrator account');
      return;
    }
    const nextStatus = !isActive;
    try {
      await toggleUserStatus({ id: user._id, isActive: nextStatus }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#ff447e] shrink-0">
              <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight">
                  User Intelligence Profile
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/15 border border-white/20 text-white">
                  Admin Inspection
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-gray-300">
                Detailed verification, activities, learning history, and financial transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Refresh profile details"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href={`/admin/users/${userId}`}
              target="_blank"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Open full page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Full Page</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
              <p className="text-xs text-gray-400 font-semibold">
                Loading complete user profile & activities...
              </p>
            </div>
          ) : isError || !user ? (
            <div className="p-12 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">Failed to Load User Details</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Unable to retrieve details for user ID: {userId}. The user might have been deleted.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-[#041c53] text-white text-xs font-bold hover:bg-[#ff447e] transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <>
              {/* PRIMARY PROFILE CARD */}
              <div className="bg-gradient-to-br from-gray-50 via-pink-50/20 to-purple-50/20 border border-gray-200/80 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Avatar + Main Info */}
                  <div className="flex items-start md:items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name || 'User'
                          )}&background=ff447e&color=fff&size=128`
                        }
                        alt={user.name}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 shadow-md ${
                          isActive ? 'border-white' : 'border-red-400 grayscale'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          isActive ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        title={isActive ? 'Active User' : 'Suspended User'}
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg md:text-xl font-black text-[#041c53] truncate">
                          {user.name}
                        </h3>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                            You (Current Admin)
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            user.role === 'admin'
                              ? 'bg-pink-50 text-[#ff447e] border-pink-200'
                              : user.role === 'mentor'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                            }`}
                          />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-700">{user.email}</span>
                          <button
                            onClick={() => handleCopy(user.email, 'email')}
                            className="p-1 hover:text-[#ff447e] rounded"
                            title="Copy email"
                          >
                            {copiedField === 'email' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            Joined:{' '}
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {user.headline && (
                        <p className="text-xs text-[#041c53]/80 font-medium italic">
                          &ldquo;{user.headline}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Role dropdown, Status toggle, Edit modal) */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end justify-start md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400">Role:</span>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(e.target.value as any)}
                        disabled={isSelf || isUpdatingRole}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ff447e] cursor-pointer disabled:opacity-50"
                      >
                        <option value="student">Student Learner</option>
                        <option value="mentor">Faculty Mentor</option>
                        <option value="admin">Platform Admin</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleStatusToggle}
                        disabled={isSelf || isTogglingStatus}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-40 ${
                          isActive
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Suspend Login</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Activate Account</span>
                          </>
                        )}
                      </button>

                      {onEditUser && (
                        <button
                          onClick={() => {
                            onClose();
                            onEditUser(user);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-colors"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* KEY PERFORMANCE & ENGAGEMENT METRICS BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-gray-200/60">
                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      Enrolled
                    </span>
                    <p className="text-base font-black text-[#041c53]">{stats.totalEnrolled}</p>
                    <span className="text-[10px] text-gray-400">Courses joined</span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      Completed
                    </span>
                    <p className="text-base font-black text-emerald-600">{stats.completedCourses}</p>
                    <span className="text-[10px] text-emerald-600/80">
                      {stats.totalEnrolled > 0
                        ? `${Math.round((stats.completedCourses / stats.totalEnrolled) * 100)}% finished`
                        : 'No courses'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      Avg Progress
                    </span>
                    <p className="text-base font-black text-blue-600">{stats.avgProgress}%</p>
                    <span className="text-[10px] text-gray-400">Course completion</span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      Total Spent
                    </span>
                    <p className="text-base font-black text-[#ff447e]">
                      RM {stats.totalSpent.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-gray-400">Purchases & fees</span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      Quizzes Taken
                    </span>
                    <p className="text-base font-black text-purple-600">{stats.quizzesTaken}</p>
                    <span className="text-[10px] text-purple-600/80">
                      {stats.quizzesPassed} passed
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-0.5">
                      {user.role === 'mentor' ? 'Revenue' : 'Created'}
                    </span>
                    <p className="text-base font-black text-amber-600">
                      {user.role === 'mentor'
                        ? `RM ${stats.totalRevenue.toFixed(2)}`
                        : `${stats.totalCoursesCreated} Courses`}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {user.role === 'mentor'
                        ? `${stats.totalStudentsTaught} students taught`
                        : `${stats.totalPublishedCourses} published`}
                    </span>
                  </div>
                </div>
              </div>

              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-b border-gray-100 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile & Bio</span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'courses'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Enrolled Courses ({enrollments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Orders & Payments ({orders.length})</span>
                </button>

                {(user.role === 'mentor' || createdCourses.length > 0) && (
                  <button
                    onClick={() => setActiveTab('teaching')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      activeTab === 'teaching'
                        ? 'bg-[#041c53] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Teaching & Sales ({createdCourses.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'quizzes'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Quizzes ({quizAttempts.length})</span>
                </button>

                {groups.length > 0 && (
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      activeTab === 'groups'
                        ? 'bg-[#041c53] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Groups ({groups.length})</span>
                  </button>
                )}
              </div>

              {/* TAB 1: OVERVIEW & PROFILE */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                  {/* Personal & Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                      <UserIcon className="w-4 h-4 text-[#ff447e]" />
                      <span>Personal & Contact Credentials</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Full Name
                        </span>
                        <p className="font-bold text-gray-800">{user.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Nickname / Display
                        </span>
                        <p className="font-semibold text-gray-800">{user.nickname || 'None'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Email Address
                        </span>
                        <p className="font-semibold text-gray-800 break-all">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Phone Number
                        </span>
                        <p className="font-semibold text-gray-800">{user.phone || 'Not provided'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Gender & DOB
                        </span>
                        <p className="font-semibold text-gray-800">
                          {user.gender || 'Unspecified'} {user.dob ? `• ${user.dob}` : ''}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Nationality / NRIC
                        </span>
                        <p className="font-semibold text-gray-800">
                          {user.nationality || 'Unspecified'}{' '}
                          {user.nationalId ? `(${user.nationalId})` : ''}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Location & Address
                        </span>
                        <p className="font-semibold text-gray-800">
                          {[user.address, user.city, user.state, user.postalCode, user.country]
                            .filter(Boolean)
                            .join(', ') || 'No address provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Specific & Professional Information */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span>Role & Professional Profile</span>
                    </h4>

                    {user.role === 'mentor' && user.mentorProfile ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              HRDC Accreditation
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-xs ${
                                user.mentorProfile.hrdcAccredited
                                  ? 'text-emerald-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {user.mentorProfile.hrdcAccredited ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Accredited Trainer
                                </>
                              ) : (
                                'Standard Mentor'
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Trainer ID / Ref
                            </span>
                            <p className="font-semibold text-gray-800">
                              {user.mentorProfile.hrdcTrainerId || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Years Experience
                            </span>
                            <p className="font-semibold text-gray-800">
                              {user.mentorProfile.yearsOfExperience || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Hourly Rate
                            </span>
                            <p className="font-bold text-[#ff447e]">
                              RM {user.mentorProfile.hourlyRate || 0} / hr
                            </p>
                          </div>
                        </div>

                        {user.mentorProfile.skills && user.mentorProfile.skills.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Expertise & Skills
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {user.mentorProfile.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {user.mentorProfile.bankAccount && (
                          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Payout Bank Account
                            </span>
                            <p className="font-bold text-gray-800">
                              {user.mentorProfile.bankAccount.bankName || 'Bank unspecified'} •{' '}
                              {user.mentorProfile.bankAccount.accountNo || 'No account number'}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Holder: {user.mentorProfile.bankAccount.accountHolder || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : user.role === 'student' ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Preferred Language
                            </span>
                            <p className="font-semibold text-gray-800">
                              {user.studentProfile?.preferredLanguage ||
                                user.preferredLanguage ||
                                'English'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Timezone
                            </span>
                            <p className="font-semibold text-gray-800">
                              {user.studentProfile?.timeZone ||
                                user.timeZone ||
                                'Asia/Kuala_Lumpur'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Learning Objectives & Goals
                          </span>
                          <p className="text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                            {user.studentProfile?.learningGoals ||
                              user.learningGoals ||
                              'No specific learning goal submitted yet.'}
                          </p>
                        </div>

                        {user.studentProfile?.interests &&
                          user.studentProfile.interests.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                Topic Interests
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {user.studentProfile.interests.map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Staff ID
                            </span>
                            <p className="font-bold text-[#041c53]">
                              {user.adminProfile?.staffId || user.staffId || 'ADMIN-CORE'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Department
                            </span>
                            <p className="font-semibold text-gray-800">
                              {user.adminProfile?.department || user.department || 'Management'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            System Permissions
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(user.adminProfile?.permissions ||
                              user.permissions || ['full_access', 'user_management', 'course_moderation']
                            ).map((perm, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl bg-pink-50 text-[#ff447e] text-[10px] font-extrabold border border-pink-200 uppercase"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Academic & Experience */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Education & Background</span>
                    </h4>

                    {user.education?.institution || user.education?.highestDegree ? (
                      <div className="space-y-1.5 text-xs">
                        <p className="font-bold text-gray-800">
                          {user.education.highestDegree || 'Degree'}{' '}
                          {user.education.fieldOfStudy ? `in ${user.education.fieldOfStudy}` : ''}
                        </p>
                        <p className="text-gray-500">
                          {user.education.institution || 'University'}{' '}
                          {user.education.graduationYear
                            ? `(${user.education.graduationYear})`
                            : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No education records provided by user.
                      </p>
                    )}

                    {user.experience?.company || user.experience?.currentRole ? (
                      <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Current Employment
                        </span>
                        <p className="font-bold text-gray-800">
                          {user.experience.currentRole || 'Role'} at{' '}
                          {user.experience.company || 'Company'}
                        </p>
                        <p className="text-gray-500">
                          {user.experience.industry || 'General Industry'}{' '}
                          {user.experience.yearsOfExperience
                            ? `• ${user.experience.yearsOfExperience} yrs experience`
                            : ''}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Social Profiles & Bio */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Social Presence & Bio</span>
                    </h4>

                    {user.bio ? (
                      <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        {user.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No biography description written.</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {user.website && (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Website</span>
                        </a>
                      )}
                      {user.social?.linkedin && (
                        <a
                          href={user.social.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {user.social?.github && (
                        <a
                          href={user.social.github}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {user.social?.twitter && (
                        <a
                          href={user.social.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5 text-sky-500" />
                          <span>Twitter</span>
                        </a>
                      )}
                      {user.social?.facebook && (
                        <a
                          href={user.social.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENROLLED COURSES */}
              {activeTab === 'courses' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {enrollments.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-700">No Enrolled Courses</h4>
                      <p className="text-xs text-gray-400">
                        This user has not enrolled in any LMS courses yet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                              <th className="py-3 px-4">Course Title & Category</th>
                              <th className="py-3 px-4">Instructor</th>
                              <th className="py-3 px-4 text-center">Progress %</th>
                              <th className="py-3 px-4 text-center">Enrollment Status</th>
                              <th className="py-3 px-4 text-right">Enrolled Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                            {enrollments.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    {item.course?.thumbnail ? (
                                      <img
                                        src={item.course.thumbnail}
                                        alt={item.course.title}
                                        className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold text-xs shrink-0">
                                        <BookOpen className="w-5 h-5" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-[#041c53]">
                                        {item.course?.title || 'Unknown Course'}
                                      </p>
                                      <span className="text-[10px] text-gray-400 font-semibold">
                                        {item.course?.category || 'General'} •{' '}
                                        <span className="capitalize">{item.course?.type || 'Standard'}</span>
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-gray-600">
                                  {item.course?.instructor?.name || 'Fin2u Faculty'}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          item.progress >= 100 ? 'bg-emerald-500' : 'bg-[#ff447e]'
                                        }`}
                                        style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                                      />
                                    </div>
                                    <span className="font-bold text-gray-800 text-[11px]">
                                      {item.progress || 0}%
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                      item.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : item.status === 'cancelled'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}
                                  >
                                    {item.status || 'Active'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right text-gray-400 text-[11px]">
                                  {item.enrolledAt
                                    ? new Date(item.enrolledAt).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ORDERS & PAYMENTS */}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-700">No Transaction History</h4>
                      <p className="text-xs text-gray-400">
                        This user has not placed any payment orders or subscriptions yet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                              <th className="py-3 px-4">Order ID & Date</th>
                              <th className="py-3 px-4">Item / Course</th>
                              <th className="py-3 px-4 text-right">Amount</th>
                              <th className="py-3 px-4 text-center">Payment Gateway</th>
                              <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                            {orders.map((ord) => (
                              <tr key={ord._id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-[#041c53]">{ord.orderNumber}</p>
                                  <span className="text-[10px] text-gray-400">
                                    {ord.createdAt
                                      ? new Date(ord.createdAt).toLocaleString()
                                      : 'N/A'}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <p className="font-semibold text-gray-800">
                                    {ord.courseSnapshot?.title ||
                                      ord.course?.title ||
                                      'Course Enrollment'}
                                  </p>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <span className="font-black text-[#ff447e]">
                                    {ord.currency || 'MYR'} {((ord.amount || 0) / 100).toFixed(2)}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">
                                    {ord.gateway || 'Card'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                      ord.status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : ord.status === 'failed' || ord.status === 'canceled'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : ord.status === 'refunded'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TEACHING & COURSES (MENTOR) */}
              {activeTab === 'teaching' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {createdCourses.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-700">No Authored Courses</h4>
                      <p className="text-xs text-gray-400">
                        This mentor has not created any platform courses yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {createdCourses.map((c) => (
                          <div
                            key={c._id}
                            className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                  c.isPublished
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {c.isPublished ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-xs font-bold text-[#ff447e]">
                                {c.price === 0 ? 'Free' : `RM ${c.price}`}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-[#041c53] line-clamp-2">
                              {c.title}
                            </h5>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-500" />
                                {c.enrollmentCount || 0} students
                              </span>
                              <span className="flex items-center gap-1 font-bold text-amber-600">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {c.rating || 5.0} ({c.ratingCount || 0})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mentor Sales Activity */}
                      {salesOrders.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-200 p-4 space-y-3 shadow-xs">
                          <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span>Recent Student Purchases & Royalties</span>
                          </h4>
                          <div className="divide-y divide-gray-100 text-xs">
                            {salesOrders.slice(0, 10).map((sale) => (
                              <div
                                key={sale._id}
                                className="py-2.5 flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {sale.user?.name || 'Student'}
                                  </p>
                                  <span className="text-[10px] text-gray-400">
                                    {sale.course?.title} •{' '}
                                    {sale.paidAt
                                      ? new Date(sale.paidAt).toLocaleDateString()
                                      : 'Paid'}
                                  </span>
                                </div>
                                <span className="font-extrabold text-emerald-600">
                                  + RM {((sale.amount || 0) / 100).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: QUIZZES */}
              {activeTab === 'quizzes' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {quizAttempts.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-700">No Quiz Submissions</h4>
                      <p className="text-xs text-gray-400">
                        This user has not attempted any quizzes or exams yet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                            <th className="py-3 px-4">Quiz & Course</th>
                            <th className="py-3 px-4 text-center">Score / Points</th>
                            <th className="py-3 px-4 text-center">Percentage</th>
                            <th className="py-3 px-4 text-center">Outcome</th>
                            <th className="py-3 px-4 text-right">Attempt Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {quizAttempts.map((q) => (
                            <tr key={q._id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-bold text-[#041c53]">
                                  {q.quiz?.title || 'Course Quiz'}
                                </p>
                                <span className="text-[10px] text-gray-400">
                                  {q.course?.title || 'General'}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center font-bold">
                                {q.score} / {q.totalPoints}
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span className="font-extrabold text-xs text-blue-600">
                                  {q.percentage}%
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    q.passed
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-red-50 text-red-600 border border-red-200'
                                  }`}
                                >
                                  {q.passed ? 'Passed' : 'Failed'}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right text-gray-400 text-[11px]">
                                {q.completedAt
                                  ? new Date(q.completedAt).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: GROUPS */}
              {activeTab === 'groups' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                  {groups.map((grp) => (
                    <div
                      key={grp._id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-[#041c53] truncate">{grp.name}</h5>
                          <span className="text-[10px] text-gray-400">
                            {grp.memberCount || 1} members • {grp.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                      </div>
                      {grp.description && (
                        <p className="text-[11px] text-gray-600 line-clamp-2">{grp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-400">ID: {userId}</span>
            <button
              onClick={() => handleCopy(userId, 'userid')}
              className="p-1 hover:text-[#ff447e] rounded"
              title="Copy User ID"
            >
              {copiedField === 'userid' ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
