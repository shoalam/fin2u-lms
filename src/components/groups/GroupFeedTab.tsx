'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  Image as ImageIcon,
  User,
  Clock,
  Shield,
  Sparkles,
  X,
  Check,
  Paperclip,
  UploadCloud,
  Download,
  FileText,
  Loader2,
  ExternalLink,
  Plus,
  Lock,
  MoreVertical,
  Flag,
  ShieldBan,
  AtSign,
} from 'lucide-react';
import { Group, GroupPost, useGetPostCommentsQuery, useAddPostCommentMutation, useDeletePostCommentMutation } from '@/store/api/groupApi';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { StorageFolders } from '@/constants/storage-folders';
import { GroupPermissions } from './useGroupPermissions';
import ReportModal from '@/components/social/ReportModal';
import BlockModal from '@/components/social/BlockModal';

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
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears <= 1 ? 'a year' : `${diffInYears} years`} ago`;
}

function isImageMedia(url: string): boolean {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(url) ||
    url.includes('/image/') ||
    url.includes('/images/') ||
    (url.includes('cloudinary.com') && !url.includes('/raw/'));
}

function getFileNameFromUrl(url: string): string {
  try {
    const cleanUrl = url.split('?')[0];
    const rawName = cleanUrl.split('/').pop() || 'Attachment';
    return decodeURIComponent(rawName);
  } catch {
    return 'Attachment';
  }
}

/**
 * Parses @mentions in post text and renders clickable links to user profiles
 */
function renderContentWithMentions(text: string) {
  if (!text) return null;

  // Regex to match structured @[Name](userId) or @Name
  const structuredRegex = /@\[([^\]]+)\]\(([a-f0-9]{24})\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = structuredRegex.exec(text)) !== null) {
    const [fullMatch, name, userId] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    parts.push(
      <Link
        key={`${userId}-${matchIndex}`}
        href={`/members/${userId}`}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/60 text-[#ff447e] font-bold text-xs hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors mx-0.5 align-baseline"
      >
        <AtSign className="w-3 h-3 inline" />
        <span>{name}</span>
      </Link>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    // Also parse simple @word if any
    const simpleRegex = /@([a-zA-Z0-9_-]+)/g;
    let simpleLast = 0;
    let simpleMatch;

    const subParts: (string | React.ReactNode)[] = [];
    while ((simpleMatch = simpleRegex.exec(remaining)) !== null) {
      const [full, name] = simpleMatch;
      const sIndex = simpleMatch.index;

      if (sIndex > simpleLast) {
        subParts.push(remaining.substring(simpleLast, sIndex));
      }

      subParts.push(
        <Link
          key={`simple-${name}-${sIndex}`}
          href={`/members?search=${encodeURIComponent(name)}`}
          className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          <span>@{name}</span>
        </Link>
      );
      simpleLast = sIndex + full.length;
    }

    if (simpleLast < remaining.length) {
      subParts.push(remaining.substring(simpleLast));
    }

    parts.push(...subParts);
  }

  return parts;
}

// Subcomponent for Comments Section of a Post
function PostCommentsList({
  postId,
  groupId,
  currentUser,
  permissions,
  groupMembers = [],
  onOpenReport,
  onOpenBlock,
}: {
  postId: string;
  groupId: string;
  currentUser: any;
  permissions: GroupPermissions;
  groupMembers?: any[];
  onOpenReport: (type: 'comment', id: string, title?: string, authorId?: string) => void;
  onOpenBlock: (userId: string, userName?: string) => void;
}) {
  const { data: comments = [], isLoading } = useGetPostCommentsQuery(postId);
  const [addComment, { isLoading: isAdding }] = useAddPostCommentMutation();
  const [deleteComment] = useDeletePostCommentMutation();
  const [commentText, setCommentText] = useState('');

  // Mention state in comment
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [menuOpenCommentId, setMenuOpenCommentId] = useState<string | null>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt >= val.length - 15) {
      const query = val.slice(lastAt + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query.toLowerCase());
        setShowMentionSuggestions(true);
        return;
      }
    }
    setShowMentionSuggestions(false);
  };

  const handleSelectMention = (member: any) => {
    const lastAt = commentText.lastIndexOf('@');
    if (lastAt !== -1) {
      const before = commentText.slice(0, lastAt);
      const inserted = `@[${member.name}](${member._id}) `;
      setCommentText(before + inserted);
    }
    setShowMentionSuggestions(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isAdding) return;
    try {
      await addComment({ postId, content: commentText.trim() }).unwrap();
      setCommentText('');
      setShowMentionSuggestions(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({ postId, commentId }).unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  const userId = currentUser?._id || currentUser?.id;

  const filteredMembers = (groupMembers || []).filter((m: any) =>
    (m.name || '').toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
      {/* Comments List */}
      {isLoading ? (
        <div className="text-xs text-slate-400 py-2 text-center">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-slate-400 py-2 text-center">No comments yet. Be the first to join the conversation!</div>
      ) : (
        <div className="space-y-2.5">
          {comments.map((c: any) => {
            const author = c.author || {};
            const authorId = (author._id || author)?.toString();
            const isCommentAuthor = authorId === userId;
            const canDeleteComment = isCommentAuthor || permissions.canManage;
            const isMenuOpen = menuOpenCommentId === c._id;

            return (
              <div key={c._id} className="flex items-start gap-2.5 group relative">
                <Link href={`/members/${authorId}`} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 mt-0.5 block hover:opacity-80">
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                      {(author.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/members/${authorId}`} className="font-bold text-slate-900 dark:text-white hover:text-[#ff447e]">
                        {author.name || 'User'}
                      </Link>
                      {author.role && (
                        <span className="text-[10px] text-[#ff447e] font-semibold">
                          • {author.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>{formatRelativeTime(c.createdAt)}</span>

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenCommentId(isMenuOpen ? null : c._id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-[11px]">
                            {!isCommentAuthor && (
                              <>
                                <button
                                  onClick={() => {
                                    setMenuOpenCommentId(null);
                                    onOpenReport('comment', c._id, `Comment by ${author.name}`, authorId);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                                >
                                  <Flag className="w-3 h-3 text-rose-500" />
                                  <span>Report</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpenCommentId(null);
                                    onOpenBlock(authorId, author.name);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                                >
                                  <ShieldBan className="w-3 h-3 text-slate-500" />
                                  <span>Block User</span>
                                </button>
                              </>
                            )}

                            {canDeleteComment && (
                              <button
                                onClick={() => {
                                  setMenuOpenCommentId(null);
                                  handleDeleteComment(c._id);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 text-rose-600"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {renderContentWithMentions(c.content)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Input Form with @mention suggestions */}
      <form onSubmit={handleAddComment} className="relative pt-1">
        {showMentionSuggestions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 max-h-40 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Mention Member
            </div>
            {filteredMembers.slice(0, 5).map((m: any) => (
              <div
                key={m._id}
                onClick={() => handleSelectMention(m)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-pink-50 dark:hover:bg-pink-950/40 cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-3 h-3 m-1 text-slate-500" />}
                </div>
                <span className="font-semibold text-slate-900 dark:text-white truncate">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={handleCommentChange}
            placeholder="Write a comment or type @ to mention..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff447e]/30 focus:border-[#ff447e]"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isAdding}
            className="px-3 py-2 bg-[#041c53] hover:bg-[#ff447e] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

// Subcomponent for Single Post Card
function GroupPostCard({
  post,
  groupId,
  currentUser,
  permissions,
  groupMembers = [],
  onToggleLike,
  onDeletePost,
  onSharePost,
  onOpenReport,
  onOpenBlock,
}: {
  post: GroupPost;
  groupId: string;
  currentUser: any;
  permissions: GroupPermissions;
  groupMembers?: any[];
  onToggleLike: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSharePost: (post: GroupPost) => void;
  onOpenReport: (type: 'post' | 'comment', id: string, title?: string, authorId?: string) => void;
  onOpenBlock: (userId: string, userName?: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const author = post.author || {};
  const authorId = (author._id || author)?.toString();
  const userId = currentUser?._id || currentUser?.id;
  const isAuthor = authorId === userId;
  const canDelete = isAuthor || permissions.canManage;

  const mediaList = post.media || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md relative">
      {/* Post Author Row */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <Link href={`/members/${authorId}`} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 block hover:opacity-85 transition-opacity">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#041c53]/10 text-[#041c53] flex items-center justify-center font-bold text-sm">
                {(author.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/members/${authorId}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#ff447e] transition-colors">
                {author.name || 'Member'}
              </Link>
              {author.role && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                  {author.role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 3-dot dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1.5 z-30 text-xs">
              {!isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenReport('post', post._id, `Post by ${author.name}`, authorId);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500" />
                    <span>Report Post</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenBlock(authorId, author.name);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    <ShieldBan className="w-3.5 h-3.5 text-slate-500" />
                    <span>Block Author</span>
                  </button>
                </>
              )}

              {canDelete && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDeletePost(post._id);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content with parsed @mentions */}
      <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed mb-4">
        {renderContentWithMentions(post.content)}
      </div>

      {/* Media & Attachments */}
      {mediaList.length > 0 && (
        <div className="mb-4 space-y-2.5">
          {mediaList.map((mediaUrl, i) => {
            const isImg = isImageMedia(mediaUrl);
            const fileName = getFileNameFromUrl(mediaUrl);

            if (isImg) {
              return (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-900 group/img relative">
                  <img
                    src={mediaUrl}
                    alt={`Post attachment ${i + 1}`}
                    className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity"
                  />
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity text-xs flex items-center gap-1"
                    title="View Full Image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                </div>
              );
            }

            return (
              <a
                key={i}
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#ff447e]/50 dark:hover:border-[#ff447e]/50 hover:bg-pink-50/20 transition-all group/doc"
              >
                <div className="w-10 h-10 rounded-xl bg-[#041c53]/10 text-[#041c53] dark:bg-white/10 dark:text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#ff447e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover/doc:text-[#ff447e] transition-colors">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click to view or download file</p>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover/doc:text-[#ff447e] transition-colors shrink-0" />
              </a>
            );
          })}
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <button
          onClick={() => onToggleLike(post._id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            post.hasLiked
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
          <span>{post.likesCount || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            showComments
              ? 'text-[#041c53] bg-gray-100 dark:bg-slate-800 font-bold'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount || 0}</span>
          <span className="hidden sm:inline">Comments</span>
        </button>

        <button
          onClick={() => onSharePost(post)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Nested Comments List */}
      {showComments && (
        <PostCommentsList
          postId={post._id}
          groupId={groupId}
          currentUser={currentUser}
          permissions={permissions}
          groupMembers={groupMembers}
          onOpenReport={onOpenReport}
          onOpenBlock={onOpenBlock}
        />
      )}
    </div>
  );
}

interface GroupFeedTabProps {
  group: Group;
  currentUser: any;
  permissions: GroupPermissions;
  posts: GroupPost[];
  isLoadingPosts: boolean;
  onCreatePost: (data: { content: string; media?: string[] }) => Promise<void>;
  onToggleLike: (postId: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onSharePost: (post: GroupPost) => void;
  isCreatingPost: boolean;
}

export default function GroupFeedTab({
  group,
  currentUser,
  permissions,
  posts,
  isLoadingPosts,
  onCreatePost,
  onToggleLike,
  onDeletePost,
  onSharePost,
  isCreatingPost,
}: GroupFeedTabProps) {
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Mention state in main post composer
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Modals state
  const [reportModalState, setReportModalState] = useState<{
    isOpen: boolean;
    targetType: 'post' | 'comment';
    targetId: string;
    targetTitle?: string;
    targetAuthor?: string;
  }>({
    isOpen: false,
    targetType: 'post',
    targetId: '',
  });

  const [blockModalState, setBlockModalState] = useState<{
    isOpen: boolean;
    targetUserId: string;
    targetUserName?: string;
  }>({
    isOpen: false,
    targetUserId: '',
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useUploadFileMutation();

  const groupMembers = (group.members || []).concat(group.organizers || []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt >= val.length - 20) {
      const query = val.slice(lastAt + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query.toLowerCase());
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const handleSelectMention = (member: any) => {
    const lastAt = content.lastIndexOf('@');
    if (lastAt !== -1) {
      const before = content.slice(0, lastAt);
      const inserted = `@[${member.name}](${member._id}) `;
      setContent(before + inserted);
    }
    setShowMentionMenu(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds the maximum allowed 25MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', StorageFolders.GROUPS_POSTS);

      const res = await uploadFile(formData).unwrap();
      if (res.data?.url) {
        setMediaList((prev) => [...prev, res.data.url]);
      } else {
        setUploadError('Failed to get public URL for the uploaded file.');
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setMediaList((prev) => [...prev, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlField(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && mediaList.length === 0) || isCreatingPost || isUploading) return;

    try {
      await onCreatePost({
        content: content.trim(),
        media: mediaList,
      });
      setContent('');
      setMediaList([]);
      setShowMentionMenu(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredMembers = (groupMembers || []).filter((m: any) =>
    (m.name || '').toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      {permissions.canPost ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          <input
            type="file"
            ref={docInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          <form onSubmit={handlePostSubmit}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#041c53] text-white flex items-center justify-center font-bold text-sm">
                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 relative">
                <textarea
                  rows={3}
                  value={content}
                  onChange={handleContentChange}
                  placeholder={`Share something with ${group.name}... Type @ to mention members`}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff447e]/30 focus:border-[#ff447e] resize-none"
                />

                {/* Autocomplete Popover for @mentions */}
                {showMentionMenu && filteredMembers.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-1.5 z-40 max-h-48 overflow-y-auto">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-[#ff447e]" />
                      <span>Tag Community Member</span>
                    </div>
                    {filteredMembers.slice(0, 6).map((m: any) => (
                      <div
                        key={m._id}
                        onClick={() => handleSelectMention(m)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-pink-50 dark:hover:bg-pink-950/40 cursor-pointer text-xs transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 m-1 text-slate-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{m.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{m.role || 'Member'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Error feedback */}
                {uploadError && (
                  <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between">
                    <span>{uploadError}</span>
                    <button type="button" onClick={() => setUploadError(null)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Attached Media Tray */}
                {mediaList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {mediaList.map((url, idx) => {
                      const isImg = isImageMedia(url);
                      const name = getFileNameFromUrl(url);

                      return (
                        <div
                          key={idx}
                          className="relative group/badge flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-xs text-xs"
                        >
                          {isImg ? (
                            <img src={url} alt="Thumbnail" className="w-8 h-8 rounded-lg object-cover bg-black" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#ff447e] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                            {name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Uploading indicator */}
                {isUploading && (
                  <div className="mt-2.5 p-2 rounded-xl bg-pink-50 text-[#ff447e] text-xs font-bold flex items-center gap-2 border border-pink-200">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading attachment to cloud storage...</span>
                  </div>
                )}

                {/* Manual URL Link Input Field */}
                {showUrlField && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="Paste image or file link (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff447e]/30 focus:border-[#ff447e]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-2 rounded-xl bg-[#041c53] hover:bg-[#ff447e] text-white text-xs font-bold transition-colors"
                    >
                      Attach
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualUrl('');
                        setShowUrlField(false);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Composer Toolbar & Submit */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {/* Photo Upload Button */}
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#ff447e] dark:hover:text-[#ff447e] px-2.5 py-1.5 rounded-xl hover:bg-pink-50/50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Upload Image (PNG, JPG, WEBP)"
                    >
                      <ImageIcon className="w-4 h-4 text-[#ff447e]" />
                      <span>Photo</span>
                    </button>

                    {/* Document / File Upload Button */}
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => docInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#041c53] dark:hover:text-blue-400 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Upload Document / File (PDF, DOC, ZIP)"
                    >
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span>File</span>
                    </button>

                    {/* Paste URL */}
                    <button
                      type="button"
                      onClick={() => setShowUrlField(!showUrlField)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Paste Direct Link"
                    >
                      <span>+ Link</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={(!content.trim() && mediaList.length === 0) || isCreatingPost || isUploading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#041c53] to-[#0a2a6e] hover:from-[#ff447e] hover:to-[#ff2a6d] text-white text-xs font-bold shadow-md shadow-[#041c53]/20 disabled:opacity-50 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    {isCreatingPost ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Update</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {group.settings?.activityFeed === 'organizers'
              ? 'Posting updates in this group is restricted to group organizers only.'
              : group.settings?.activityFeed === 'mods'
              ? 'Posting updates in this group is restricted to group organizers and moderators.'
              : 'You must be an active member of this group to post updates.'}
          </span>
        </div>
      )}

      {/* Posts Feed List */}
      {isLoadingPosts ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading feed updates...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ff447e] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No posts yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Be the first to share an update, upload resources, or ask a question in this community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <GroupPostCard
              key={post._id}
              post={post}
              groupId={group._id}
              currentUser={currentUser}
              permissions={permissions}
              groupMembers={groupMembers}
              onToggleLike={onToggleLike}
              onDeletePost={onDeletePost}
              onSharePost={onSharePost}
              onOpenReport={(type, id, title, authorId) => {
                setReportModalState({
                  isOpen: true,
                  targetType: type,
                  targetId: id,
                  targetTitle: title,
                  targetAuthor: authorId,
                });
              }}
              onOpenBlock={(userId, userName) => {
                setBlockModalState({
                  isOpen: true,
                  targetUserId: userId,
                  targetUserName: userName,
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Global Report Modal */}
      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() => setReportModalState((prev) => ({ ...prev, isOpen: false }))}
        targetType={reportModalState.targetType}
        targetId={reportModalState.targetId}
        targetTitle={reportModalState.targetTitle}
        targetAuthor={reportModalState.targetAuthor}
      />

      {/* Global Block Modal */}
      <BlockModal
        isOpen={blockModalState.isOpen}
        onClose={() => setBlockModalState((prev) => ({ ...prev, isOpen: false }))}
        targetUserId={blockModalState.targetUserId}
        targetUserName={blockModalState.targetUserName}
      />
    </div>
  );
}
