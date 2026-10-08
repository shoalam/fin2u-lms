'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  useGetSupportInquiriesQuery,
  useUpdateSupportInquiryMutation,
  useDeleteSupportInquiryMutation,
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
  SupportInquiry,
} from '@/store/api/adminApi';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Eye,
  Send,
  Save,
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Mail,
  User,
  MapPin,
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
  Check,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSupportManagementPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Active Main Tab: 'tickets' | 'cms'
  const [activeTab, setActiveTab] = useState<'tickets' | 'cms'>('tickets');

  // Query state for tickets
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // API Queries
  const {
    data: inquiriesData,
    isLoading: isLoadingInquiries,
    isFetching: isFetchingInquiries,
    refetch: refetchInquiries,
  } = useGetSupportInquiriesQuery(
    {
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      topic: topicFilter !== 'all' ? topicFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      page,
      limit: 15,
    },
    { skip: user?.role !== 'admin' }
  );

  const {
    data: websiteSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useGetWebsiteSettingsQuery(undefined, { skip: user?.role !== 'admin' });

  const [updateInquiry, { isLoading: isUpdatingInquiry }] = useUpdateSupportInquiryMutation();
  const [deleteInquiry, { isLoading: isDeletingInquiry }] = useDeleteSupportInquiryMutation();
  const [updateWebsiteSettings, { isLoading: isSavingSettings }] = useUpdateWebsiteSettingsMutation();

  // Selected Inquiry for Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportInquiry | null>(null);
  const [ticketStatus, setTicketStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'closed'>('pending');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketAdminNotes, setTicketAdminNotes] = useState('');
  const [ticketReplyMessage, setTicketReplyMessage] = useState('');
  const [ticketModalSuccess, setTicketModalSuccess] = useState(false);

  // CMS Form State
  const [cmsForm, setCmsForm] = useState<any>(null);
  const [cmsSaveSuccess, setCmsSaveSuccess] = useState(false);

  // New FAQ Modal State
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState('courses');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // New Topic state
  const [newTopicInput, setNewTopicInput] = useState('');

  useEffect(() => {
    if (websiteSettings && !cmsForm) {
      setCmsForm(JSON.parse(JSON.stringify(websiteSettings)));
    }
  }, [websiteSettings]);

  useEffect(() => {
    if (selectedTicket) {
      setTicketStatus(selectedTicket.status);
      setTicketPriority(selectedTicket.priority);
      setTicketAdminNotes(selectedTicket.adminNotes || '');
      setTicketReplyMessage(selectedTicket.replyMessage || '');
      setTicketModalSuccess(false);
    }
  }, [selectedTicket]);

  const inquiries = inquiriesData?.inquiries || [];
  const stats = inquiriesData?.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 };
  const pagination = inquiriesData?.pagination || { total: 0, page: 1, limit: 15, pages: 1 };

  // Handle Ticket update
  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await updateInquiry({
        id: selectedTicket._id,
        status: ticketStatus,
        priority: ticketPriority,
        adminNotes: ticketAdminNotes,
        replyMessage: ticketReplyMessage,
      }).unwrap();

      setTicketModalSuccess(true);
      setTimeout(() => {
        setTicketModalSuccess(false);
        setSelectedTicket(null);
      }, 1200);
      refetchInquiries();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update support ticket.');
    }
  };

  // Quick Inline Status Update
  const handleQuickStatusChange = async (ticketId: string, newStatus: 'pending' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      await updateInquiry({
        id: ticketId,
        status: newStatus,
      }).unwrap();
      refetchInquiries();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to change status.');
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this support ticket permanently?')) return;
    try {
      await deleteInquiry(ticketId).unwrap();
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
      refetchInquiries();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete ticket.');
    }
  };

  // Handle Save CMS
  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsForm) return;
    try {
      await updateWebsiteSettings(cmsForm).unwrap();
      setCmsSaveSuccess(true);
      setTimeout(() => setCmsSaveSuccess(false), 3000);
      refetchSettings();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to save support settings.');
    }
  };

  // Add / Edit FAQ
  const handleSaveFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Please enter both the Question and Answer.');
      return;
    }

    const currentFaqs = cmsForm?.supportPage?.faqs || [];
    let updatedFaqs = [...currentFaqs];

    if (editingFaqIndex !== null && editingFaqIndex >= 0) {
      updatedFaqs[editingFaqIndex] = {
        ...updatedFaqs[editingFaqIndex],
        category: faqCategory,
        q: faqQuestion.trim(),
        a: faqAnswer.trim(),
      };
    } else {
      updatedFaqs.push({
        id: `faq-${Date.now()}`,
        category: faqCategory,
        q: faqQuestion.trim(),
        a: faqAnswer.trim(),
      });
    }

    setCmsForm({
      ...cmsForm,
      supportPage: {
        ...cmsForm.supportPage,
        faqs: updatedFaqs,
      },
    });

    setShowFaqModal(false);
    setEditingFaqIndex(null);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleDeleteFaq = (index: number) => {
    if (!window.confirm('Are you sure you want to remove this FAQ item?')) return;
    const currentFaqs = cmsForm?.supportPage?.faqs || [];
    const updated = currentFaqs.filter((_: any, idx: number) => idx !== index);
    setCmsForm({
      ...cmsForm,
      supportPage: {
        ...cmsForm.supportPage,
        faqs: updated,
      },
    });
  };

  // Add Topic
  const handleAddTopic = () => {
    if (!newTopicInput.trim()) return;
    const currentTopics = cmsForm?.supportPage?.topics || [];
    if (currentTopics.includes(newTopicInput.trim())) {
      alert('This topic already exists.');
      return;
    }
    setCmsForm({
      ...cmsForm,
      supportPage: {
        ...cmsForm.supportPage,
        topics: [...currentTopics, newTopicInput.trim()],
      },
    });
    setNewTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    const currentTopics = cmsForm?.supportPage?.topics || [];
    setCmsForm({
      ...cmsForm,
      supportPage: {
        ...cmsForm.supportPage,
        topics: currentTopics.filter((t: string) => t !== topicToRemove),
      },
    });
  };

  // Helpers for badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-black';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <AdminHeader
        title="Support & Helpdesk Management"
        icon={LifeBuoy}
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/support"
              target="_blank"
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Preview Live Support Page"
            >
              <ExternalLink className="w-4 h-4 text-[#ff447e]" />
              <span className="hidden md:inline">Live Page</span>
            </Link>

            <button
              onClick={() => {
                refetchInquiries();
                refetchSettings();
              }}
              disabled={isFetchingInquiries || isLoadingSettings}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              title="Refresh Inquiries and Settings"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingInquiries ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#02133b] via-[#041c53] to-[#0b2b6d] text-white p-5 md:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#ff447e] flex items-center justify-center shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black">Support & Direct Assistance Hub</h2>
                {stats.pending > 0 && (
                  <span className="animate-pulse px-2.5 py-0.5 rounded-full bg-[#ff447e] text-white text-[10px] font-extrabold uppercase">
                    {stats.pending} Needs Attention
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">
                Manage user support tickets, customer inquiries, hotline details, and dynamic FAQ knowledge base.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-[#ff447e] to-[#e0336b] text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquiries & Tickets</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-white text-[10px] font-black">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cms'
                  ? 'bg-gradient-to-r from-[#ff447e] to-[#e0336b] text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Direct Assistance & FAQ CMS</span>
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: TICKETS & INQUIRIES MANAGEMENT */}
        {/* ============================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#041c53] flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-gray-400">Total Inquiries</p>
                  <h3 className="text-2xl font-black text-[#041c53]">{stats.total}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-amber-600">Pending Review</p>
                  <h3 className="text-2xl font-black text-amber-700">{stats.pending}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-blue-600">In Progress</p>
                  <h3 className="text-2xl font-black text-blue-700">{stats.in_progress}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase text-emerald-600">Resolved / Closed</p>
                  <h3 className="text-2xl font-black text-emerald-700">{stats.resolved + stats.closed}</h3>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by student name, email, subject, keyword..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl flex-wrap">
                  {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        statusFilter === st
                          ? 'bg-[#041c53] text-white shadow-xs'
                          : 'text-gray-600 hover:text-[#041c53]'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Filters */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filters:</span>
                </div>

                {/* Topic filter */}
                <select
                  value={topicFilter}
                  onChange={(e) => {
                    setTopicFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                >
                  <option value="all">All Topics</option>
                  <option value="Course Access">Course Access</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Billing">Billing & Payments</option>
                  <option value="Mentor Application">Mentor Application</option>
                  <option value="Corporate Inquiry">Corporate Inquiry</option>
                  <option value="Technical Help">Technical Help</option>
                  <option value="General">General</option>
                </select>

                {/* Priority filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {(statusFilter !== 'all' || topicFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setTopicFilter('all');
                      setPriorityFilter('all');
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="text-xs font-bold text-[#ff447e] hover:underline ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Inquiries Table List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {isLoadingInquiries ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff447e] mx-auto" />
                  <p className="text-xs text-gray-400 mt-3 font-semibold">Loading support tickets...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="font-extrabold text-base text-[#041c53]">No support tickets found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    There are no support tickets matching your current query filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                        <th className="py-3.5 px-6">Sender & Contact</th>
                        <th className="py-3.5 px-6">Topic & Subject</th>
                        <th className="py-3.5 px-4">Priority</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Received</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {inquiries.map((ticket) => (
                        <tr
                          key={ticket._id}
                          className="hover:bg-pink-50/30 transition-colors group cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#041c53] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {ticket.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-[#041c53] truncate">{ticket.name}</p>
                                <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span>{ticket.email}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-extrabold">
                                  {ticket.topic}
                                </span>
                                {ticket.replyMessage && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-200">
                                    Replied
                                  </span>
                                )}
                              </div>
                              <p className="font-extrabold text-[#041c53] truncate">{ticket.subject}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">{ticket.message}</p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase border tracking-wider ${getPriorityBadge(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </td>

                          <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left">
                              <select
                                value={ticket.status}
                                onChange={(e) =>
                                  handleQuickStatusChange(ticket._id, e.target.value as any)
                                }
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border uppercase tracking-wider focus:outline-none cursor-pointer ${getStatusBadge(
                                  ticket.status
                                )}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-[#041c53] text-gray-600 hover:text-white transition-colors"
                                title="View & Reply"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(ticket._id)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Showing page <strong className="text-[#041c53]">{pagination.page}</strong> of{' '}
                    <strong className="text-[#041c53]">{pagination.pages}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: DIRECT ASSISTANCE & FAQ CMS */}
        {/* ============================================================= */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveCMS} className="space-y-8 animate-in fade-in duration-200">
            {cmsSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">Direct Assistance & Support Settings Saved Live to Public Page!</span>
              </div>
            )}

            {/* Direct Assistance Hero Section Settings */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#ff447e]" />
                  <h3 className="text-base font-black text-[#041c53]">Support Page Hero Header</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Top Badge
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.heroBadge || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, heroBadge: e.target.value },
                      })
                    }
                    placeholder="24/7 Fin2u Knowledge & Help Desk"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.heroTitle || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, heroTitle: e.target.value },
                      })
                    }
                    placeholder="How Can We Assist You Today?"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={cmsForm?.supportPage?.heroSubtitle || ''}
                  onChange={(e) =>
                    setCmsForm({
                      ...cmsForm,
                      supportPage: { ...cmsForm?.supportPage, heroSubtitle: e.target.value },
                    })
                  }
                  placeholder="Find quick answers to common questions about course enrollments, free certificate verification..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Direct Assistance Section & Contact Channels */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-[#041c53]" />
                  <h3 className="text-base font-black text-[#041c53]">
                    Direct Assistance & Quick Channels Configuration
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Direct Assistance Badge
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.directAssistanceBadge || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, directAssistanceBadge: e.target.value },
                      })
                    }
                    placeholder="DIRECT ASSISTANCE"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Direct Assistance Section Title
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.directAssistanceTitle || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, directAssistanceTitle: e.target.value },
                      })
                    }
                    placeholder="Still Have Questions? Send Us a Message"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Direct Assistance Subtitle
                </label>
                <input
                  type="text"
                  value={cmsForm?.supportPage?.directAssistanceSubtitle || ''}
                  onChange={(e) =>
                    setCmsForm({
                      ...cmsForm,
                      supportPage: { ...cmsForm?.supportPage, directAssistanceSubtitle: e.target.value },
                    })
                  }
                  placeholder="Our academic advisors, technical engineers, and mentor coordinators review tickets around the clock."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                />
              </div>

              {/* Contact Channels Grid */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Support Email Desk Address
                  </label>
                  <input
                    type="email"
                    value={cmsForm?.supportPage?.emailDeskEmail || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, emailDeskEmail: e.target.value },
                      })
                    }
                    placeholder="support@fin2u.net"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Desk Response Time Note
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.emailDeskHours || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, emailDeskHours: e.target.value },
                      })
                    }
                    placeholder="⚡ Average response: < 24 hours"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Direct Hotline Phone
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.hotlinePhone || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, hotlinePhone: e.target.value },
                      })
                    }
                    placeholder="+60 3-8080 0000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hotline Operating Hours
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.hotlineHours || ''}
                    onChange={(e) =>
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, hotlineHours: e.target.value },
                      })
                    }
                    placeholder="🕒 Mon–Fri, 9:00 AM – 6:00 PM (MYT)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-medium"
                  />
                </div>
              </div>

              {/* Operating Hours & Headquarters Lines */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Operating Hours Text (Line 1 & 2)
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.operatingHours?.[0] || ''}
                    onChange={(e) => {
                      const list = [...(cmsForm?.supportPage?.operatingHours || ['', ''])];
                      list[0] = e.target.value;
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, operatingHours: list },
                      });
                    }}
                    placeholder="Monday – Friday: 9:00 AM – 6:00 PM (GMT+8)"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs mb-2 font-medium"
                  />
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.operatingHours?.[1] || ''}
                    onChange={(e) => {
                      const list = [...(cmsForm?.supportPage?.operatingHours || ['', ''])];
                      list[1] = e.target.value;
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, operatingHours: list },
                      });
                    }}
                    placeholder="Saturday & Sunday: Email Support Only"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Headquarters Address (Line 1 & 2)
                  </label>
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.headquarters?.[0] || ''}
                    onChange={(e) => {
                      const list = [...(cmsForm?.supportPage?.headquarters || ['', ''])];
                      list[0] = e.target.value;
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, headquarters: list },
                      });
                    }}
                    placeholder="Level 28, Menara Fin2u, Jalan Sultan Ismail,"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs mb-2 font-medium"
                  />
                  <input
                    type="text"
                    value={cmsForm?.supportPage?.headquarters?.[1] || ''}
                    onChange={(e) => {
                      const list = [...(cmsForm?.supportPage?.headquarters || ['', ''])];
                      list[1] = e.target.value;
                      setCmsForm({
                        ...cmsForm,
                        supportPage: { ...cmsForm?.supportPage, headquarters: list },
                      });
                    }}
                    placeholder="50250 Kuala Lumpur, Malaysia"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Support Topics / Categories Manager */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Tag className="w-5 h-5 text-[#041c53]" />
                  <h3 className="text-base font-black text-[#041c53]">Support Topics & Categories</h3>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                These categories appear in the user dropdown when submitting an inquiry.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {(cmsForm?.supportPage?.topics || []).map((topic: string) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-[#041c53] text-xs font-bold border border-gray-200"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      className="p-0.5 rounded-md hover:bg-rose-100 text-gray-400 hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-md pt-2">
                <input
                  type="text"
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  placeholder="New topic name (e.g. Partnership)..."
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-[#041c53] hover:bg-[#03153d] text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>
            </div>

            {/* Dynamic FAQs Manager */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-[#ff447e]" />
                  <h3 className="text-base font-black text-[#041c53]">
                    Knowledge Base FAQs ({cmsForm?.supportPage?.faqs?.length || 0})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingFaqIndex(null);
                    setFaqCategory('courses');
                    setFaqQuestion('');
                    setFaqAnswer('');
                    setShowFaqModal(true);
                  }}
                  className="px-3.5 py-2 bg-[#041c53] hover:bg-[#03153d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {(cmsForm?.supportPage?.faqs || []).map((faq: any, idx: number) => (
                  <div
                    key={faq.id || idx}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#041c53] text-white text-[10px] font-extrabold uppercase">
                          {faq.category}
                        </span>
                        <h5 className="font-extrabold text-xs text-[#041c53]">{faq.q}</h5>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFaqIndex(idx);
                            setFaqCategory(faq.category || 'courses');
                            setFaqQuestion(faq.q || '');
                            setFaqAnswer(faq.a || '');
                            setShowFaqModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold"
                          title="Edit FAQ"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(idx)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="btn btn-primary text-xs py-3 px-8 shadow-md shadow-pink-500/20 flex items-center gap-2 font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Publishing Changes...' : 'Save Support & Helpdesk Settings Live'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ============================================================= */}
      {/* TICKET DETAILS & REPLY MODAL */}
      {/* ============================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 custom-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(
                      ticketStatus
                    )}`}
                  >
                    {ticketStatus.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadge(
                      ticketPriority
                    )}`}
                  >
                    {ticketPriority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#041c53]">{selectedTicket.subject}</h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketModalSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Ticket status and notes updated successfully!</span>
              </div>
            )}

            {/* Sender Info Bar */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase">Sender Name</p>
                <p className="font-extrabold text-[#041c53] mt-0.5">{selectedTicket.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase">Sender Email</p>
                <a
                  href={`mailto:${selectedTicket.email}`}
                  className="font-bold text-[#ff447e] hover:underline mt-0.5 block truncate"
                >
                  {selectedTicket.email}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase">Category</p>
                <p className="font-bold text-gray-700 mt-0.5">{selectedTicket.topic}</p>
              </div>
            </div>

            {/* Original Customer Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-[#041c53]">
                Customer Inquiry Message
              </label>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.message}
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                Submitted on: {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#041c53] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Update Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#041c53] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={ticketAdminNotes}
                  onChange={(e) => setTicketAdminNotes(e.target.value)}
                  placeholder="Private notes for academy support staff..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium resize-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Reply Response to Customer (Dispatches Email Notification)
                </label>
                <textarea
                  rows={3}
                  value={ticketReplyMessage}
                  onChange={(e) => setTicketReplyMessage(e.target.value)}
                  placeholder="Enter reply message to send to the student / user..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(selectedTicket._id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Ticket</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="btn btn-outline text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingInquiry}
                    className="btn btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUpdatingInquiry ? 'Saving...' : 'Save & Send Update'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* FAQ ADD / EDIT MODAL */}
      {/* ============================================================= */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-[#041c53]">
                {editingFaqIndex !== null ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#041c53] focus:outline-none"
                >
                  <option value="courses">Course Access</option>
                  <option value="certificates">Certificates</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="mentors">Mentorship</option>
                  <option value="technical">Technical Help</option>
                  <option value="community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I download my certificate?"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Detailed clear response for students and visitors..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="btn btn-outline text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFaq}
                className="btn btn-primary text-xs py-2 px-5 font-bold shadow-sm"
              >
                {editingFaqIndex !== null ? 'Update FAQ' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
