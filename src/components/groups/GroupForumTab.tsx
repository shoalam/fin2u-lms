'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  MessageSquare,
  Clock,
  User,
  Pin,
  Lock,
  X,
  Send,
  CornerDownRight,
  Eye,
} from 'lucide-react';
import {
  Group,
  useGetForumRepliesQuery,
  useCreateForumReplyMutation,
} from '@/store/api/groupApi';
import { GroupPermissions } from './useGroupPermissions';

function formatRelativeTime(dateString?: string | Date) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

interface GroupForumTabProps {
  group: Group;
  permissions: GroupPermissions;
  onCreateTopic: (title: string, content: string) => Promise<void>;
  isCreatingTopic: boolean;
}

export default function GroupForumTab({
  group,
  permissions,
  onCreateTopic,
  isCreatingTopic,
}: GroupForumTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');

  const topics = group.forumTopics || [];

  // Live replies for selected topic
  const { data: repliesData, refetch: refetchReplies } = useGetForumRepliesQuery(
    { topicId: selectedTopic?._id || '' },
    { skip: !selectedTopic?._id }
  );

  const [createReply, { isLoading: isPostingReply }] = useCreateForumReplyMutation();

  const replies = repliesData?.replies || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreatingTopic) return;
    try {
      await onCreateTopic(title.trim(), content.trim());
      setTitle('');
      setContent('');
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTopic?._id || isPostingReply) return;

    try {
      await createReply({
        topicId: selectedTopic._id,
        content: replyText.trim(),
      }).unwrap();
      setReplyText('');
      refetchReplies();
    } catch (err) {
      console.error('Failed to post reply', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Forum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {group.settings?.forumName || 'Community Forum Topics'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured discussion threads and Q&A boards
          </p>
        </div>

        {permissions.isMember && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-center hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Topic
          </button>
        )}
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No discussion topics yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Start a structured discussion thread or ask a question to learn with peers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t: any) => {
            const author = t.author || {};
            return (
              <div
                key={t._id || t.title}
                onClick={() => setSelectedTopic(t)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.isPinned && (
                      <span className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Pin className="w-3 h-3" />
                      </span>
                    )}
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {t.views || 1}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.repliesCount || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(t.createdAt)}
                  </span>
                  <span>•</span>
                  <span>Started by <strong className="text-slate-700 dark:text-slate-300">{author.name || 'Member'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Topic Detail & Thread Replies Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTopic.title}</h3>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content & Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 custom-scrollbar">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Author: <strong>{selectedTopic.author?.name || 'Member'}</strong></span>
                <span>•</span>
                <span>{formatRelativeTime(selectedTopic.createdAt)}</span>
              </div>

              {/* OP Post */}
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedTopic.content || 'No content provided for this topic.'}
              </div>

              {/* Thread Replies */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discussion Replies ({replies.length})</span>
                </h4>

                {replies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No replies yet. Be the first to share your thoughts on this topic!
                  </p>
                ) : (
                  replies.map((reply: any) => (
                    <div
                      key={reply._id}
                      className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {reply.author?.name || 'Peer'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Post Reply Input Form */}
            {permissions.isMember ? (
              <form onSubmit={handlePostReply} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type your response to this topic..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isPostingReply}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500 shrink-0">
                Join this group to participate in forum discussions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Forum Topic</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best practices for financial compliance..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Details / Discussion Question
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide context or questions to kickstart the conversation..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isCreatingTopic}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingTopic ? 'Publishing...' : 'Publish Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
