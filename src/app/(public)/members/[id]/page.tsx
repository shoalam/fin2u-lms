'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  useGetPublicProfileQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionMutation,
  useDeclineConnectionMutation,
  useRemoveConnectionMutation,
  useUnblockUserMutation,
} from '@/store/api/socialApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  UserPlus,
  UserCheck,
  Clock,
  Mail,
  Flag,
  ShieldBan,
  Globe,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Briefcase,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import ReportModal from '@/components/social/ReportModal';
import BlockModal from '@/components/social/BlockModal';
import CommunityAuthGate from '@/components/common/CommunityAuthGate';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MemberProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const currentUserId = currentUser?._id || (currentUser as any)?.id;

  const { data: profileData, isLoading, refetch } = useGetPublicProfileQuery(userId, {
    skip: !isAuthenticated,
  });

  // Connection mutations
  const [sendRequest, { isLoading: isSendingReq }] = useSendConnectionRequestMutation();
  const [acceptRequest, { isLoading: isAccepting }] = useAcceptConnectionMutation();
  const [declineRequest, { isLoading: isDeclining }] = useDeclineConnectionMutation();
  const [removeConnection, { isLoading: isRemoving }] = useRemoveConnectionMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'about' | 'courses' | 'groups'>('about');

  if (!isAuthenticated) {
    return (
      <CommunityAuthGate
        feature="Member Profile"
        title="Sign In to View Member Profile"
        description="View peer credentials, enrolled courses, mutual groups, connect with peers, and exchange direct messages."
      />
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e]" />
          <p className="text-xs font-semibold mt-4">Loading member profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!profileData?.user) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Member Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The member profile you are looking for does not exist or may have been deactivated.
            </p>
            <div className="pt-2">
              <Link href="/members" className="btn btn-primary text-xs py-3 w-full">
                Return to Member Directory
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { user, groups = [], courses = [], connectionStatus, connectionId, isBlocked } = profileData;
  const isSelf = currentUserId === user._id || connectionStatus === 'self';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleConnectAction = async () => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/members/${userId}`);
      return;
    }

    try {
      if (connectionStatus === 'none') {
        await sendRequest(userId).unwrap();
      } else if (connectionStatus === 'pending_received' && connectionId) {
        await acceptRequest({ connectionId, targetUserId: userId }).unwrap();
      } else if (connectionStatus === 'pending_sent' || connectionStatus === 'connected') {
        if (confirm('Are you sure you want to remove or cancel this connection?')) {
          await removeConnection(userId).unwrap();
        }
      }
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Connection action failed');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(userId).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to unblock user');
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
        {/* Cover & Hero Section */}
        <div className="relative">
          <div className="h-56 sm:h-72 w-full bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff447e]/20 via-transparent to-transparent" />
            <div className="max-w-[1200px] mx-auto h-full px-6 flex items-start pt-6">
              <Link
                href="/members"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Members</span>
              </Link>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="max-w-[1200px] mx-auto px-6 -mt-20 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {/* Left: Avatar & Identity */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  <div className="relative">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-100 dark:bg-slate-800"
                    />
                    <span
                      className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        user.role === 'admin'
                          ? 'bg-purple-600 text-white'
                          : user.role === 'mentor'
                          ? 'bg-[#ff447e] text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {user.name}
                      </h1>
                      {user.role === 'mentor' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ff447e]/10 text-[#ff447e] text-xs font-bold">
                          <Award className="w-3.5 h-3.5" />
                          <span>Verified Mentor</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 line-clamp-1">
                      {user.headline || (user.role === 'mentor' ? 'Industry Instructor & Expert' : 'Fin2u Learner & Member')}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                      {user.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
                        </span>
                      )}
                      {user.website && (
                        <a
                          href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#ff447e] hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Website</span>
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Joined {user.createdAt ? new Date(user.createdAt).getFullYear() : 'Fin2u'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!isSelf && (
                    <>
                      {/* Connection Button */}
                      {isBlocked ? (
                        <button
                          onClick={handleUnblock}
                          disabled={isUnblocking}
                          className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-200 dark:border-rose-800"
                        >
                          {isUnblocking ? 'Unblocking...' : 'Unblock Member'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleConnectAction}
                            disabled={isSendingReq || isAccepting || isDeclining || isRemoving}
                            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                              connectionStatus === 'connected'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                                : connectionStatus === 'pending_sent'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : connectionStatus === 'pending_received'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                : 'bg-[#041c53] hover:bg-[#082977] text-white shadow-[#041c53]/20'
                            }`}
                          >
                            {connectionStatus === 'connected' ? (
                              <>
                                <UserCheck className="w-4 h-4" />
                                <span>Connected</span>
                              </>
                            ) : connectionStatus === 'pending_sent' ? (
                              <>
                                <Clock className="w-4 h-4" />
                                <span>Request Pending</span>
                              </>
                            ) : connectionStatus === 'pending_received' ? (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Accept Request</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>

                          {/* Direct Message */}
                          <Link
                            href={`/messages?userId=${user._id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold border border-pink-200 dark:border-pink-900 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Message</span>
                          </Link>
                        </>
                      )}
                    </>
                  )}

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Share Profile"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  {!isSelf && (
                    <div className="flex items-center gap-1">
                      {/* Report Button */}
                      <button
                        onClick={() => setIsReportOpen(true)}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Report Member"
                      >
                        <Flag className="w-4 h-4" />
                      </button>

                      {/* Block Button */}
                      {!isBlocked && (
                        <button
                          onClick={() => setIsBlockOpen(true)}
                          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Block Member"
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
                {[
                  { id: 'about', label: 'About & Bio', icon: GraduationCap },
                  { id: 'courses', label: user.role === 'mentor' ? 'Taught Courses' : 'Enrolled Courses', count: courses.length, icon: BookOpen },
                  { id: 'groups', label: 'Communities & Groups', count: groups.length, icon: Users },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#041c53] text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="max-w-[1200px] mx-auto px-6 mt-8">
          {/* TAB 1: About */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Bio card */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Biography</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {user.bio || `${user.name} is a valued member of the Fin2u Academy learning platform.`}
                  </p>
                </div>

                {/* Experience & Education */}
                {(user.experience?.company || user.experience?.currentRole || user.education?.institution) && (
                  <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Background & Experience</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.experience?.currentRole && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-2 text-[#ff447e] text-xs font-bold">
                            <Briefcase className="w-4 h-4" />
                            <span>Current Role</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {user.experience.currentRole}
                          </div>
                          {user.experience.company && (
                            <div className="text-xs text-slate-500">{user.experience.company}</div>
                          )}
                        </div>
                      )}

                      {user.education?.institution && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold">
                            <GraduationCap className="w-4 h-4" />
                            <span>Education</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {user.education.highestDegree || 'Degree'}
                          </div>
                          <div className="text-xs text-slate-500">{user.education.institution}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Quick Stats */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Community Snapshot</h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-slate-500">Platform Role</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize">{user.role}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-slate-500">Communities</span>
                      <span className="font-bold text-slate-900 dark:text-white">{groups.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-slate-500">{user.role === 'mentor' ? 'Courses Published' : 'Courses Enrolled'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{courses.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Courses */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {courses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Public Courses Available</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This member has no publicly listed course records.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {courses.map((course: any) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course.slug}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <BookOpen className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#ff447e] transition-colors line-clamp-2">
                            {course.title}
                          </h4>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80 mt-2">
                        <span className="font-extrabold text-[#041c53] dark:text-pink-400">
                          {course.price ? `RM ${course.price}` : 'Free'}
                        </span>
                        <span className="text-[11px] text-[#ff447e] font-bold group-hover:underline inline-flex items-center">
                          View Course <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Groups */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              {groups.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Public Communities</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This member is not currently participating in public groups.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {groups.map((group: any) => (
                    <Link
                      key={group._id}
                      href={`/groups/${group.slug}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                        {group.avatar ? (
                          <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-sm">
                            {group.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#ff447e] transition-colors truncate">
                          {group.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {group.membersCount || 1} members • {group.type}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="user"
        targetId={user._id}
        targetTitle={`Member Profile: ${user.name}`}
        targetAuthor={user._id}
      />

      {/* Block Modal */}
      <BlockModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        targetUserId={user._id}
        targetUserName={user.name}
        onSuccess={() => refetch()}
      />

      <Footer />
    </>
  );
}
