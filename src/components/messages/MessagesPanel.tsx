'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import {
  useGetConversationsQuery,
  useGetContactsQuery,
  useGetDirectMessagesQuery,
  useSendDirectMessageMutation,
  useMarkAsReadMutation,
  ChatUser,
  ChatMessage,
  ChatAttachment,
} from '@/store/api/messageApi';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  ArrowLeft,
  Users,
  ShieldCheck,
  GraduationCap,
  User as UserIcon,
  Paperclip,
  Image as ImageIcon,
  Reply,
  X,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';

interface MessagesPanelProps {
  portalRole?: 'student' | 'mentor' | 'admin';
}

export default function MessagesPanel({ portalRole = 'student' }: MessagesPanelProps) {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: conversations = [], refetch: refetchConversations } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 4000,
  });

  const { data: contacts = [] } = useGetContactsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [activePartner, setActivePartner] = useState<ChatUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Replying & Attachment states
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachFilename, setAttachFilename] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Direct Messages
  const { data: messages = [], refetch: refetchMessages } = useGetDirectMessagesQuery(
    activePartner?._id || '',
    {
      skip: !activePartner?._id,
      pollingInterval: 3000,
    }
  );

  const [sendDirectMessage, { isLoading: isSending }] = useSendDirectMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  // Handle target user query param or default conversation selection
  useEffect(() => {
    if (targetUserId) {
      const foundInContacts = contacts.find((c) => c._id === targetUserId);
      if (foundInContacts) {
        setActivePartner(foundInContacts);
        setShowMobileChat(true);
        return;
      }
      const foundInConv = conversations.find((c) => c.user._id === targetUserId);
      if (foundInConv) {
        setActivePartner(foundInConv.user);
        setShowMobileChat(true);
        return;
      }
    } else if (!activePartner && conversations.length > 0) {
      setActivePartner(conversations[0].user);
    }
  }, [targetUserId, contacts, conversations, activePartner]);

  // Mark conversation as read when active partner changes
  useEffect(() => {
    if (activePartner?._id) {
      markAsRead(activePartner._id);
    }
  }, [activePartner, markAsRead]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectPartner = (partner: ChatUser) => {
    setActivePartner(partner);
    setShowMobileChat(true);
    setReplyingTo(null);
    setAttachments([]);
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachUrl.trim()) return;

    const url = attachUrl.trim();
    const filename = attachFilename.trim() || (url.split('/').pop() || 'Attachment').slice(0, 30);
    const isImg = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);

    setAttachments((prev) => [
      ...prev,
      {
        url,
        filename,
        mimeType: isImg ? 'image/jpeg' : 'application/octet-stream',
      },
    ]);

    setAttachUrl('');
    setAttachFilename('');
    setShowAttachInput(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && attachments.length === 0) || !activePartner) return;

    const content = messageText.trim();
    const currentAttachments = [...attachments];
    const currentReplyTo = replyingTo?._id;

    setMessageText('');
    setAttachments([]);
    setReplyingTo(null);

    try {
      await sendDirectMessage({
        recipientId: activePartner._id,
        content: content || 'Sent an attachment',
        attachments: currentAttachments,
        replyTo: currentReplyTo,
      }).unwrap();

      refetchMessages();
      refetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
      setMessageText(content);
      setAttachments(currentAttachments);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts
    .filter((c) => !conversations.some((conv) => conv.user._id === c._id))
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
          <ShieldCheck className="w-2.5 h-2.5" /> Admin
        </span>
      );
    }
    if (role === 'mentor') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-100 text-[#ff447e]">
          <GraduationCap className="w-2.5 h-2.5" /> Mentor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
        <UserIcon className="w-2.5 h-2.5" /> Student
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-130px)] min-h-[500px] md:h-[720px]">
      {/* Left Pane: Conversations & Contacts List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-[#041c53] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#ff447e]" />
              <span>Direct Messages</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-[#ff447e]">
              {conversations.length} Active
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations & peers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff447e] transition-colors"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
          {filteredConversations.length === 0 && filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-medium">No conversations or contacts found.</p>
            </div>
          ) : (
            <>
              {/* Active Conversations */}
              {filteredConversations.map((conv) => {
                const isActive = activePartner?._id === conv.user._id;

                return (
                  <button
                    key={conv.user._id}
                    onClick={() => handleSelectPartner(conv.user)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#041c53]/5 border-l-4 border-[#ff447e]'
                        : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          conv.user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}&background=041c53&color=fff`
                        }
                        alt={conv.user.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-gray-200"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff447e] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#041c53] truncate">{conv.user.name}</h4>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        {getRoleBadge(conv.user.role)}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Community Contacts */}
              {filteredContacts.length > 0 && (
                <div className="p-3 bg-gray-100/70 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span>Available Contacts</span>
                </div>
              )}

              {filteredContacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => handleSelectPartner(contact)}
                  className="w-full text-left p-3.5 flex items-center gap-3 hover:bg-white transition-colors cursor-pointer"
                >
                  <img
                    src={
                      contact.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=ff447e&color=fff`
                    }
                    alt={contact.name}
                    className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#041c53] truncate">{contact.name}</h4>
                      {getRoleBadge(contact.role)}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {contact.headline || 'Fin2u Academy Member'}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-white min-w-0 ${
          !showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activePartner ? (
          <>
            {/* Active Header */}
            <div className="p-4 px-5 md:px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-[#041c53] rounded-lg hover:bg-gray-100 cursor-pointer"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={
                    activePartner.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name)}&background=041c53&color=fff`
                  }
                  alt={activePartner.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-gray-200 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#041c53] truncate">{activePartner.name}</h3>
                    {getRoleBadge(activePartner.role)}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {activePartner.headline || 'Active on Fin2u Academy'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Active</span>
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/40 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#041c53]">Start Conversation</h4>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Send a direct message to {activePartner.name} regarding coursework, mentorship, or peer learning.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?._id === user?._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-start gap-2.5 group ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <img
                        src={
                          msg.sender?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            msg.sender?.name || 'User'
                          )}&background=041c53&color=fff`
                        }
                        alt={msg.sender?.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div
                        className={`max-w-[75%] md:max-w-[65%] space-y-1.5 ${
                          isMe ? 'items-end text-right' : 'items-start text-left'
                        }`}
                      >
                        {/* Quote reply snippet if present */}
                        {msg.replyTo && (
                          <div
                            className={`text-[10px] p-2 rounded-xl bg-gray-100 text-gray-600 border-l-3 border-[#ff447e] truncate max-w-full ${
                              isMe ? 'mr-1 text-right' : 'ml-1 text-left'
                            }`}
                          >
                            <span className="font-bold block">Replying:</span>
                            {msg.replyTo.content}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs relative ${
                            isMe
                              ? 'bg-[#041c53] text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Render Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2.5 space-y-1.5">
                              {msg.attachments.map((att, idx) => (
                                <div key={idx} className="rounded-xl overflow-hidden">
                                  {/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(att.url) ? (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block hover:opacity-90 transition-opacity"
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.filename}
                                        className="max-h-48 rounded-xl object-cover border border-white/20"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold underline ${
                                        isMe ? 'text-pink-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                                      }`}
                                    >
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span className="truncate">{att.filename}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer & Read Receipt */}
                        <div
                          className={`flex items-center gap-1.5 text-[10px] text-gray-400 px-1 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {isMe && (
                            <span title={msg.isRead ? 'Read' : 'Delivered'}>
                              {msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-300" />
                              )}
                            </span>
                          )}

                          {/* Reply Button on Hover */}
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[#041c53] rounded cursor-pointer transition-opacity"
                            title="Reply to message"
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying Bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-pink-50 border-t border-pink-100 flex items-center justify-between text-xs text-[#041c53]">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-[#ff447e]" />
                  <span className="font-bold">Replying to {replyingTo.sender?.name || 'User'}:</span>
                  <span className="text-gray-600 truncate">{replyingTo.content}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pending Attachments Bar */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs"
                  >
                    <Paperclip className="w-3 h-3 text-[#ff447e]" />
                    <span className="truncate max-w-[150px]">{att.filename}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 md:p-4 bg-white border-t border-gray-200 flex items-center gap-2 md:gap-3"
            >
              {/* Attach Link Button */}
              <button
                type="button"
                onClick={() => setShowAttachInput(!showAttachInput)}
                className="p-2 text-gray-400 hover:text-[#041c53] rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                title="Attach image or file URL"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={`Message ${activePartner.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 md:py-3 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#ff447e] transition-colors"
              />

              <button
                type="submit"
                disabled={(!messageText.trim() && attachments.length === 0) || isSending}
                className="btn btn-primary text-xs py-2.5 md:py-3 px-4 md:px-5 flex items-center gap-1.5 rounded-2xl disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            {/* Attach Modal Popover */}
            {showAttachInput && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="Paste direct Image or File URL..."
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff447e]"
                />
                <input
                  type="text"
                  placeholder="Filename (optional)..."
                  value={attachFilename}
                  onChange={(e) => setAttachFilename(e.target.value)}
                  className="sm:w-48 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff447e]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    disabled={!attachUrl.trim()}
                    className="px-3 py-1.5 bg-[#041c53] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAttachInput(false)}
                    className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#ff447e] flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#041c53]">No Conversation Selected</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Select a conversation from the left or choose a member from the contacts list to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
