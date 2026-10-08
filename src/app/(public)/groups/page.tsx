'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageUploader from '@/components/common/ImageUploader';
import { StorageFolders } from '@/constants/storage-folders';
import {
  useGetGroupsQuery,
  useJoinGroupMutation,
  useRequestAccessMutation,
  useCancelMembershipRequestMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useCreateGroupMutation,
  Group,
} from '@/store/api/groupApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  Users,
  Lock,
  Globe,
  UserPlus,
  Check,
  PlusCircle,
  X,
  Search,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Mail,
} from 'lucide-react';

import CommunityAuthGate from '@/components/common/CommunityAuthGate';

function formatRelativeTime(dateString?: string | Date) {
  if (!dateString) return 'Active recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'Active just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Active ${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Active ${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `Active ${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `Active ${diffInYears <= 1 ? 'a year' : `${diffInYears} years`} ago`;
}

export default function GroupsPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'joined' | 'requested' | 'invitations' | 'public' | 'private'>('all');

  const { data, isLoading, refetch } = useGetGroupsQuery(
    {
      page,
      limit,
      search: searchTerm.trim() || undefined,
      type: filterType === 'all' ? undefined : filterType,
    },
    { skip: !isAuthenticated }
  );

  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [requestAccess, { isLoading: isRequesting }] = useRequestAccessMutation();
  const [cancelMembershipRequest, { isLoading: isCancelling }] = useCancelMembershipRequestMutation();
  const [acceptInvitation, { isLoading: isAcceptingInvite }] = useAcceptInvitationMutation();
  const [declineInvitation, { isLoading: isDecliningInvite }] = useDeclineInvitationMutation();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    avatar: '',
    cover: '',
  });

  if (!isAuthenticated) {
    return (
      <CommunityAuthGate
        feature="Learning Groups"
        title="Sign In to Access Learning Groups"
        description="Join interactive student circles, collaborate with peers, participate in live Zoom masterminds, and share resources."
      />
    );
  }

  const groups = data?.groups || [];
  const pagination = data?.pagination || { total: groups.length, page: 1, limit: 9, pages: 1 };

  const getPageNumbers = () => {
    const totalPages = pagination.pages || 1;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const handleAction = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect=/groups`;
      return;
    }
    try {
      if (group.type === 'private') {
        await requestAccess(group._id).unwrap();
        showToast('success', `Access requested for "${group.name}". Waiting for admin approval.`);
      } else {
        await joinGroup(group._id).unwrap();
        showToast('success', `Welcome! You have joined "${group.name}".`);
      }
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to process request');
    }
  };

  const handleAcceptInviteAction = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect=/groups/${group.slug}`;
      return;
    }
    try {
      await acceptInvitation({ groupId: group._id }).unwrap();
      showToast('success', `🎉 Welcome! You have joined "${group.name}".`);
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInviteAction = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      await declineInvitation({ groupId: group._id }).unwrap();
      showToast('success', `Invitation for "${group.name}" declined.`);
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleCancelAction = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      await cancelMembershipRequest(group._id).unwrap();
      showToast('success', `Membership request cancelled for "${group.name}".`);
      refetch();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to cancel request');
    }
  };

  const router = typeof window !== 'undefined' ? (require('next/navigation').useRouter?.() || null) : null;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim() || isCreating) return;

    try {
      const created = await createGroup(newGroup).unwrap();
      setIsModalOpen(false);
      setNewGroup({ name: '', description: '', type: 'public', avatar: '', cover: '' });
      showToast('success', `Group "${created.name}" created successfully!`);
      if (created?.slug) {
        window.location.href = `/groups/${created.slug}`;
      } else {
        refetch();
      }
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to create group');
    }
  };

  return (
    <>
      <Header />
      {/* Toast Feedback Notification */}
      {toastMsg && (
        <div
          className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4 duration-300 ${toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-red-600 text-white shadow-red-600/20'
            }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <section className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white py-14 text-center">
        <div className="max-w-[800px] mx-auto px-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff447e]/20 text-[#ff447e] text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>COMMUNITY HUBS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Peer Learning Groups</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Participate in niche discussions, ask questions to mentors, and collaborate with peers across Malaysian industries.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#f8fafc] min-h-[60vh]">
        <div className="max-w-[1240px] mx-auto px-6 space-y-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'all'
                      ? 'bg-[#041c53] text-white'
                      : 'text-gray-600 hover:text-black'
                    }`}
                >
                  All Groups
                </button>

                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => {
                        setFilterType('joined');
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'joined'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      My Joined Groups
                    </button>

                    <button
                      onClick={() => {
                        setFilterType('requested');
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'requested'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-amber-700 hover:bg-amber-50'
                        }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      My Requested Groups
                    </button>

                    <button
                      onClick={() => {
                        setFilterType('invitations');
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'invitations'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-indigo-700 hover:bg-indigo-50'
                        }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      My Invitations
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setFilterType('public');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'public'
                      ? 'bg-[#041c53] text-white'
                      : 'text-gray-600 hover:text-black'
                    }`}
                >
                  Public Groups
                </button>

                <button
                  onClick={() => {
                    setFilterType('private');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filterType === 'private'
                      ? 'bg-[#041c53] text-white'
                      : 'text-gray-600 hover:text-black'
                    }`}
                >
                  Private Groups
                </button>
              </div>
            </div>

            {/* Create Group Action */}
            {isAuthenticated && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start md:self-auto shadow-md shadow-[#ff447e]/20 font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Group</span>
              </button>
            )}
          </div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white rounded-3xl animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#041c53]">
                {filterType === 'joined'
                  ? 'You have not joined any groups yet'
                  : filterType === 'requested'
                    ? 'No pending access requests found'
                    : filterType === 'invitations'
                      ? 'No pending group invitations found'
                      : 'No Groups Found'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {filterType === 'joined'
                  ? 'Explore public and private learning groups above to join discussions.'
                  : filterType === 'requested'
                    ? 'You have not submitted membership requests for any private groups.'
                    : filterType === 'invitations'
                      ? 'When organizers or peers invite you to join their groups, you will see them here.'
                      : 'Try adjusting your search keywords or filters.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {groups.map((group) => {
                  const currentUserId = (user?._id || (user as any)?.id || '')?.toString();
                  const creatorId = group.creator ? (((group.creator as any)?._id || (group.creator as any)?.id || group.creator)?.toString()) : '';
                  const isCreator = Boolean(currentUserId && creatorId === currentUserId);
                  const isOrganizer = Boolean(
                    isCreator ||
                    (currentUserId && group.organizers?.some((o: any) => ((o?._id || o?.id || o)?.toString()) === currentUserId)) ||
                    (currentUserId && group.memberRoles?.some((mr: any) => ((mr?.user?._id || mr?.user?.id || mr?.user)?.toString()) === currentUserId && mr.role === 'organizer'))
                  );
                  const isModerator = Boolean(
                    isOrganizer ||
                    (currentUserId && group.moderators?.some((m: any) => ((m?._id || m?.id || m)?.toString()) === currentUserId)) ||
                    (currentUserId && group.memberRoles?.some((mr: any) => ((mr?.user?._id || mr?.user?.id || mr?.user)?.toString()) === currentUserId && mr.role === 'moderator'))
                  );
                  const isMember = Boolean(
                    isModerator ||
                    (currentUserId && group.members?.some((m: any) => ((m?._id || m?.id || m)?.toString()) === currentUserId)) ||
                    (currentUserId && group.memberRoles?.some((mr: any) => ((mr?.user?._id || mr?.user?.id || mr?.user)?.toString()) === currentUserId))
                  );
                  const userEmail = (user?.email || '').trim().toLowerCase();
                  const isInvited = Boolean(
                    !isMember &&
                    currentUserId &&
                    group.invitations?.some((inv: any) => {
                      if (!inv || inv.status !== 'pending') return false;
                      const invUserId = (inv.user?._id || inv.user?.id || inv.user)?.toString();
                      const invEmail = (inv.email || '').trim().toLowerCase();
                      return (
                        (invUserId && invUserId === currentUserId) ||
                        (userEmail && invEmail === userEmail)
                      );
                    })
                  );
                  const hasPendingRequest = Boolean(
                    !isMember &&
                    !isInvited &&
                    currentUserId &&
                    group.membershipRequests?.some((r: any) => {
                      if (!r) return false;
                      const reqUserId = (r?.user?._id || r?.user?.id || r?.user)?.toString();
                      return reqUserId === currentUserId && (r.status === 'pending' || !r.status);
                    })
                  );
                  const isPrivate = group.type === 'private';

                  const avatarUrl =
                    group.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      group.name
                    )}&background=041c53&color=fff&size=128&bold=true`;

                  const coverUrl =
                    group.cover ||
                    'https://fin2u.net/wp-content/uploads/buddypress/groups/0/cover-image/g2-1.jpg';

                  // Member avatar pile
                  const memberAvatars: string[] = (group.members || [])
                    .map((m: any) => (typeof m === 'object' && m?.avatar ? m.avatar : null))
                    .filter(Boolean);

                  if (group.creator?.avatar && !memberAvatars.includes(group.creator.avatar)) {
                    memberAvatars.unshift(group.creator.avatar);
                  }

                  return (
                    <div
                      key={group._id}
                      className={`group bg-white rounded-2xl border ${
                        isInvited
                          ? 'border-indigo-400/90 shadow-md ring-2 ring-indigo-400/20'
                          : hasPendingRequest
                          ? 'border-amber-400/90 shadow-md ring-2 ring-amber-400/20'
                          : 'border-gray-200/80 shadow-xs'
                        } hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 relative`}
                    >
                      <Link href={`/groups/${group.slug}`} className="block flex-1">
                        {/* Cover Photo */}
                        <div className="h-40 sm:h-44 w-full relative overflow-hidden bg-slate-100">
                          <img
                            src={coverUrl}
                            alt={group.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Top-Right Badges */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {isMember && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md">
                                <Check className="w-3 h-3" />
                                {isCreator ? 'Organizer' : isModerator ? 'Moderator' : 'Joined'}
                              </span>
                            )}
                            {isInvited && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-md animate-pulse">
                                <Mail className="w-3 h-3" />
                                Invited
                              </span>
                            )}
                            {hasPendingRequest && !isMember && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
                                <Clock className="w-3 h-3" />
                                Already Requested
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Overlapping Profile/Avatar Image */}
                        <div className="px-6 relative">
                          <div className="-mt-12 relative z-10 inline-block">
                            <img
                              src={avatarUrl}
                              alt={group.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-[3.5px] border-white shadow-md bg-white"
                            />
                          </div>
                        </div>

                        {/* Group Content Info */}
                        <div className="px-6 pt-3.5 pb-3 space-y-2">
                          <h3 className="text-xl font-bold text-[#041c53] group-hover:text-[#ff447e] transition-colors leading-tight line-clamp-2">
                            {group.name}
                          </h3>

                          {/* Meta Row: Private • Course Subscriber • Active a year ago */}
                          <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5 font-normal">
                            <span className="capitalize">{group.type || 'Public'}</span>
                            <span className="text-gray-300">•</span>
                            <span>{group.settings?.groupType || 'Course Subscriber'}</span>
                            <span className="text-gray-300">•</span>
                            <span>{formatRelativeTime((group as any).updatedAt || group.createdAt)}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Footer */}
                      <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 mt-auto">
                        {/* Members Avatar Pile */}
                        <div className="flex items-center -space-x-2">
                          {memberAvatars.length > 0 ? (
                            memberAvatars.slice(0, 2).map((av: string, i: number) => (
                              <img
                                key={i}
                                src={av}
                                alt="Member"
                                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
                              />
                            ))
                          ) : (
                            <img
                              src={avatarUrl}
                              alt="Member"
                              className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
                            />
                          )}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-400 shadow-2xs">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Action Button */}
                        {isMember ? (
                          <Link
                            href={`/groups/${group.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#041c53] hover:bg-[#ff447e] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm group-hover:shadow-md"
                          >
                            <span>View Group</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : isInvited ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleAcceptInviteAction(group, e)}
                              disabled={isAcceptingInvite}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Invite</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeclineInviteAction(group, e)}
                              disabled={isDecliningInvite}
                              className="p-2 rounded-full border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-400 text-xs transition-all shadow-2xs cursor-pointer"
                              title="Decline Invitation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : isPrivate ? (
                          hasPendingRequest ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold cursor-default shadow-2xs"
                                title="You have already requested access. Waiting for approval."
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Already Requested</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleCancelAction(group, e)}
                                disabled={isCancelling}
                                className="p-2 rounded-full border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-400 text-xs transition-all shadow-2xs cursor-pointer"
                                title="Cancel Request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleAction(group, e)}
                              disabled={isRequesting}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[#041c53] hover:bg-gray-50 hover:border-gray-300 hover:text-black text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5 text-[#041c53]" />
                              <span>Request Access</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => handleAction(group, e)}
                            disabled={isJoining}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[#041c53] hover:bg-gray-50 hover:border-gray-300 hover:text-black text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-[#041c53]" />
                            <span>Join Group</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/70">
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">
                    Showing{' '}
                    <span className="font-bold text-[#041c53]">
                      {(page - 1) * limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-[#041c53]">
                      {Math.min(page * limit, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-bold text-[#041c53]">
                      {pagination.total}
                    </span>{' '}
                    groups
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((item, idx) => {
                        if (item === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-gray-400 select-none">
                              ...
                            </span>
                          );
                        }
                        const pageNum = Number(item);
                        const isActive = pageNum === page;
                        return (
                          <button
                            key={`page-${pageNum}`}
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${isActive
                                ? 'bg-[#041c53] text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                      disabled={page >= pagination.pages}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Create Group Modal (Mentors & Admins only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 border border-gray-100 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#041c53] text-white flex items-center justify-center font-bold shadow-md shadow-[#041c53]/20 shrink-0">
                <Users className="w-6 h-6 text-[#ff447e]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#041c53]">Create New Learning Group</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Establish a collaborative community circle for discussions, forums, and peer learning.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-5">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johor SME Business & Tax Advisory"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white transition-colors"
                />
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Description / Mission
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the group purpose, target audience, topic discussions, and guidelines..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#ff447e] focus:bg-white transition-colors resize-y"
                />
              </div>

              {/* Privacy Radio Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Privacy Setting <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewGroup({ ...newGroup, type: 'public' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${newGroup.type === 'public'
                        ? 'border-[#ff447e] bg-pink-50/40 ring-2 ring-[#ff447e]/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${newGroup.type === 'public' ? 'bg-[#ff447e] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#041c53]">Public Group</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        Anyone on Fin2u can view content and instantly join the discussions.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setNewGroup({ ...newGroup, type: 'private' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${newGroup.type === 'private'
                        ? 'border-[#ff447e] bg-pink-50/40 ring-2 ring-[#ff447e]/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${newGroup.type === 'private' ? 'bg-[#ff447e] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#041c53]">Private Group</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        Requires mentor/admin approval to join before accessing private discussions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Uploaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <ImageUploader
                  label="Group Profile / Avatar"
                  value={newGroup.avatar}
                  onChange={(url) => setNewGroup({ ...newGroup, avatar: url })}
                  folder={StorageFolders.GROUPS_AVATARS}
                  aspectRatio="square"
                  helperText="Square 1:1 image recommended (400x400px). Supports PNG, JPG, WEBP."
                />

                <ImageUploader
                  label="Group Cover Banner"
                  value={newGroup.cover}
                  onChange={(url) => setNewGroup({ ...newGroup, cover: url })}
                  folder={StorageFolders.GROUPS_COVERS}
                  aspectRatio="video"
                  helperText="Landscape 16:9 banner (1200x500px). Supports PNG, JPG, WEBP."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline text-xs py-2.5 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-[#ff447e]/20 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Group...</span>
                    </>
                  ) : (
                    <span>Create & Launch Group</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

