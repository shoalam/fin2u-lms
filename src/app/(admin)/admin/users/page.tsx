'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  User,
} from '@/store/api/adminApi';
import AdminHeader from '@/components/admin/AdminHeader';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Users,
  Award,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Filter,
  Check,
  CheckCircle,
  UserX,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Info,
  Eye,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // Server-side query state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userSort, setUserSort] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  // Status operation tracking
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewDetailsUserId, setViewDetailsUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation modal for status change
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    isOpen: boolean;
    user: User | null;
    targetStatus: boolean;
  }>({
    isOpen: false,
    user: null,
    targetStatus: true,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch paginated, filtered, sorted users from server API
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    isFetching: isFetchingUsers,
  } = useGetAdminUsersQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch || undefined,
      role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      sort: userSort,
    },
    { skip: currentUser?.role !== 'admin' }
  );

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination || { total: 0, page: currentPage, limit: pageLimit, pages: 1 };
  const stats = usersResponse?.stats || { totalUsers: 0, totalStudents: 0, totalMentors: 0, totalAdmins: 0, totalActive: 0, totalInactive: 0 };

  const [createAdminUser, { isLoading: isCreatingUser }] = useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdatingUser }] = useUpdateAdminUserMutation();
  const [deleteAdminUser, { isLoading: isDeletingUser }] = useDeleteAdminUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'mentor' | 'admin',
    headline: '',
    bio: '',
    isActive: true,
  });

  const isAnyFilterActive =
    searchInput !== '' ||
    roleFilter !== '' ||
    statusFilter !== '' ||
    userSort !== '-createdAt';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setUserSort('-createdAt');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortToggle = (field: string) => {
    if (userSort === `-${field}`) {
      setUserSort(field);
    } else if (userSort === field) {
      setUserSort(`-${field}`);
    } else {
      setUserSort(`-${field}`);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (userSort === `-${field}`) {
      return <ArrowDown className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    if (userSort === field) {
      return <ArrowUp className="w-3.5 h-3.5 text-[#ff447e]" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />;
  };

  // Helper for generating page numbers with ellipsis
  const getPageNumbers = () => {
    const totalPages = pagination.pages;
    const current = pagination.page;
    const delta = 2;
    const range: (number | string)[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const handleOpenUserModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setUserForm({
        name: u.name,
        email: u.email,
        password: '',
        role: u.role,
        headline: u.headline || '',
        bio: u.bio || '',
        isActive: u.isActive !== false,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: 'User@123456',
        role: 'student',
        headline: '',
        bio: '',
        isActive: true,
      });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateAdminUser({ id: editingUser._id, ...userForm }).unwrap();
        setToastMessage({ type: 'success', text: `User account "${userForm.name}" updated successfully.` });
      } else {
        await createAdminUser(userForm).unwrap();
        setToastMessage({ type: 'success', text: `User account "${userForm.name}" created successfully.` });
      }
      setUserModalOpen(false);
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to save user record' });
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?._id) {
      alert('You cannot delete your own active admin account!');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user account "${name}"?`)) return;
    try {
      await deleteAdminUser(id).unwrap();
      setToastMessage({ type: 'success', text: `User "${name}" has been permanently removed.` });
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to delete user' });
    }
  };

  const promptToggleStatus = (user: User) => {
    if (user._id === currentUser?._id) {
      alert('You cannot deactivate your own active admin account.');
      return;
    }
    const currentStatus = user.isActive !== false;
    setConfirmStatusModal({
      isOpen: true,
      user,
      targetStatus: !currentStatus,
    });
  };

  const executeToggleStatus = async () => {
    if (!confirmStatusModal.user) return;
    const { _id, name } = confirmStatusModal.user;
    const targetStatus = confirmStatusModal.targetStatus;
    setUpdatingStatusId(_id);
    setConfirmStatusModal({ isOpen: false, user: null, targetStatus: true });

    try {
      await toggleUserStatus({ id: _id, isActive: targetStatus }).unwrap();
      setToastMessage({
        type: 'success',
        text: `User "${name}" is now ${targetStatus ? 'ACTIVE (Enabled)' : 'SUSPENDED (Disabled)'}.`,
      });
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to update user status' });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleQuickToggle = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user._id === currentUser?._id) {
      alert('You cannot deactivate your own active admin account.');
      return;
    }
    const current = user.isActive !== false;
    const nextStatus = !current;
    setUpdatingStatusId(user._id);

    try {
      await toggleUserStatus({ id: user._id, isActive: nextStatus }).unwrap();
      setToastMessage({
        type: 'success',
        text: `User "${user.name}" status updated to ${nextStatus ? 'Active' : 'Suspended'}.`,
      });
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to toggle status' });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Bulk status update
  const handleBulkStatusChange = async (targetActive: boolean) => {
    if (selectedUserIds.length === 0) return;
    const eligibleIds = selectedUserIds.filter((id) => id !== currentUser?._id);
    if (eligibleIds.length === 0) {
      alert('Cannot modify your own active account.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${targetActive ? 'ACTIVATE' : 'SUSPEND'} ${eligibleIds.length} selected user account(s)?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        eligibleIds.map((id) => toggleUserStatus({ id, isActive: targetActive }).unwrap())
      );
      setToastMessage({
        type: 'success',
        text: `Successfully ${targetActive ? 'activated' : 'suspended'} ${eligibleIds.length} user accounts.`,
      });
      setSelectedUserIds([]);
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to update selected users' });
    }
  };

  const handleSelectAllOnPage = () => {
    if (selectedUserIds.length === users.length && users.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u._id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRoleChange = async (id: string, newRole: 'student' | 'mentor' | 'admin') => {
    try {
      await updateUserRole({ id, role: newRole }).unwrap();
      setToastMessage({ type: 'success', text: `User role changed to ${newRole.toUpperCase()}.` });
      refetchUsers();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err?.data?.message || 'Failed to change role' });
    }
  };

  return (
    <>
      <AdminHeader
        title="User Access & Security Control"
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetchUsers()}
              disabled={isFetchingUsers}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh Users"
            >
              <RefreshCw className={`w-4 h-4 text-[#041c53] ${isFetchingUsers ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={() => handleOpenUserModal()}
              className="px-3.5 py-2 rounded-xl bg-[#ff447e] hover:bg-[#e03368] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-xs font-bold">{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner */}
        <div className="bg-gradient-to-r from-[#041c53] via-[#092b77] to-[#041c53] text-white p-5 md:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black">User Access Control & Identity</h2>
              <p className="text-xs text-gray-300">
                Manage authentication credentials, toggle account activation, assign system roles, and configure security access.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#ff447e]" />
              {stats.totalUsers} Total Accounts
            </span>
          </div>
        </div>

        {/* Real-Time Metrics Grid from API */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === ''
                ? 'bg-white border-[#041c53] shadow-md ring-2 ring-[#041c53]/10'
                : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-[#041c53]" />
            </div>
            <p className="text-xl font-black text-[#041c53]">{stats.totalUsers}</p>
            <span className="text-[10px] text-gray-400">All registered accounts</span>
          </div>

          <div
            onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-gray-100 shadow-sm hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Active</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-600">{stats.totalActive}</p>
            <span className="text-[10px] text-emerald-600/80 font-medium">Enabled & can login</span>
          </div>

          <div
            onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-red-50/70 border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-white border-gray-100 shadow-sm hover:border-red-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">Suspended</span>
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-black text-red-600">{stats.totalInactive}</p>
            <span className="text-[10px] text-red-600/80 font-medium">Deactivated & blocked</span>
          </div>

          <div
            onClick={() => { setRoleFilter('student'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              roleFilter === 'student'
                ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Students</span>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-600">{stats.totalStudents}</p>
            <span className="text-[10px] text-gray-400">Learners</span>
          </div>

          <div
            onClick={() => { setRoleFilter('mentor'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              roleFilter === 'mentor'
                ? 'bg-purple-50/70 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white border-gray-100 shadow-sm hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Faculty</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-black text-purple-600">{stats.totalMentors}</p>
            <span className="text-[10px] text-gray-400">Mentors & trainers</span>
          </div>

          <div
            onClick={() => { setRoleFilter('admin'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-pink-50/70 border-[#ff447e] shadow-md ring-2 ring-[#ff447e]/20'
                : 'bg-white border-gray-100 shadow-sm hover:border-pink-200'
            }`}
          >
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff447e]">Admins</span>
              <Shield className="w-4 h-4 text-[#ff447e]" />
            </div>
            <p className="text-xl font-black text-[#ff447e]">{stats.totalAdmins}</p>
            <span className="text-[10px] text-gray-400">Super administrators</span>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or headline..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#ff447e] focus:bg-white transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Tabs & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Account Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by account status"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses ({stats.totalUsers})</option>
                  <option value="active">Active Only ({stats.totalActive})</option>
                  <option value="inactive">Suspended Only ({stats.totalInactive})</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by role"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All Account Roles</option>
                  <option value="student">Students ({stats.totalStudents})</option>
                  <option value="mentor">Faculty Mentors ({stats.totalMentors})</option>
                  <option value="admin">Administrators ({stats.totalAdmins})</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={userSort}
                  onChange={(e) => {
                    setUserSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Sort users list"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="-createdAt">Newest Joined</option>
                  <option value="createdAt">Oldest Joined</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="email">Email (A-Z)</option>
                  <option value="-email">Email (Z-A)</option>
                  <option value="role">Role (A-Z)</option>
                  <option value="-role">Role (Z-A)</option>
                </select>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] font-bold text-gray-400">Rows:</span>
                <select
                  value={pageLimit}
                  onChange={(e) => {
                    setPageLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Rows per page"
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Reset Filters */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#ff447e] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          {selectedUserIds.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#ff447e] text-white text-xs font-extrabold">
                  {selectedUserIds.length} Selected
                </span>
                <span className="text-xs text-gray-600 font-medium">Apply bulk security status to selected accounts:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Activate All ({selectedUserIds.length})</span>
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Suspend All ({selectedUserIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
            <div>
              {pagination.total > 0 ? (
                <span>
                  Showing{' '}
                  <strong className="text-gray-700">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-gray-700">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>{' '}
                  of <strong className="text-gray-700">{pagination.total}</strong> accounts
                </span>
              ) : (
                <span>0 user accounts found</span>
              )}
              {debouncedSearch && (
                <span className="ml-1 text-[#ff447e] font-semibold">
                  (filtered for &quot;{debouncedSearch}&quot;)
                </span>
              )}
              {statusFilter && (
                <span className="ml-1 text-gray-600 font-semibold">
                  • Status: <span className="capitalize">{statusFilter}</span>
                </span>
              )}
            </div>

            {isFetchingUsers && !isLoadingUsers && (
              <div className="flex items-center gap-1.5 text-xs text-[#ff447e] font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating results...</span>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingUsers ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
              <p className="text-xs text-gray-400 mt-4 font-semibold">Loading user directory...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#ff447e] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#041c53]">No Users Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No user accounts matched your current search filters or criteria.
              </p>
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#041c53] text-white text-xs font-bold hover:bg-[#ff447e] transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider select-none">
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={users.length > 0 && selectedUserIds.length === users.length}
                        onChange={handleSelectAllOnPage}
                        className="rounded border-gray-300 text-[#ff447e] focus:ring-[#ff447e] cursor-pointer"
                        title="Select all on this page"
                      />
                    </th>
                    <th
                      onClick={() => handleSortToggle('name')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>User Profile</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('role')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Role Permission</span>
                        {getSortIcon('role')}
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>Account Status</span>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('createdAt')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Joined Date</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {users.map((u) => {
                    const isActive = u.isActive !== false;
                    const isSelf = u._id === currentUser?._id;
                    const isUpdating = updatingStatusId === u._id;
                    const isSelected = selectedUserIds.includes(u._id);

                    return (
                      <tr
                        key={u._id}
                        className={`transition-colors ${
                          isSelected ? 'bg-pink-50/40' : isActive ? 'hover:bg-gray-50/60' : 'bg-red-50/15 hover:bg-red-50/30'
                        }`}
                      >
                        <td className="py-3.5 pl-5 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectUser(u._id)}
                            className="rounded border-gray-300 text-[#ff447e] focus:ring-[#ff447e] cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div
                            onClick={() => setViewDetailsUserId(u._id)}
                            className="flex items-center gap-3 cursor-pointer group/user select-none"
                            title="Click to inspect full user profile & activity"
                          >
                            <div className="relative">
                              <img
                                src={
                                  u.avatar ||
                                  'https://ui-avatars.com/api/?name=' +
                                    encodeURIComponent(u.name || 'User') +
                                    '&background=ff447e&color=fff'
                                }
                                alt={u.name}
                                className={`w-10 h-10 rounded-2xl object-cover border shrink-0 transition-transform group-hover/user:scale-105 ${
                                  isActive ? 'border-gray-200' : 'border-red-300 grayscale opacity-75'
                                }`}
                              />
                              {/* Status dot badge on avatar */}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  isActive ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                title={isActive ? 'Active Account' : 'Suspended Account'}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p
                                  className={`font-bold truncate group-hover/user:text-[#ff447e] transition-colors ${
                                    isActive ? 'text-[#041c53]' : 'text-gray-500 line-through'
                                  }`}
                                >
                                  {u.name}
                                </p>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                              {u.headline && (
                                <p className="text-[10px] text-gray-500 truncate max-w-xs">{u.headline}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                            disabled={isSelf}
                            aria-label={`Change role for ${u.name}`}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase focus:outline-none border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                              u.role === 'admin'
                                ? 'bg-pink-50 text-[#ff447e]'
                                : u.role === 'mentor'
                                ? 'bg-purple-50 text-purple-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Interactive Active / Inactive Status Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* Toggle Switch Component */}
                            <button
                              type="button"
                              onClick={(e) => handleQuickToggle(u, e)}
                              disabled={isSelf || isUpdating}
                              title={
                                isSelf
                                  ? 'You cannot deactivate your own account'
                                  : isActive
                                  ? 'Account is Active. Click to Suspend/Deactivate.'
                                  : 'Account is Suspended. Click to Activate.'
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                                isActive ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}
                            >
                              <span className="sr-only">Toggle user status</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                  isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="w-2.5 h-2.5 text-gray-500 animate-spin" />
                                ) : isActive ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600 font-bold" />
                                ) : (
                                  <X className="w-2.5 h-2.5 text-red-500 font-bold" />
                                )}
                              </span>
                            </button>

                            {/* Badge Label */}
                            <button
                              onClick={() => promptToggleStatus(u)}
                              disabled={isSelf || isUpdating}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                                }`}
                              />
                              <span>{isActive ? 'Active' : 'Suspended'}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px] font-medium">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Full User Intelligence Details */}
                            <button
                              onClick={() => setViewDetailsUserId(u._id)}
                              className="p-1.5 text-gray-400 hover:text-[#041c53] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Inspect Full User Profile & Activities"
                            >
                              <Eye className="w-4 h-4 text-[#041c53]" />
                            </button>

                            {/* Quick Status Toggle Button */}
                            <button
                              onClick={() => promptToggleStatus(u)}
                              disabled={isSelf || isUpdating}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                              } disabled:opacity-30`}
                              title={isActive ? 'Suspend / Deactivate User' : 'Activate User'}
                            >
                              {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                            </button>

                            {/* Edit User Button */}
                            <button
                              onClick={() => handleOpenUserModal(u)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit User Credentials & Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              disabled={isSelf}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
                              title={isSelf ? 'Cannot delete self' : 'Permanently Delete User'}
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
          )}

          {/* Server-Driven Pagination Bar */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 font-medium">
                Page <strong className="text-[#041c53]">{pagination.page}</strong> of{' '}
                <strong className="text-[#041c53]">{pagination.pages}</strong> ({pagination.total} total accounts)
              </span>

              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold select-none">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => handlePageChange(Number(p))}
                        className={`w-8 h-8 rounded-xl font-bold text-xs transition-all shadow-xs ${
                          pagination.page === p
                            ? 'bg-[#ff447e] text-white shadow-pink-200'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CONFIRMATION MODAL: TOGGLE STATUS */}
      {confirmStatusModal.isOpen && confirmStatusModal.user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  confirmStatusModal.targetStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {confirmStatusModal.targetStatus ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#041c53]">
                  {confirmStatusModal.targetStatus ? 'Activate User Account?' : 'Suspend / Deactivate User?'}
                </h3>
                <p className="text-xs text-gray-400">
                  User: <strong className="text-gray-700">{confirmStatusModal.user.name}</strong> ({confirmStatusModal.user.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              {confirmStatusModal.targetStatus ? (
                <>
                  Reactivating this account will grant the user immediate access to log in, view courses, and interact with the platform.
                </>
              ) : (
                <>
                  Suspending this account will immediately <strong>block login access</strong>. The user will not be able to authenticate until reactivated by an administrator.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmStatusModal({ isOpen: false, user: null, targetStatus: true })}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeToggleStatus}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-colors shadow-xs ${
                  confirmStatusModal.targetStatus
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmStatusModal.targetStatus ? 'Yes, Activate Account' : 'Yes, Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT USER */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ff447e] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#041c53]">
                    {editingUser ? 'Edit User Credentials & Access' : 'Create User Account'}
                  </h3>
                  <p className="text-xs text-gray-400">Configure credentials, status & role permissions.</p>
                </div>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Account Status Radio Selection */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Account Status & Login Permission *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, isActive: true })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      userForm.isActive
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Active (Enabled)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, isActive: false })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      !userForm.isActive
                        ? 'bg-red-500 text-white border-red-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                    <span>Suspended (Disabled)</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  {userForm.isActive
                    ? 'Active users can sign in and participate on the platform.'
                    : 'Suspended users are blocked from logging into their account.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Jane Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., jane@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {editingUser ? 'New Password (leave empty to keep unchanged)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                >
                  <option value="student">Student Learner</option>
                  <option value="mentor">Faculty Mentor</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Shariah Compliance Officer"
                  value={userForm.headline}
                  onChange={(e) => setUserForm({ ...userForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bio</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of professional background..."
                  value={userForm.bio}
                  onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser || isUpdatingUser}
                  className="px-5 py-2 rounded-xl bg-[#ff447e] hover:bg-[#e03368] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {(isCreatingUser || isUpdatingUser) && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCreatingUser || isUpdatingUser ? 'Saving...' : 'Save User Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAILS INTELLIGENCE MODAL */}
      <UserDetailsModal
        userId={viewDetailsUserId}
        isOpen={!!viewDetailsUserId}
        onClose={() => setViewDetailsUserId(null)}
        onEditUser={(u) => handleOpenUserModal(u)}
        currentAdminId={currentUser?._id}
      />
    </>
  );
}
