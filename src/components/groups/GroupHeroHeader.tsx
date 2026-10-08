'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  Globe,
  Lock,
  EyeOff,
  UserPlus,
  Check,
  Share2,
  Settings,
  Shield,
  Video,
  FileText,
  MessageSquare,
  Clock,
  LogOut,
  ChevronDown,
  Camera,
  Loader2,
  Flag,
} from 'lucide-react';
import { Group } from '@/store/api/groupApi';
import { useUploadFileMutation, StorageFolders } from '@/store/api/uploadApi';
import { GroupPermissions } from './useGroupPermissions';
import ReportModal from '@/components/social/ReportModal';

export type GroupTab = 'feed' | 'forum' | 'zoom' | 'members' | 'invites' | 'manage';

interface GroupHeroHeaderProps {
  group: Group;
  permissions: GroupPermissions;
  activeTab: GroupTab;
  setActiveTab: (tab: GroupTab) => void;
  onJoin: () => void;
  onLeave: () => void;
  onRequestAccess: () => void;
  onCancelRequest: () => void;
  onAcceptInvite?: () => void;
  onDeclineInvite?: () => void;
  onOpenShare: () => void;
  onUpdateGroup?: (data: any) => Promise<void>;
  isJoining: boolean;
  isLeaving: boolean;
  isRequesting: boolean;
  isCancelling: boolean;
  isAcceptingInvite?: boolean;
  isDecliningInvite?: boolean;
  isAuthenticated: boolean;
}

export default function GroupHeroHeader({
  group,
  permissions,
  activeTab,
  setActiveTab,
  onJoin,
  onLeave,
  onRequestAccess,
  onCancelRequest,
  onAcceptInvite,
  onDeclineInvite,
  onOpenShare,
  onUpdateGroup,
  isJoining,
  isLeaving,
  isRequesting,
  isCancelling,
  isAcceptingInvite = false,
  isDecliningInvite = false,
  isAuthenticated,
}: GroupHeroHeaderProps) {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useUploadFileMutation();

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateGroup) return;

    // Validate size (e.g. max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Cover image size must be less than 10MB');
      return;
    }

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', StorageFolders.GROUPS_COVERS);

      const res = await uploadFile(formData).unwrap();
      if (res.data?.url) {
        await onUpdateGroup({ cover: res.data.url });
      }
    } catch (err: any) {
      console.error('Failed to upload cover:', err);
      alert(err?.data?.message || 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateGroup) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Avatar image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', StorageFolders.GROUPS_AVATARS);

      const res = await uploadFile(formData).unwrap();
      if (res.data?.url) {
        await onUpdateGroup({ avatar: res.data.url });
      }
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      alert(err?.data?.message || 'Failed to upload avatar image');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const creator = typeof group.creator === 'object' ? group.creator : null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative">
      {/* Cover Image */}
      <div className="h-44 sm:h-60 md:h-72 w-full bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 relative overflow-hidden group/cover">
        {group.cover ? (
          <img
            src={group.cover}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full opacity-30 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Cover Upload Controls */}
        {permissions.canManage && (
          <>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
            />
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/75 hover:bg-slate-900/95 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-75 cursor-pointer"
                title="Change Cover Banner"
              >
                {isUploadingCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Change Cover</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {isUploadingCover && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 text-white rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Updating cover photo...
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xl overflow-hidden flex-shrink-0 relative group/avatar">
                {group.avatar ? (
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Avatar Upload Overlay */}
                {permissions.canManage && (
                  <>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarSelect}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white cursor-pointer z-10"
                      title="Change Group Avatar"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[11px] font-bold text-white tracking-wide">Change</span>
                    </button>

                    {/* Camera icon badge in bottom-right corner for clear visibility */}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform active:scale-95 group-hover/avatar:hidden z-10"
                      title="Change Group Avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <span className="text-[10px] font-bold mt-1 text-slate-200">Saving...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 sm:mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {group.name}
                  </h1>

                  {/* Privacy Badge */}
                  {group.type === 'public' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      <Globe className="w-3 h-3" />
                      Public
                    </span>
                  )}
                  {group.type === 'private' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                      <Lock className="w-3 h-3" />
                      Private
                    </span>
                  )}
                  {group.type === 'hidden' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                      <EyeOff className="w-3 h-3" />
                      Hidden
                    </span>
                  )}

                  {/* Role Badge for Current User */}
                  {permissions.isCreator && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      <Shield className="w-3 h-3" /> Organizer
                    </span>
                  )}
                  {!permissions.isCreator && permissions.isModerator && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      <Shield className="w-3 h-3" /> Moderator
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <strong className="text-slate-700 dark:text-slate-200">{group.memberCount || 1}</strong> members
                  </span>
                  {creator && (
                    <span className="flex items-center gap-1.5">
                      Created by <strong className="text-slate-700 dark:text-slate-200">{creator.name}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-end mt-2 md:mt-0">
              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                title="Report group"
              >
                <Flag className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenShare}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Share group"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {!isAuthenticated ? (
                <a
                  href={`/sign-in?redirect=/groups/${group.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign In to Join
                </a>
              ) : permissions.isMember ? (
                <div className="relative">
                  <button
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm font-semibold transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                  >
                    <Check className="w-4 h-4" />
                    Member
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showMemberDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-fadeIn">
                      <button
                        onClick={() => {
                          setShowMemberDropdown(false);
                          onLeave();
                        }}
                        disabled={isLeaving || permissions.isCreator}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {permissions.isCreator ? 'Creator cannot leave' : isLeaving ? 'Leaving...' : 'Leave Group'}
                      </button>
                    </div>
                  )}
                </div>
              ) : permissions.isInvited ? (
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={onAcceptInvite}
                    disabled={isAcceptingInvite}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    {isAcceptingInvite ? 'Joining...' : 'Accept Invitation'}
                  </button>
                  {onDeclineInvite && (
                    <button
                      onClick={onDeclineInvite}
                      disabled={isDecliningInvite}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {isDecliningInvite ? '...' : 'Decline'}
                    </button>
                  )}
                </div>
              ) : permissions.isPending ? (
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Already Requested
                  </span>
                  <button
                    onClick={onCancelRequest}
                    disabled={isCancelling}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {isCancelling ? '...' : 'Cancel'}
                  </button>
                </div>
              ) : group.type === 'private' ? (
                <button
                  onClick={onRequestAccess}
                  disabled={isRequesting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  {isRequesting ? 'Requesting...' : 'Request to Join'}
                </button>
              ) : (
                <button
                  onClick={onJoin}
                  disabled={isJoining}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? 'Joining...' : 'Join Group'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800/80 pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Feed & Activity
          </button>

          {group.settings?.enableForum !== false && (
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'forum'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Forum Topics
              {(group.forumTopics?.length || 0) > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'forum'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {group.forumTopics?.length}
                </span>
              )}
            </button>
          )}

          {group.settings?.enableZoom && (
            <button
              onClick={() => setActiveTab('zoom')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'zoom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              Zoom Live
              {(group.zoomMeetings?.length || 0) > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'zoom'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                  }`}
                >
                  {group.zoomMeetings?.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Members ({group.memberCount || 1})
          </button>

          {permissions.canInvite && (
            <button
              onClick={() => setActiveTab('invites')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'invites'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Invite Peers
            </button>
          )}

          {permissions.canManage && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'manage'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage
              {permissions.pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                  {permissions.pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="group"
        targetId={group._id}
        targetTitle={`Group: ${group.name}`}
      />
    </div>
  );
}
