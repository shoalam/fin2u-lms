'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  useGetGroupBySlugQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useRequestAccessMutation,
  useCancelMembershipRequestMutation,
  useRespondMembershipRequestMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useInviteMembersMutation,
  useCancelInvitationMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useCreateForumTopicMutation,
  useCreateZoomMeetingMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikePostMutation,
  useDeleteGroupPostMutation,
  GroupPost,
} from '@/store/api/groupApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { ArrowLeft, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';

// Modular Group Components
import { useGroupPermissions } from '@/components/groups/useGroupPermissions';
import GroupHeroHeader, { GroupTab } from '@/components/groups/GroupHeroHeader';
import GroupGatedPlaceholder from '@/components/groups/GroupGatedPlaceholder';
import GroupFeedTab from '@/components/groups/GroupFeedTab';
import GroupMembersTab from '@/components/groups/GroupMembersTab';
import GroupForumTab from '@/components/groups/GroupForumTab';
import GroupZoomTab from '@/components/groups/GroupZoomTab';
import GroupInvitesTab from '@/components/groups/GroupInvitesTab';
import GroupRequestsTab from '@/components/groups/GroupRequestsTab';
import GroupSettingsTab from '@/components/groups/GroupSettingsTab';
import GroupShareModal from '@/components/groups/GroupShareModal';
import CommunityAuthGate from '@/components/common/CommunityAuthGate';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Group Details Query & Mutations
  const { data: group, isLoading: isLoadingGroup, refetch: refetchGroup } = useGetGroupBySlugQuery(slug, {
    skip: !isAuthenticated,
  });
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [requestAccess, { isLoading: isRequestingAccess }] = useRequestAccessMutation();
  const [cancelMembershipRequest, { isLoading: isCancellingRequest }] = useCancelMembershipRequestMutation();
  const [respondMembershipRequest, { isLoading: isRespondingRequest }] = useRespondMembershipRequestMutation();
  const [acceptInvitation, { isLoading: isAcceptingInvite }] = useAcceptInvitationMutation();
  const [declineInvitation, { isLoading: isDecliningInvite }] = useDeclineInvitationMutation();
  const [updateGroup, { isLoading: isUpdatingGroup }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [inviteMembers, { isLoading: isInviting }] = useInviteMembersMutation();
  const [cancelInvitation] = useCancelInvitationMutation();
  const [createForumTopic, { isLoading: isCreatingTopic }] = useCreateForumTopicMutation();
  const [createZoomMeeting, { isLoading: isCreatingZoom }] = useCreateZoomMeetingMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<GroupTab>('feed');
  const [manageSubTab, setManageSubTab] = useState<'requests' | 'settings'>('requests');

  // Posts State
  const { data: posts = [], isLoading: isLoadingPosts, refetch: refetchPosts } = useGetGroupPostsQuery(
    group?._id || slug,
    { skip: !group?._id }
  );
  const [createPost, { isLoading: isCreatingPost }] = useCreateGroupPostMutation();
  const [toggleLike] = useToggleLikePostMutation();
  const [deletePost] = useDeleteGroupPostMutation();

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Permissions hook
  const permissions = useGroupPermissions(group, user);

  // Handlers
  const handleJoin = async () => {
    if (!group) return;
    try {
      await joinGroup(group._id).unwrap();
      showToast('success', `Welcome! You have joined "${group.name}".`);
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to join group');
    }
  };

  const handleLeave = async () => {
    if (!group) return;
    if (!confirm(`Are you sure you want to leave ${group.name}?`)) return;
    try {
      await leaveGroup(group._id).unwrap();
      showToast('success', `You have left "${group.name}".`);
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to leave group');
    }
  };

  const handleRequestAccess = async () => {
    if (!group) return;
    try {
      await requestAccess(group._id).unwrap();
      showToast('success', 'Access request submitted! Waiting for organizer approval.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to request access');
    }
  };

  const handleCancelRequest = async () => {
    if (!group) return;
    try {
      await cancelMembershipRequest(group._id).unwrap();
      showToast('success', 'Membership request cancelled.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to cancel request');
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!group) return;
    try {
      await respondMembershipRequest({ groupId: group._id, requestId, action }).unwrap();
      showToast('success', `Request ${action === 'approve' ? 'approved' : 'declined'}.`);
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || `Failed to ${action} request`);
    }
  };

  const handleUpdateGroup = async (data: any) => {
    if (!group) return;
    try {
      await updateGroup({ id: group._id, data }).unwrap();
      showToast('success', 'Group settings updated successfully!');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    try {
      await deleteGroup(group._id).unwrap();
      router.push('/groups');
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to delete group');
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!group) return;
    try {
      await removeMember({ groupId: group._id, userId: targetUserId }).unwrap();
      showToast('success', 'Member removed from group.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (targetUserId: string, role: 'organizer' | 'moderator' | 'member') => {
    if (!group) return;
    try {
      await updateMemberRole({ groupId: group._id, userId: targetUserId, role }).unwrap();
      showToast('success', 'Member role updated successfully.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to update member role');
    }
  };

  const handleInvite = async (data: { userIds?: string[]; email?: string; name?: string; role?: string }) => {
    if (!group) return;
    try {
      await inviteMembers({ groupId: group._id, ...data }).unwrap();
      showToast('success', 'Invitations sent successfully!');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to send invitations');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!group) return;
    try {
      await cancelInvitation({ groupId: group._id, inviteId }).unwrap();
      showToast('success', 'Invitation cancelled.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to cancel invitation');
    }
  };

  const handleAcceptInvite = async () => {
    if (!group) return;
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/groups/${slug}`);
      return;
    }
    try {
      await acceptInvitation({ groupId: group._id }).unwrap();
      showToast('success', '🎉 You have successfully joined the group!');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvite = async () => {
    if (!group) return;
    try {
      await declineInvitation({ groupId: group._id }).unwrap();
      showToast('success', 'Invitation declined.');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to decline invitation');
    }
  };

  const handleCreateTopic = async (topicTitle: string, topicContent: string) => {
    if (!group) return;
    try {
      await createForumTopic({ groupId: group._id, title: topicTitle, content: topicContent }).unwrap();
      showToast('success', 'Forum topic created successfully!');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to create topic');
    }
  };

  const handleCreateZoom = async (meetingData: any) => {
    if (!group) return;
    try {
      await createZoomMeeting({ groupId: group._id, ...meetingData }).unwrap();
      showToast('success', 'Zoom meeting scheduled successfully!');
      refetchGroup();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleCreatePost = async (data: { content: string; media?: string[] }) => {
    if (!group) return;
    try {
      await createPost({ groupId: group._id, content: data.content, media: data.media }).unwrap();
      showToast('success', 'Post published!');
      refetchPosts();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to publish post');
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect=/groups/${slug}`;
      return;
    }
    try {
      await toggleLike(postId).unwrap();
      refetchPosts();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId).unwrap();
      showToast('success', 'Post deleted.');
      refetchPosts();
    } catch (err: any) {
      showToast('error', err?.data?.message || 'Failed to delete post');
    }
  };

  const handleOpenShareGroup = () => {
    if (!group) return;
    setShareTitle(group.name);
    setShareUrl(typeof window !== 'undefined' ? window.location.href : '');
    setIsShareModalOpen(true);
  };

  const handleOpenSharePost = (post: GroupPost) => {
    if (!group) return;
    setShareTitle(`${group.name} - Post by ${post.author?.name || 'Member'}`);
    setShareUrl(typeof window !== 'undefined' ? window.location.href : '');
    setIsShareModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <CommunityAuthGate
        feature="Group Community"
        title="Sign In to Access Group Discussions"
        description="Join discussions, interact with group members, view live Zoom sessions, and access curated group resources."
      />
    );
  }

  if (isLoadingGroup) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading community...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Header />
        <div className="flex-1 max-w-lg mx-auto px-4 py-24 text-center">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Group Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              The group you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Groups Directory
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Header />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white ${
              toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toastMsg.text}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <GroupHeroHeader
        group={group}
        permissions={permissions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onRequestAccess={handleRequestAccess}
        onCancelRequest={handleCancelRequest}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
        onOpenShare={handleOpenShareGroup}
        onUpdateGroup={handleUpdateGroup}
        isJoining={isJoining}
        isLeaving={isLeaving}
        isRequesting={isRequestingAccess}
        isCancelling={isCancellingRequest}
        isAcceptingInvite={isAcceptingInvite}
        isDecliningInvite={isDecliningInvite}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Group Invitation Alert Banner */}
        {permissions.isInvited && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  You have been invited to join <span className="text-indigo-600 dark:text-indigo-400">{group.name}</span>!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {permissions.myInvitation?.invitedBy?.name ? (
                    <>
                      Invited by <strong className="text-slate-700 dark:text-slate-200">{permissions.myInvitation.invitedBy.name}</strong> as <span className="inline-block px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] capitalize">{permissions.myInvitation.role || 'member'}</span>
                    </>
                  ) : (
                    <>Accept the invitation to participate in posts, forum discussions, and live meetings.</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleAcceptInvite}
                disabled={isAcceptingInvite}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isAcceptingInvite ? 'Joining...' : 'Accept Invitation'}
              </button>
              <button
                onClick={handleDeclineInvite}
                disabled={isDecliningInvite}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
              >
                {isDecliningInvite ? '...' : 'Decline'}
              </button>
            </div>
          </div>
        )}

        {!permissions.canAccessContent ? (
          <GroupGatedPlaceholder
            group={group}
            isPending={permissions.isPending}
            onRequestAccess={handleRequestAccess}
            onCancelRequest={handleCancelRequest}
            isRequesting={isRequestingAccess}
            isCancelling={isCancellingRequest}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <div>
            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <GroupFeedTab
                group={group}
                posts={posts}
                isLoadingPosts={isLoadingPosts}
                permissions={permissions}
                currentUser={user}
                onCreatePost={handleCreatePost}
                onToggleLike={handleToggleLike}
                onDeletePost={handleDeletePost}
                onSharePost={handleOpenSharePost}
                isCreatingPost={isCreatingPost}
              />
            )}

            {/* Forum Tab */}
            {activeTab === 'forum' && (
              <GroupForumTab
                group={group}
                permissions={permissions}
                onCreateTopic={handleCreateTopic}
                isCreatingTopic={isCreatingTopic}
              />
            )}

            {/* Zoom Live Tab */}
            {activeTab === 'zoom' && (
              <GroupZoomTab
                group={group}
                permissions={permissions}
                onCreateMeeting={handleCreateZoom}
                isCreatingMeeting={isCreatingZoom}
              />
            )}

            {/* Members Directory Tab */}
            {activeTab === 'members' && (
              <GroupMembersTab
                group={group}
                permissions={permissions}
                onRemoveMember={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
                currentUser={user}
              />
            )}

            {/* Invites Tab */}
            {activeTab === 'invites' && (
              <GroupInvitesTab
                group={group}
                permissions={permissions}
                onInvite={handleInvite}
                onCancelInvite={handleCancelInvite}
                isInviting={isInviting}
              />
            )}

            {/* Manage Tab (Organizers / Moderators) */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                {/* Manage Navigation Sub-tabs */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
                  <button
                    onClick={() => setManageSubTab('requests')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      manageSubTab === 'requests'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Join Requests
                    {permissions.pendingRequestsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
                        {permissions.pendingRequestsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setManageSubTab('settings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      manageSubTab === 'settings'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Settings & Permissions
                  </button>
                </div>

                {manageSubTab === 'requests' ? (
                  <GroupRequestsTab
                    group={group}
                    onRespond={handleRespondRequest}
                    isResponding={isRespondingRequest}
                  />
                ) : (
                  <GroupSettingsTab
                    group={group}
                    permissions={permissions}
                    onUpdateGroup={handleUpdateGroup}
                    onDeleteGroup={handleDeleteGroup}
                    isUpdating={isUpdatingGroup}
                    isDeleting={isDeletingGroup}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Share Modal */}
      <GroupShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareTitle}
        url={shareUrl}
      />

      <Footer />
    </div>
  );
}
