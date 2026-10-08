'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Shield,
  MoreVertical,
  UserMinus,
  ShieldAlert,
  ShieldCheck,
  Mail,
  User,
  Flag,
  ShieldBan,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { Group } from '@/store/api/groupApi';
import { GroupPermissions } from './useGroupPermissions';
import ReportModal from '@/components/social/ReportModal';
import BlockModal from '@/components/social/BlockModal';

interface GroupMembersTabProps {
  group: Group;
  permissions: GroupPermissions;
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateRole: (userId: string, role: 'organizer' | 'moderator' | 'member') => Promise<void>;
  currentUser: any;
}

export default function GroupMembersTab({
  group,
  permissions,
  onRemoveMember,
  onUpdateRole,
  currentUser,
}: GroupMembersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'organizer' | 'moderator' | 'member'>('all');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  // Modals
  const [reportUser, setReportUser] = useState<{ id: string; name: string } | null>(null);
  const [blockUser, setBlockUser] = useState<{ id: string; name: string } | null>(null);

  const members = group.members || [];
  const memberRoles = group.memberRoles || [];
  const currentUserId = currentUser?._id || currentUser?.id;
  const creatorId = ((group.creator as any)?._id || group.creator)?.toString();

  const getMemberRole = (userId: string) => {
    if (userId === creatorId) return 'organizer';
    const r = memberRoles.find((mr: any) => (mr.user?._id || mr.user)?.toString() === userId);
    if (r?.role) return r.role;
    if (group.organizers?.some((o: any) => (o._id || o)?.toString() === userId)) return 'organizer';
    if (group.moderators?.some((m: any) => (m._id || m)?.toString() === userId)) return 'moderator';
    return 'member';
  };

  const filteredMembers = members.filter((m: any) => {
    const uId = (m._id || m)?.toString();
    const name = m.name || '';
    const email = m.email || '';
    const role = getMemberRole(uId);

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#ff447e]" />
            Community Members ({members.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Peers, organizers, and instructors participating in this group
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff447e]"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {(['all', 'organizer', 'moderator', 'member'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  roleFilter === r
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">No members found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m: any) => {
            const uId = (m._id || m)?.toString();
            const role = getMemberRole(uId);
            const isSelf = uId === currentUserId;
            const isCreator = uId === creatorId;
            const isMenuOpen = openMenuUserId === uId;

            return (
              <div
                key={uId}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-pink-200 dark:hover:border-pink-900/50 transition-all relative group"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <Link href={`/members/${uId}`} className="shrink-0 block hover:opacity-85 transition-opacity">
                    <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700">
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#041c53]/10 text-[#041c53] dark:bg-white/10 dark:text-white flex items-center justify-center font-bold text-sm">
                          {(m.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <Link
                        href={`/members/${uId}`}
                        className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#ff447e] transition-colors truncate"
                      >
                        {m.name || 'Member'}
                      </Link>
                      {isSelf && <span className="text-[10px] text-slate-400 shrink-0">(You)</span>}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {m.headline || m.bio || 'Group member'}
                    </p>

                    <div className="mt-1">
                      {role === 'organizer' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          <ShieldCheck className="w-3 h-3" /> Organizer
                        </span>
                      )}
                      {role === 'moderator' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          <Shield className="w-3 h-3" /> Moderator
                        </span>
                      )}
                      {role === 'member' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side Quick Actions & 3-Dot Menu */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!isSelf && (
                    <Link
                      href={`/messages?userId=${uId}`}
                      className="p-2 text-slate-400 hover:text-[#ff447e] hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-xl transition-colors"
                      title="Direct Message"
                    >
                      <Mail className="w-4 h-4" />
                    </Link>
                  )}

                  {/* 3-Dot Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuUserId(isMenuOpen ? null : uId)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-fadeIn text-xs">
                        <Link
                          href={`/members/${uId}`}
                          className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                          onClick={() => setOpenMenuUserId(null)}
                        >
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span>View Profile</span>
                        </Link>

                        {!isSelf && (
                          <>
                            <button
                              onClick={() => {
                                setOpenMenuUserId(null);
                                setReportUser({ id: uId, name: m.name || 'Member' });
                              }}
                              className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                            >
                              <Flag className="w-3.5 h-3.5 text-rose-500" />
                              <span>Report Member</span>
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenuUserId(null);
                                setBlockUser({ id: uId, name: m.name || 'Member' });
                              }}
                              className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                            >
                              <ShieldBan className="w-3.5 h-3.5 text-slate-500" />
                              <span>Block Member</span>
                            </button>
                          </>
                        )}

                        {/* Role Management Actions (Organizer/Admin only) */}
                        {permissions.isOrganizer && !isCreator && !isSelf && (
                          <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                            {role === 'member' && (
                              <button
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onUpdateRole(uId, 'moderator');
                                }}
                                className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Shield className="w-3.5 h-3.5 text-purple-500" />
                                <span>Make Moderator</span>
                              </button>
                            )}
                            {role === 'moderator' && (
                              <button
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  onUpdateRole(uId, 'member');
                                }}
                                className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                <span>Demote to Member</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuUserId(null);
                                if (confirm(`Remove ${m.name || 'member'} from this group?`)) {
                                  onRemoveMember(uId);
                                }
                              }}
                              className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Remove from Group</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {reportUser && (
        <ReportModal
          isOpen={Boolean(reportUser)}
          onClose={() => setReportUser(null)}
          targetType="user"
          targetId={reportUser.id}
          targetTitle={`Group Member: ${reportUser.name}`}
          targetAuthor={reportUser.id}
        />
      )}

      {/* Block Modal */}
      {blockUser && (
        <BlockModal
          isOpen={Boolean(blockUser)}
          onClose={() => setBlockUser(null)}
          targetUserId={blockUser.id}
          targetUserName={blockUser.name}
        />
      )}
    </div>
  );
}
