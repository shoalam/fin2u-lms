'use client';

import { useState } from 'react';
import { UserPlus, Mail, Check, Search, Shield, X, Clock, AlertCircle } from 'lucide-react';
import { Group } from '@/store/api/groupApi';
import { useGetMembersQuery } from '@/store/api/userApi';
import { GroupPermissions } from './useGroupPermissions';

interface GroupInvitesTabProps {
  group: Group;
  permissions: GroupPermissions;
  onInvite: (data: { userIds?: string[]; email?: string; name?: string; role?: string }) => Promise<void>;
  onCancelInvite: (inviteId: string) => Promise<void>;
  isInviting: boolean;
}

export default function GroupInvitesTab({
  group,
  permissions,
  onInvite,
  onCancelInvite,
  isInviting,
}: GroupInvitesTabProps) {
  const [activeMode, setActiveMode] = useState<'users' | 'email'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  // Query site users
  const { data: usersData, isLoading: isLoadingUsers } = useGetMembersQuery(
    { search: userSearch.trim() || undefined },
    { skip: activeMode !== 'users' }
  );

  const registeredUsers = usersData?.users || [];
  const existingMemberIds = (group.members || []).map((m: any) => (m._id || m)?.toString());

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSendUserInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0 || isInviting) return;
    try {
      await onInvite({ userIds: selectedUserIds, role: inviteRole });
      setSelectedUserIds([]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;
    try {
      await onInvite({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteName('');
    } catch (err: any) {
      console.error(err);
    }
  };

  const pendingInvitations = (group.invitations || []).filter((inv: any) => inv.status === 'pending');

  if (!permissions.canInvite) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invitation Permissions Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          {group.settings?.invitations === 'organizers'
            ? 'Only group organizers are permitted to send invitations for this group.'
            : 'Only group organizers and moderators are permitted to send invitations for this group.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Invite Peers to {group.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Invite classmates, colleagues, and experts to join your learning community
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveMode('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'users'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Find Peers
          </button>
          <button
            onClick={() => setActiveMode('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'email'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Invite by Email
          </button>
        </div>
      </div>

      {/* Mode 1: Search & Pick Registered Users */}
      {activeMode === 'users' && (
        <form onSubmit={handleSendUserInvites} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email to invite..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {isLoadingUsers ? (
            <div className="text-xs text-slate-400 text-center py-6">Searching members...</div>
          ) : registeredUsers.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6">No users found. Try searching by keyword or name.</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/30">
              {registeredUsers.map((u: any) => {
                const uId = u._id || u.id;
                const isMember = existingMemberIds.includes(uId);
                const isSelected = selectedUserIds.includes(uId);

                return (
                  <div
                    key={uId}
                    onClick={() => !isMember && handleToggleUser(uId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isMember
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50'
                        : isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 cursor-pointer'
                        : 'hover:bg-white dark:hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                      </div>
                    </div>

                    <div>
                      {isMember ? (
                        <span className="text-[11px] text-slate-400 font-medium">Already Member</span>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Selected <strong>{selectedUserIds.length}</strong> peers
            </span>
            <button
              type="submit"
              disabled={selectedUserIds.length === 0 || isInviting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isInviting ? 'Sending Invites...' : `Send Invitations (${selectedUserIds.length})`}
            </button>
          </div>
        </form>
      )}

      {/* Mode 2: Direct Email */}
      {activeMode === 'email' && (
        <form onSubmit={handleSendEmailInvite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Colleague's Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!inviteEmail.trim() || isInviting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {isInviting ? 'Sending Invite...' : 'Send Invitation Email'}
            </button>
          </div>
        </form>
      )}

      {/* Pending Sent Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Pending Invitations ({pendingInvitations.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pendingInvitations.map((inv: any) => (
              <div
                key={inv._id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{inv.name || inv.email}</div>
                  <div className="text-[11px] text-slate-400">{inv.email || 'Registered user'}</div>
                </div>

                <button
                  onClick={() => onCancelInvite(inv._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Cancel invitation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
