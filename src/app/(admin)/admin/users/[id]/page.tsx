'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminUserDetailsQuery,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useUpdateAdminUserMutation,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  ShieldCheck,
  ChevronLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  Award,
  GraduationCap,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Users,
  Briefcase,
  Copy,
  Check,
  Star,
  Lock,
  Unlock,
  RefreshCw,
  Edit,
  X,
  Link2,
  Share2,
} from 'lucide-react';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'orders' | 'teaching' | 'quizzes' | 'groups'
  >('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'mentor' | 'admin',
    headline: '',
    bio: '',
    isActive: true,
  });

  const {
    data: userDetails,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAdminUserDetailsQuery(userId, {
    skip: !userId || currentUser?.role !== 'admin',
  });

  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [toggleUserStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
  const [updateAdminUser, { isLoading: isSavingUser }] = useUpdateAdminUserMutation();

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

  const isSelf = user?._id === currentUser?._id;
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

  const handleOpenEdit = () => {
    if (!user) return;
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      headline: user.headline || '',
      bio: user.bio || '',
      isActive: user.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateAdminUser({ id: user._id, ...editForm }).unwrap();
      setEditModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update user record');
    }
  };

  return (
    <>
      <AdminHeader
        title={user ? `User Profile: ${user.name}` : 'User Profile Details'}
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </Link>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            {user && (
              <button
                onClick={handleOpenEdit}
                className="px-3.5 py-2 rounded-xl bg-[#ff447e] hover:bg-[#e03368] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Account</span>
              </button>
            )}
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {isLoading ? (
          <div className="p-20 text-center space-y-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
            <p className="text-xs text-gray-400 font-semibold">
              Loading user profile & activity records...
            </p>
          </div>
        ) : isError || !user ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-[#041c53]">User Account Not Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We could not find any active user corresponding to ID: {userId}.
            </p>
            <Link
              href="/admin/users"
              className="mt-2 px-4 py-2 rounded-xl bg-[#041c53] text-white text-xs font-bold hover:bg-[#ff447e] transition-colors inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Link>
          </div>
        ) : (
          <>
            {/* HERO PROFILE CARD */}
            <div className="bg-gradient-to-br from-[#041c53] via-[#092b77] to-[#041c53] text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start md:items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || 'User'
                        )}&background=ff447e&color=fff&size=160`
                      }
                      alt={user.name}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover border-4 shadow-lg ${
                        isActive ? 'border-white/20' : 'border-red-400 grayscale'
                      }`}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#041c53] ${
                        isActive ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      title={isActive ? 'Active Account' : 'Suspended Account'}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">{user.name}</h2>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-black uppercase">
                          You
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'admin'
                            ? 'bg-pink-500/20 text-[#ff88af] border border-pink-400/30'
                            : user.role === 'mentor'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        />
                        {isActive ? 'Active Status' : 'Suspended Status'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-white">{user.email}</span>
                        <button
                          onClick={() => handleCopy(user.email, 'email')}
                          className="p-1 hover:text-[#ff447e] rounded"
                          title="Copy email"
                        >
                          {copiedField === 'email' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Member Since:{' '}
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {user.headline && (
                      <p className="text-xs text-pink-200/90 font-medium italic pt-1">
                        &ldquo;{user.headline}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Role & Status Actions */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end justify-start gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15">
                    <span className="text-[11px] font-bold text-gray-300 pl-2">Role:</span>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(e.target.value as any)}
                      disabled={isSelf || isUpdatingRole}
                      className="px-3 py-1.5 bg-white text-gray-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Faculty Mentor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStatusToggle}
                      disabled={isSelf || isTogglingStatus}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-40 ${
                        isActive
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Suspend Account</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Reactivate Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/15">
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    Enrolled
                  </span>
                  <p className="text-xl font-black text-white">{stats.totalEnrolled}</p>
                  <span className="text-[10px] text-gray-300">Courses joined</span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    Completed
                  </span>
                  <p className="text-xl font-black text-emerald-400">{stats.completedCourses}</p>
                  <span className="text-[10px] text-gray-300">
                    {stats.totalEnrolled > 0
                      ? `${Math.round((stats.completedCourses / stats.totalEnrolled) * 100)}% finished`
                      : '0%'}
                  </span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    Avg Progress
                  </span>
                  <p className="text-xl font-black text-blue-300">{stats.avgProgress}%</p>
                  <span className="text-[10px] text-gray-300">Course completion</span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    Total Spent
                  </span>
                  <p className="text-xl font-black text-[#ff88af]">
                    RM {stats.totalSpent.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-gray-300">Total fees paid</span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    Quizzes
                  </span>
                  <p className="text-xl font-black text-purple-300">{stats.quizzesTaken}</p>
                  <span className="text-[10px] text-gray-300">{stats.quizzesPassed} passed</span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-gray-300 block mb-0.5">
                    {user.role === 'mentor' ? 'Revenue' : 'Created'}
                  </span>
                  <p className="text-xl font-black text-amber-300">
                    {user.role === 'mentor'
                      ? `RM ${stats.totalRevenue.toFixed(2)}`
                      : `${stats.totalCoursesCreated} Courses`}
                  </p>
                  <span className="text-[10px] text-gray-300">
                    {user.role === 'mentor'
                      ? `${stats.totalStudentsTaught} students`
                      : `${stats.totalPublishedCourses} published`}
                  </span>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-[#041c53] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile & Identity</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'courses'
                    ? 'bg-[#041c53] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Enrolled Courses ({enrollments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-[#041c53] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Orders & Payments ({orders.length})</span>
              </button>

              {(user.role === 'mentor' || createdCourses.length > 0) && (
                <button
                  onClick={() => setActiveTab('teaching')}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeTab === 'teaching'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Teaching & Royalties ({createdCourses.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'quizzes'
                    ? 'bg-[#041c53] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Assessments ({quizAttempts.length})</span>
              </button>

              {groups.length > 0 && (
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeTab === 'groups'
                      ? 'bg-[#041c53] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Groups ({groups.length})</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                {/* Contact Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <UserIcon className="w-4 h-4 text-[#ff447e]" />
                    <span>Personal Details & Demographics</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Full Name
                      </span>
                      <p className="font-bold text-gray-800">{user.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Nickname
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
                        Physical Address
                      </span>
                      <p className="font-semibold text-gray-800">
                        {[user.address, user.city, user.state, user.postalCode, user.country]
                          .filter(Boolean)
                          .join(', ') || 'No address registered'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Specific Configuration */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Role Specialization & Accreditation</span>
                  </h4>

                  {user.role === 'mentor' && user.mentorProfile ? (
                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Accreditation Status
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
                                HRDC Accredited
                              </>
                            ) : (
                              'Standard Faculty'
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Trainer ID
                          </span>
                          <p className="font-semibold text-gray-800">
                            {user.mentorProfile.hrdcTrainerId || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Experience
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
                            Skills & Expertise
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {user.mentorProfile.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.mentorProfile.bankAccount && (
                        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Payout Bank Details
                          </span>
                          <p className="font-bold text-gray-800">
                            {user.mentorProfile.bankAccount.bankName || 'Bank'} •{' '}
                            {user.mentorProfile.bankAccount.accountNo || 'No account number'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Account Holder: {user.mentorProfile.bankAccount.accountHolder || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : user.role === 'student' ? (
                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            Language
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
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                          Personal Learning Goals
                        </span>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs leading-relaxed">
                          {user.studentProfile?.learningGoals ||
                            user.learningGoals ||
                            'No explicit learning goals submitted.'}
                        </p>
                      </div>

                      {user.studentProfile?.interests &&
                        user.studentProfile.interests.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Interests & Topics
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {user.studentProfile.interests.map((interest, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-xs">
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
                          Administrative Privileges
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

                {/* Education & Experience */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Education & Background</span>
                  </h4>

                  {user.education?.institution || user.education?.highestDegree ? (
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-gray-800 text-sm">
                        {user.education.highestDegree || 'Degree'}{' '}
                        {user.education.fieldOfStudy ? `in ${user.education.fieldOfStudy}` : ''}
                      </p>
                      <p className="text-gray-500">
                        {user.education.institution || 'Institution'}{' '}
                        {user.education.graduationYear ? `(${user.education.graduationYear})` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No education history recorded.</p>
                  )}

                  {user.experience?.company || user.experience?.currentRole ? (
                    <div className="pt-3 border-t border-gray-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Work Experience
                      </span>
                      <p className="font-bold text-gray-800">
                        {user.experience.currentRole || 'Role'} at{' '}
                        {user.experience.company || 'Company'}
                      </p>
                      <p className="text-gray-500">
                        {user.experience.industry || 'Industry'}{' '}
                        {user.experience.yearsOfExperience
                          ? `• ${user.experience.yearsOfExperience} yrs`
                          : ''}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Biography & Social */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black text-[#041c53] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Biography & Web Channels</span>
                  </h4>

                  {user.bio ? (
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No biography description available.</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Facebook</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB COURSES */}
            {activeTab === 'courses' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-150">
                {enrollments.length === 0 ? (
                  <div className="p-16 text-center space-y-2">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="text-sm font-bold text-[#041c53]">No Enrolled Courses</h4>
                    <p className="text-xs text-gray-400">
                      User has not enrolled in any platform courses.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          <th className="py-3.5 px-5">Course Title</th>
                          <th className="py-3.5 px-4">Instructor</th>
                          <th className="py-3.5 px-4 text-center">Progress %</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-5 text-right">Enrolled At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {enrollments.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-5">
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
                                    {item.course?.title || 'Course'}
                                  </p>
                                  <span className="text-[10px] text-gray-400 font-semibold">
                                    {item.course?.category || 'General'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-gray-600">
                              {item.course?.instructor?.name || 'Fin2u Mentor'}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.progress >= 100 ? 'bg-emerald-500' : 'bg-[#ff447e]'
                                    }`}
                                    style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-gray-800 text-xs">
                                  {item.progress || 0}%
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
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

                            <td className="py-3.5 px-5 text-right text-gray-400 text-[11px]">
                              {item.enrolledAt
                                ? new Date(item.enrolledAt).toLocaleDateString()
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

            {/* TAB ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-150">
                {orders.length === 0 ? (
                  <div className="p-16 text-center space-y-2">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="text-sm font-bold text-[#041c53]">No Orders Found</h4>
                    <p className="text-xs text-gray-400">
                      User has not placed any payment orders.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          <th className="py-3.5 px-5">Order #</th>
                          <th className="py-3.5 px-4">Purchased Course</th>
                          <th className="py-3.5 px-4 text-right">Amount</th>
                          <th className="py-3.5 px-4 text-center">Payment Gateway</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {orders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-[#041c53]">
                              {ord.orderNumber}
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-gray-800">
                              {ord.courseSnapshot?.title ||
                                ord.course?.title ||
                                'Course Purchase'}
                            </td>

                            <td className="py-3.5 px-4 text-right font-black text-[#ff447e]">
                              {ord.currency || 'MYR'} {((ord.amount || 0) / 100).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">
                                {ord.gateway || 'Card'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  ord.status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : ord.status === 'failed' || ord.status === 'canceled'
                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-5 text-right text-gray-400 text-[11px]">
                              {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleDateString()
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

            {/* TAB TEACHING */}
            {activeTab === 'teaching' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {createdCourses.map((c) => (
                    <div
                      key={c._id}
                      className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            c.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs font-bold text-[#ff447e]">
                          {c.price === 0 ? 'Free' : `RM ${c.price}`}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#041c53] line-clamp-2">{c.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {c.enrollmentCount || 0} students
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {c.rating || 5.0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB QUIZZES */}
            {activeTab === 'quizzes' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-150">
                {quizAttempts.length === 0 ? (
                  <div className="p-16 text-center space-y-2">
                    <Award className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="text-sm font-bold text-[#041c53]">No Quizzes Attempted</h4>
                    <p className="text-xs text-gray-400">
                      User has not completed any quiz assessments yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          <th className="py-3.5 px-5">Quiz Title</th>
                          <th className="py-3.5 px-4 text-center">Score / Total</th>
                          <th className="py-3.5 px-4 text-center">Percentage</th>
                          <th className="py-3.5 px-4 text-center">Outcome</th>
                          <th className="py-3.5 px-5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {quizAttempts.map((q) => (
                          <tr key={q._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-5">
                              <p className="font-bold text-[#041c53]">
                                {q.quiz?.title || 'Quiz'}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                {q.course?.title}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center font-bold">
                              {q.score} / {q.totalPoints}
                            </td>

                            <td className="py-3.5 px-4 text-center font-black text-blue-600">
                              {q.percentage}%
                            </td>

                            <td className="py-3.5 px-4 text-center">
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

                            <td className="py-3.5 px-5 text-right text-gray-400 text-[11px]">
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
          </>
        )}
      </main>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#041c53]">Edit User Account</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  New Password (leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="student">Student Learner</option>
                  <option value="mentor">Faculty Mentor</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={editForm.headline}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 rounded-xl bg-[#ff447e] hover:bg-[#e03368] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingUser ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
