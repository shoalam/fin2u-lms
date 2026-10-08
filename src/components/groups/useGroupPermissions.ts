import { Group, GroupInvitation } from '@/store/api/groupApi';

export interface GroupPermissions {
  isMember: boolean;
  isCreator: boolean;
  isOrganizer: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  canManage: boolean;
  isPending: boolean;
  isInvited: boolean;
  myInvitation: GroupInvitation | null;
  canAccessContent: boolean;
  canPost: boolean;
  canInvite: boolean;
  canMessage: boolean;
  pendingRequestsCount: number;
}

export function useGroupPermissions(group: Group | undefined, user: any): GroupPermissions {
  const userId = user?._id || user?.id;
  const userEmail = (user?.email || '').trim().toLowerCase();
  const isAdmin = user?.role === 'admin';

  if (!group || !userId) {
    const isPrivate = group?.type === 'private';
    return {
      isMember: false,
      isCreator: false,
      isOrganizer: false,
      isModerator: false,
      isAdmin,
      canManage: isAdmin,
      isPending: false,
      isInvited: false,
      myInvitation: null,
      canAccessContent: !isPrivate || isAdmin,
      canPost: false,
      canInvite: false,
      canMessage: false,
      pendingRequestsCount: 0,
    };
  }

  const isCreator = Boolean(
    ((group.creator as any)?._id || group.creator)?.toString() === userId
  );

  const isOrganizer = Boolean(
    isCreator ||
    group.organizers?.some((o: any) => (o._id || o)?.toString() === userId) ||
    group.memberRoles?.some(
      (mr: any) => (mr.user?._id || mr.user)?.toString() === userId && mr.role === 'organizer'
    )
  );

  const isModerator = Boolean(
    isOrganizer ||
    group.moderators?.some((m: any) => (m._id || m)?.toString() === userId) ||
    group.memberRoles?.some(
      (mr: any) => (mr.user?._id || mr.user)?.toString() === userId && mr.role === 'moderator'
    )
  );

  const isMember = Boolean(
    isModerator ||
    group.members?.some((m: any) => (m._id || m)?.toString() === userId) ||
    group.memberRoles?.some(
      (mr: any) => (mr.user?._id || mr.user)?.toString() === userId
    )
  );

  const isPending = Boolean(
    group.membershipRequests?.some(
      (r: any) => ((r.user?._id || r.user)?.toString() === userId) && r.status === 'pending'
    )
  );

  const myInvitation = (group.invitations || []).find((inv: any) => {
    const invUserId = (inv.user?._id || inv.user)?.toString();
    const invEmail = (inv.email || '').trim().toLowerCase();
    return (
      inv.status === 'pending' &&
      ((invUserId && invUserId === userId) || (userEmail && invEmail === userEmail))
    );
  }) || null;

  const isInvited = Boolean(myInvitation && !isMember);

  const pendingRequestsCount = (group.membershipRequests || []).filter(
    (r: any) => r.status === 'pending'
  ).length;

  const canManage = isCreator || isOrganizer || isModerator || isAdmin;
  const isPrivate = group.type === 'private';
  const canAccessContent = !isPrivate || isMember || canManage;

  const inviteSetting = group.settings?.invitations || 'all';
  const canInvite =
    isAdmin ||
    isCreator ||
    (inviteSetting === 'all' && isMember) ||
    (inviteSetting === 'mods' && isModerator) ||
    (inviteSetting === 'organizers' && isOrganizer);

  const postSetting = group.settings?.activityFeed || 'all';
  const canPost =
    isAdmin ||
    isCreator ||
    (postSetting === 'all' && isMember) ||
    (postSetting === 'mods' && isModerator) ||
    (postSetting === 'organizers' && isOrganizer);

  const messageSetting = group.settings?.groupMessages || 'all';
  const canMessage =
    isAdmin ||
    isCreator ||
    (messageSetting === 'all' && isMember) ||
    (messageSetting === 'mods' && isModerator) ||
    (messageSetting === 'organizers' && isOrganizer);

  return {
    isMember,
    isCreator,
    isOrganizer,
    isModerator,
    isAdmin,
    canManage,
    isPending,
    isInvited,
    myInvitation,
    canAccessContent,
    canPost,
    canInvite,
    canMessage,
    pendingRequestsCount,
  };
}
