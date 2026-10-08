'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
  useDeleteAdminGroupMutation,
  useAddAdminGroupMemberMutation,
  useRemoveAdminGroupMemberMutation,
  useGetAdminGroupPostsQuery,
  useDeleteAdminGroupPostMutation,
  useDeleteAdminGroupCommentMutation,
  useGetAdminUsersQuery,
  AdminGroupItem,
  AdminGroupMember,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUploader from '@/components/common/ImageUploader';
import { StorageFolders } from '@/constants/storage-folders';
import {
  Users,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  FolderPlus,
  UserPlus,
  UserMinus,
  MessageCircle,
  Lock,
  Globe,
  Grid,
  List,
  RefreshCw,
  X,
  ExternalLink,
  Shield,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminGroupsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter & Pagination States
  const [groupSearch, setGroupSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<'all' | 'public' | 'private'>('all');
  const [groupSort, setGroupSort] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [groupViewMode, setGroupViewMode] = useState<'grid' | 'table'>('grid');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(groupSearch);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [groupSearch]);

  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
    isFetching: isFetchingGroups,
  } = useGetAdminGroupsQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch,
      type: groupTypeFilter,
      sort: groupSort,
    },
    { skip: user?.role !== 'admin' }
  );

  const groups = groupsData?.groups || [];
  const pagination = groupsData?.pagination || {
    total: 0,
    page: 1,
    limit: pageLimit,
    pages: 1,
  };
  const stats = groupsData?.stats || {
    totalGroups: 0,
    totalMembers: 0,
    totalPublic: 0,
    totalPrivate: 0,
  };

  const { data: usersData } = useGetAdminUsersQuery({ limit: 100 }, { skip: user?.role !== 'admin' });
  const users = usersData?.users || [];

  const [createAdminGroup, { isLoading: isCreatingGroup }] = useCreateAdminGroupMutation();
  const [updateAdminGroup, { isLoading: isUpdatingGroup }] = useUpdateAdminGroupMutation();
  const [deleteAdminGroup, { isLoading: isDeletingGroup }] = useDeleteAdminGroupMutation();
  const [addAdminGroupMember, { isLoading: isAddingMember }] = useAddAdminGroupMemberMutation();
  const [removeAdminGroupMember, { isLoading: isRemovingMember }] = useRemoveAdminGroupMemberMutation();
  const [deleteAdminGroupPost] = useDeleteAdminGroupPostMutation();
  const [deleteAdminGroupComment] = useDeleteAdminGroupCommentMutation();

  // Modals
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdminGroupItem | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    slug: '',
    description: '',
    avatar: '',
    cover: 'https://fin2u.net/wp-content/uploads/buddypress/groups/0/cover-image/g2-1.jpg',
    type: 'public' as 'public' | 'private',
  });

  const [groupMembersModalOpen, setGroupMembersModalOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<AdminGroupItem | null>(null);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const [groupPostsModalOpen, setGroupPostsModalOpen] = useState(false);
  const [selectedGroupIdForPosts, setSelectedGroupIdForPosts] = useState<string | null>(null);
  const [selectedGroupForPosts, setSelectedGroupForPosts] = useState<AdminGroupItem | null>(null);

  const {
    data: selectedGroupPosts = [],
    isLoading: isLoadingGroupPosts,
    refetch: refetchGroupPosts,
  } = useGetAdminGroupPostsQuery(selectedGroupIdForPosts || '', {
    skip: !selectedGroupIdForPosts,
  });

  const handleSort = (field: string) => {
    const [currentField, currentDir] = groupSort.split(':');
    if (currentField === field) {
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';
      setGroupSort(`${field}:${nextDir}`);
    } else {
      setGroupSort(`${field}:asc`);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDir] = groupSort.split(':');
    if (currentField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60" />;
    }
    return currentDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#ff447e]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#ff447e]" />
    );
  };

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      slug: '',
      description: '',
      avatar: '',
      cover: 'https://fin2u.net/wp-content/uploads/buddypress/groups/0/cover-image/g2-1.jpg',
      type: 'public',
    });
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: AdminGroupItem) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      slug: group.slug,
      description: group.description || '',
      avatar: group.avatar || '',
      cover: group.cover || '',
      type: group.type,
    });
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    try {
      if (editingGroup) {
        await updateAdminGroup({
          id: editingGroup._id,
          name: groupForm.name,
          slug: groupForm.slug || groupForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: groupForm.description,
          avatar: groupForm.avatar,
          cover: groupForm.cover,
          type: groupForm.type,
        }).unwrap();
      } else {
        await createAdminGroup({
          name: groupForm.name,
          slug: groupForm.slug || groupForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: groupForm.description,
          avatar: groupForm.avatar,
          cover: groupForm.cover,
          type: groupForm.type,
        }).unwrap();
      }
      setGroupModalOpen(false);
      refetchGroups();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save group');
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete community group "${name}"? All group discussions will be permanently deleted.`))
      return;
    try {
      await deleteAdminGroup(id).unwrap();
      refetchGroups();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete group');
    }
  };

  // Member Management
  const handleOpenMembersModal = (group: AdminGroupItem) => {
    setSelectedGroupForMembers(group);
    setAddMemberUserId('');
    setMemberSearchQuery('');
    setGroupMembersModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupForMembers || !addMemberUserId) return;
    try {
      const res: any = await addAdminGroupMember({
        id: selectedGroupForMembers._id,
        userId: addMemberUserId,
      }).unwrap();
      if (res?.group) setSelectedGroupForMembers(res.group);
      setAddMemberUserId('');
      refetchGroups();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to add member to group');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroupForMembers) return;
    if (!confirm('Remove this member from the group?')) return;
    try {
      const res: any = await removeAdminGroupMember({
        id: selectedGroupForMembers._id,
        userId,
      }).unwrap();
      if (res?.group) setSelectedGroupForMembers(res.group);
      refetchGroups();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to remove member');
    }
  };

  // Post Moderation
  const handleOpenPostsModal = (group: AdminGroupItem) => {
    setSelectedGroupForPosts(group);
    setSelectedGroupIdForPosts(group._id);
    setGroupPostsModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!selectedGroupIdForPosts) return;
    if (!confirm('Delete this community post?')) return;
    try {
      await deleteAdminGroupPost(postId).unwrap();
      refetchGroupPosts();
      refetchGroups();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!selectedGroupIdForPosts) return;
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteAdminGroupComment({
        postId,
        commentId,
      }).unwrap();
      refetchGroupPosts();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <>
      <AdminHeader
        title="Community Groups & Moderation"
        icon={Users}
        actions={
          <>
            <button
              onClick={() => refetchGroups()}
              disabled={isFetchingGroups}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh Groups"
            >
              <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingGroups ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={handleOpenCreateGroup}
              className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">Community Circles & Group Manager</h2>
              <p className="text-xs text-gray-300">
                Manage cohort learning circles, curate members, moderate member discussions, and set group visibility.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15">
              {stats.totalGroups} Circles Active
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Circles</span>
            <p className="text-xl font-black text-[#041c53]">{stats.totalGroups}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Memberships</span>
            <p className="text-xl font-black text-[#ff447e]">{stats.totalMembers}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Public Circles</span>
            <p className="text-xl font-black text-emerald-600">{stats.totalPublic}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-400">Private Cohorts</span>
            <p className="text-xl font-black text-amber-500">{stats.totalPrivate}</p>
          </div>
        </div>

        {/* Filters and View Mode Switcher */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search community groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
            />
            {groupSearch && (
              <button
                onClick={() => setGroupSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <select
              value={groupTypeFilter}
              onChange={(e) => {
                setGroupTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public Groups</option>
              <option value="private">Private Cohorts</option>
            </select>

            <select
              value={groupSort}
              onChange={(e) => {
                setGroupSort(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="memberCount:desc">Most Members</option>
              <option value="memberCount:asc">Fewest Members</option>
            </select>

            <select
              value={pageLimit}
              onChange={(e) => {
                setPageLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff447e]"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setGroupViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  groupViewMode === 'grid' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGroupViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  groupViewMode === 'table' ? 'bg-white text-[#041c53] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Groups Content */}
        {isLoadingGroups ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
            <p className="text-xs text-gray-400 mt-3 font-semibold">Loading community groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#041c53]">No Community Groups Found</h3>
            <p className="text-xs text-gray-400">
              {debouncedSearch || groupTypeFilter !== 'all'
                ? 'Try adjusting your search criteria or visibility filters.'
                : 'Create your first community circle to engage students and mentors.'}
            </p>
          </div>
        ) : groupViewMode === 'grid' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => {
                const memberCount = group.memberCount || group.members?.length || 0;
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <Link
                      href={`/groups/${group.slug}`}
                      target="_blank"
                      className="relative h-32 w-full bg-gray-100 overflow-hidden block group/cover cursor-pointer"
                      title={`Visit ${group.name} live page`}
                    >
                      <img
                        src={
                          group.cover ||
                          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={group.name}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                            group.type === 'public'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-900/80 backdrop-blur-xs text-white'
                          }`}
                        >
                          {group.type}
                        </span>
                      </div>

                      {/* Hover Visit Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                        <span>Visit Live Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </Link>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/groups/${group.slug}`}
                          target="_blank"
                          className="font-extrabold text-base text-[#041c53] hover:text-[#ff447e] transition-colors line-clamp-1 flex items-center justify-between gap-1 group/title"
                        >
                          <span>{group.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/title:text-[#ff447e] shrink-0" />
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {group.description || 'Dedicated discussion circle for course discussions and insights.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#ff447e]" />
                          <span>{memberCount} Members</span>
                        </span>
                        <Link
                          href={`/groups/${group.slug}`}
                          target="_blank"
                          className="text-[11px] text-gray-400 hover:text-[#ff447e] hover:underline flex items-center gap-1 font-mono"
                          title="Open group link"
                        >
                          <span>/{group.slug}</span>
                        </Link>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenMembersModal(group)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#041c53]/5 hover:bg-[#041c53] hover:text-white text-[#041c53] text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Members</span>
                          </button>
                          <button
                            onClick={() => handleOpenPostsModal(group)}
                            className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-[#ff447e] hover:text-white text-[#ff447e] text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Posts</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/groups/${group.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Visit Live Group Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditGroup(group)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Group"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group._id, group.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                    <th
                      onClick={() => handleSort('name')}
                      className="py-3.5 px-5 cursor-pointer hover:text-[#041c53] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Group Name</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Slug Identifier</th>
                    <th className="py-3.5 px-4 text-center">Visibility</th>
                    <th
                      onClick={() => handleSort('memberCount')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Members</span>
                        {getSortIcon('memberCount')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('createdAt')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-[#041c53] transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Created</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {groups.map((group) => {
                    const memberCount = group.memberCount || group.members?.length || 0;
                    return (
                      <tr key={group._id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-[#041c53]">
                          <Link
                            href={`/groups/${group.slug}`}
                            target="_blank"
                            className="flex items-center gap-3 hover:text-[#ff447e] transition-colors group/row"
                          >
                            <img
                              src={
                                group.cover ||
                                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80'
                              }
                              alt={group.name}
                              className="w-10 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                            <div className="flex items-center gap-1.5">
                              <span>{group.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                          <Link
                            href={`/groups/${group.slug}`}
                            target="_blank"
                            className="hover:text-[#ff447e] hover:underline"
                          >
                            /{group.slug}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              group.type === 'public'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {group.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-[#041c53]">{memberCount}</td>

                        <td className="py-3.5 px-4 text-center text-gray-500 text-[11px]">
                          {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/groups/${group.slug}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Visit live group page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Visit</span>
                            </Link>
                            <button
                              onClick={() => handleOpenMembersModal(group)}
                              className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#041c53] text-xs font-bold"
                            >
                              Members
                            </button>
                            <button
                              onClick={() => handleOpenPostsModal(group)}
                              className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold"
                            >
                              Posts
                            </button>
                            <button
                              onClick={() => handleOpenEditGroup(group)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                              title="Edit Group"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group._id, group.name)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                              title="Delete Group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Server Pagination Controls */}
        {pagination.total > 0 && (
          <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-[#041c53]">{(currentPage - 1) * pageLimit + 1}</span> to{' '}
              <span className="font-bold text-[#041c53]">
                {Math.min(currentPage * pageLimit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-[#041c53]">{pagination.total}</span> community groups
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetchingGroups}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.pages <= 7) return true;
                    if (p === 1 || p === pagination.pages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((pageItem, idx) => {
                    if (typeof pageItem === 'string') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const isSelected = pageItem === currentPage;
                    return (
                      <button
                        key={pageItem}
                        onClick={() => setCurrentPage(pageItem)}
                        disabled={isFetchingGroups}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#ff447e] text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageItem}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={currentPage >= pagination.pages || isFetchingGroups}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE / EDIT GROUP */}
      {groupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">
                    {editingGroup ? 'Edit Community Group' : 'Create New Group'}
                  </h3>
                  <p className="text-xs text-gray-400">Configure community circle info & privacy.</p>
                </div>
              </div>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Islamic Wealth Planning Mastermind"
                  value={groupForm.name}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      name: e.target.value,
                      slug: editingGroup ? groupForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g., islamic-wealth-mastermind"
                  value={groupForm.slug}
                  onChange={(e) => setGroupForm({ ...groupForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Visibility Type</label>
                <select
                  value={groupForm.type}
                  onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="public">Public (Open for all students)</option>
                  <option value="private">Private (Admin & Mentor Invite only)</option>
                </select>
              </div>

              <div className="space-y-3">
                <ImageUploader
                  label="Group Avatar / Logo"
                  value={groupForm.avatar}
                  onChange={(url) => setGroupForm({ ...groupForm, avatar: url })}
                  folder={StorageFolders.GROUPS_AVATARS}
                  aspectRatio="square"
                  helperText="Square icon or emblem for community circle (PNG, JPG, WEBP)."
                />

                <ImageUploader
                  label="Group Header Cover Banner"
                  value={groupForm.cover}
                  onChange={(url) => setGroupForm({ ...groupForm, cover: url })}
                  folder={StorageFolders.GROUPS_COVERS}
                  aspectRatio="banner"
                  helperText="Landscape banner displayed at top of group discussion board."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Purpose, discussion rules, and goals of this circle..."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || isUpdatingGroup}
                  className="btn btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  {isCreatingGroup || isUpdatingGroup ? 'Saving...' : 'Save Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GROUP MEMBERS MANAGER */}
      {groupMembersModalOpen && selectedGroupForMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-[#041c53]">Manage Members</h3>
                    <Link
                      href={`/groups/${selectedGroupForMembers.slug}`}
                      target="_blank"
                      className="text-[11px] font-bold text-[#ff447e] hover:underline inline-flex items-center gap-1"
                      title="Open live group page"
                    >
                      <span>Visit Live Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400">{selectedGroupForMembers.name}</p>
                </div>
              </div>
              <button
                onClick={() => setGroupMembersModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <label className="block text-xs font-bold uppercase text-[#041c53]">Add User to Group</label>
              <div className="flex gap-2">
                <select
                  required
                  value={addMemberUserId}
                  onChange={(e) => setAddMemberUserId(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="">-- Select Registered User --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role.toUpperCase()}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="btn btn-primary text-xs py-2 px-4 shrink-0 shadow-sm"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>

            {/* Members List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-gray-400">
                  Current Members ({selectedGroupForMembers.members?.length || 0})
                </h4>
                <div className="relative w-48">
                  <input
                    type="text"
                    placeholder="Filter members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {!selectedGroupForMembers.members || selectedGroupForMembers.members.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
                  No members currently in this circle.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedGroupForMembers.members
                    .filter((m: AdminGroupMember) => {
                      const name = m.name?.toLowerCase() || '';
                      const email = m.email?.toLowerCase() || '';
                      return name.includes(memberSearchQuery.toLowerCase()) || email.includes(memberSearchQuery.toLowerCase());
                    })
                    .map((member: AdminGroupMember) => (
                      <div
                        key={member._id || Math.random()}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              member.avatar ||
                              'https://ui-avatars.com/api/?name=' +
                                encodeURIComponent(member.name || 'User') +
                                '&background=ff447e&color=fff'
                            }
                            alt={member.name}
                            className="w-8 h-8 rounded-xl object-cover border border-gray-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#041c53] truncate">{member.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-400 truncate">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold uppercase">
                            {member.role || 'Member'}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member._id || '')}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setGroupMembersModalOpen(false)}
                className="btn btn-outline text-xs py-2 px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POSTS & COMMENTS MODERATION */}
      {groupPostsModalOpen && selectedGroupForPosts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-[#041c53]">Moderate Group Discussions</h3>
                    <Link
                      href={`/groups/${selectedGroupForPosts.slug}`}
                      target="_blank"
                      className="text-[11px] font-bold text-[#ff447e] hover:underline inline-flex items-center gap-1"
                      title="Open live group page"
                    >
                      <span>Visit Live Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400">{selectedGroupForPosts.name}</p>
                </div>
              </div>
              <button
                onClick={() => setGroupPostsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingGroupPosts ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff447e] mx-auto" />
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Loading discussions...</p>
                </div>
              ) : selectedGroupPosts.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <MessageCircle className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-bold">No community posts yet</p>
                  <p className="text-[11px] text-gray-400">Members haven't posted in this circle yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedGroupPosts.map((post) => (
                    <div
                      key={post._id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              post.author?.avatar ||
                              'https://ui-avatars.com/api/?name=' +
                                encodeURIComponent(post.author?.name || 'Author') +
                                '&background=ff447e&color=fff'
                            }
                            alt={post.author?.name}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#041c53]">{post.author?.name || 'Community Member'}</span>
                            <span className="text-[10px] text-gray-400 ml-2">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Delete Inappropriate Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setGroupPostsModalOpen(false)}
                className="btn btn-outline text-xs py-2 px-5"
              >
                Close Discussions
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
