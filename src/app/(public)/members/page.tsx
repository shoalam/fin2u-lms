'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useGetMembersQuery } from '@/store/api/userApi';
import {
  useGetMyConnectionsQuery,
  useAcceptConnectionMutation,
  useDeclineConnectionMutation,
  useRemoveConnectionMutation,
} from '@/store/api/socialApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  Users,
  Search,
  Award,
  GraduationCap,
  ShieldCheck,
  Mail,
  UserCheck,
  UserPlus,
  Clock,
  Check,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import CommunityAuthGate from '@/components/common/CommunityAuthGate';

type MemberViewMode = 'all' | 'connected' | 'incoming' | 'outgoing';

export default function MembersPage() {
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<MemberViewMode>('all');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Site-wide members query
  const { data: membersData, isLoading: isLoadingMembers } = useGetMembersQuery(
    {
      role: roleFilter || undefined,
      search: searchTerm || undefined,
    },
    {
      skip: !isAuthenticated,
    }
  );

  // User's connections & pending requests query
  const {
    data: connectionsData,
    isLoading: isLoadingConnections,
    refetch: refetchConnections,
  } = useGetMyConnectionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [acceptConnection, { isLoading: isAccepting }] = useAcceptConnectionMutation();
  const [declineConnection, { isLoading: isDeclining }] = useDeclineConnectionMutation();
  const [removeConnection, { isLoading: isRemoving }] = useRemoveConnectionMutation();

  const members = membersData?.users || [];
  const connected = connectionsData?.connected || [];
  const incomingPending = connectionsData?.incomingPending || [];
  const outgoingPending = connectionsData?.outgoingPending || [];

  const handleAccept = async (connectionId: string, targetUserId?: string) => {
    try {
      await acceptConnection({ connectionId, targetUserId }).unwrap();
      refetchConnections();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to accept connection request');
    }
  };

  const handleDecline = async (connectionId: string, targetUserId?: string) => {
    try {
      await declineConnection({ connectionId, targetUserId }).unwrap();
      refetchConnections();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to decline connection request');
    }
  };

  const handleRemove = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    try {
      await removeConnection(targetUserId).unwrap();
      refetchConnections();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to remove connection');
    }
  };

  if (!isAuthenticated) {
    return (
      <CommunityAuthGate
        feature="Member Directory & Connections"
        title="Sign In to Access the Member Network"
        description="Connect with fellow students, find course study buddies, chat with instructors, and build your professional finance network."
      />
    );
  }

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0a2a6e] text-white py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff447e]/15 via-transparent to-transparent" />
        <div className="max-w-[800px] mx-auto px-6 space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff447e]/20 text-[#ff447e] text-xs font-bold uppercase tracking-wider border border-[#ff447e]/30">
            <Users className="w-3.5 h-3.5" />
            <span>COMMUNITY & NETWORKING</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Members of Fin2u Academy</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Connect, network, and grow alongside fellow learners, instructors, and industry professionals.
          </p>

          {/* Pending Requests Alert Pill for Authenticated Users */}
          {isAuthenticated && incomingPending.length > 0 && (
            <div className="pt-3">
              <button
                onClick={() => setViewMode('incoming')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400 text-[#041c53] text-xs font-extrabold shadow-lg hover:bg-amber-300 transition-all hover:scale-105 animate-bounce"
              >
                <Clock className="w-4 h-4" />
                <span>You have {incomingPending.length} pending connection request{incomingPending.length > 1 ? 's' : ''}!</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-10 bg-gray-50 dark:bg-slate-950 min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          {/* Main Top Navigation Tabs (Directory vs My Network vs Pending Requests) */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'all'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Explore Directory</span>
              </button>

              <button
                onClick={() => setViewMode('connected')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'connected'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>My Connections</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {connected.length}
                </span>
              </button>

              <button
                onClick={() => setViewMode('incoming')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'incoming'
                    ? 'bg-[#ff447e] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>Received Requests</span>
                {incomingPending.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-[#041c53] font-black">
                    {incomingPending.length} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setViewMode('outgoing')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'outgoing'
                    ? 'bg-[#041c53] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Sent Requests</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {outgoingPending.length}
                </span>
              </button>
            </div>
          )}

          {/* VIEW 1: All Members Directory */}
          {viewMode === 'all' && (
            <div className="space-y-6">
              {/* Search & Role Filter Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search member name, headline, or title..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#ff447e]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  {[
                    { label: 'All Members', value: '' },
                    { label: 'Mentors', value: 'mentor' },
                    { label: 'Students', value: 'student' },
                    { label: 'Admins', value: 'admin' },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setRoleFilter(tab.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        roleFilter === tab.value
                          ? 'bg-[#041c53] text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Grid */}
              {isLoadingMembers ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-gray-100 dark:border-slate-800" />
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#041c53] dark:text-white">No Members Found</h3>
                  <p className="text-xs text-gray-500 mt-1">Try broadening your search term or filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {members.map((m) => (
                    <div
                      key={m._id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between group"
                    >
                      <Link href={`/members/${m._id}`} className="block">
                        <img
                          src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`}
                          alt={m.name}
                          className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border-2 border-gray-100 dark:border-slate-700 group-hover:scale-105 transition-transform"
                        />

                        <h3 className="font-bold text-base text-[#041c53] dark:text-white group-hover:text-[#ff447e] transition-colors line-clamp-1">
                          {m.name}
                        </h3>

                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mt-1.5 ${
                            m.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : m.role === 'mentor'
                              ? 'bg-[#ff447e]/10 text-[#ff447e]'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {m.role}
                        </span>

                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {m.headline || m.bio || 'Fin2u Academy member exploring new skills.'}
                        </p>
                      </Link>

                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                        <Link
                          href={`/members/${m._id}`}
                          className="text-[11px] font-bold text-gray-500 hover:text-[#ff447e] transition-colors"
                        >
                          View Profile
                        </Link>

                        <Link
                          href={`/messages?userId=${m._id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#041c53] dark:text-white hover:text-[#ff447e] bg-gray-50 dark:bg-slate-800 hover:bg-pink-50 px-2.5 py-1 rounded-lg transition-colors border border-gray-100 dark:border-slate-700"
                        >
                          <Mail className="w-3 h-3 text-[#ff447e]" />
                          <span>Message</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: My Connections */}
          {viewMode === 'connected' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Network ({connected.length})</h2>
                  <p className="text-xs text-slate-500">Peers and mentors you are directly connected with</p>
                </div>
              </div>

              {connected.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 space-y-3">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Connections Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse the directory to send connection requests to classmates, colleagues, and instructors.
                  </p>
                  <button
                    onClick={() => setViewMode('all')}
                    className="btn btn-primary text-xs py-2.5 px-5 mt-2"
                  >
                    Explore Member Directory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {connected.map((item) => {
                    const peer = item.user;
                    if (!peer) return null;
                    return (
                      <div
                        key={item.connectionId}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <Link href={`/members/${peer._id}`} className="shrink-0">
                            <img
                              src={peer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}`}
                              alt={peer.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/members/${peer._id}`}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#ff447e] transition-colors truncate block"
                            >
                              {peer.name}
                            </Link>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#ff447e] mt-0.5">
                              {peer.role}
                            </span>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                              {peer.headline || 'Fin2u Member'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                          <Link
                            href={`/messages?userId=${peer._id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#041c53] dark:text-white hover:text-[#ff447e] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-50 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#ff447e]" />
                            <span>Message</span>
                          </Link>

                          <button
                            onClick={() => handleRemove(peer._id)}
                            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: Received Incoming Requests */}
          {viewMode === 'incoming' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Incoming Connection Requests ({incomingPending.length})
                </h2>
                <p className="text-xs text-slate-500">Approve or decline connection requests sent to you</p>
              </div>

              {incomingPending.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 space-y-3">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Pending Requests</h3>
                  <p className="text-xs text-slate-500">You're all caught up! No incoming connection requests waiting.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {incomingPending.map((item) => {
                    const peer = item.user;
                    if (!peer) return null;
                    return (
                      <div
                        key={item.connectionId}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-amber-200/60 dark:border-amber-900/40 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <Link href={`/members/${peer._id}`} className="shrink-0">
                            <img
                              src={peer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}`}
                              alt={peer.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/members/${peer._id}`}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#ff447e] transition-colors truncate block"
                            >
                              {peer.name}
                            </Link>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-0.5">
                              {peer.role}
                            </span>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                              {peer.headline || 'Wants to connect with you'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDecline(item.connectionId, peer._id)}
                            disabled={isDeclining}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAccept(item.connectionId, peer._id)}
                            disabled={isAccepting}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: Outgoing Sent Requests */}
          {viewMode === 'outgoing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sent Connection Requests ({outgoingPending.length})
                </h2>
                <p className="text-xs text-slate-500">Invitations you have sent that are awaiting peer approval</p>
              </div>

              {outgoingPending.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 space-y-3">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Outgoing Requests</h3>
                  <p className="text-xs text-slate-500">You do not have any pending connection requests sent to other members.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {outgoingPending.map((item) => {
                    const peer = item.user;
                    if (!peer) return null;
                    return (
                      <div
                        key={item.connectionId}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <Link href={`/members/${peer._id}`} className="shrink-0">
                            <img
                              src={peer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(peer.name)}`}
                              alt={peer.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/members/${peer._id}`}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#ff447e] transition-colors truncate block"
                            >
                              {peer.name}
                            </Link>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                              {peer.role}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Waiting for response</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                          <Link
                            href={`/members/${peer._id}`}
                            className="text-xs font-bold text-gray-500 hover:text-[#ff447e]"
                          >
                            View Profile
                          </Link>

                          <button
                            onClick={() => handleRemove(peer._id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
