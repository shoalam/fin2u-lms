'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  FileText,
  Video,
  Trash2,
  Save,
  Globe,
  Lock,
  EyeOff,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { Group } from '@/store/api/groupApi';
import ImageUploader from '@/components/common/ImageUploader';
import { StorageFolders } from '@/constants/storage-folders';
import { GroupPermissions } from './useGroupPermissions';

interface GroupSettingsTabProps {
  group: Group;
  permissions: GroupPermissions;
  onUpdateGroup: (data: any) => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function GroupSettingsTab({
  group,
  permissions,
  onUpdateGroup,
  onDeleteGroup,
  isUpdating,
  isDeleting,
}: GroupSettingsTabProps) {
  const [subSection, setSubSection] = useState<'general' | 'permissions' | 'forum' | 'zoom' | 'danger'>('general');

  // Form states
  const [name, setName] = useState(group.name || '');
  const [description, setDescription] = useState(group.description || '');
  const [avatar, setAvatar] = useState(group.avatar || '');
  const [cover, setCover] = useState(group.cover || '');
  const [type, setType] = useState<'public' | 'private' | 'hidden'>(group.type || 'public');

  const [invitations, setInvitations] = useState<'all' | 'mods' | 'organizers'>(
    group.settings?.invitations || 'all'
  );
  const [activityFeed, setActivityFeed] = useState<'all' | 'mods' | 'organizers'>(
    group.settings?.activityFeed || 'all'
  );
  const [enableForum, setEnableForum] = useState(group.settings?.enableForum !== false);
  const [forumName, setForumName] = useState(group.settings?.forumName || `${group.name} Discussion Board`);

  const [enableZoom, setEnableZoom] = useState(Boolean(group.settings?.enableZoom));
  const [zoomAccountId, setZoomAccountId] = useState(group.settings?.zoomAccountId || '');
  const [zoomMeetingUrl, setZoomMeetingUrl] = useState(group.settings?.zoomMeetingUrl || '');

  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGroup({
      name,
      description,
      avatar,
      cover,
      type,
    });
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGroup({
      settings: {
        ...group.settings,
        invitations,
        activityFeed,
      },
    });
  };

  const handleSaveForum = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGroup({
      settings: {
        ...group.settings,
        enableForum,
        forumName,
      },
    });
  };

  const handleSaveZoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateGroup({
      settings: {
        ...group.settings,
        enableZoom,
        zoomAccountId,
        zoomMeetingUrl,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
          <button
            onClick={() => setSubSection('general')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              subSection === 'general'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            General & Branding
          </button>

          <button
            onClick={() => setSubSection('permissions')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              subSection === 'permissions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy & Rules
          </button>

          <button
            onClick={() => setSubSection('forum')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              subSection === 'forum'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Forum Settings
          </button>

          <button
            onClick={() => setSubSection('zoom')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              subSection === 'zoom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            Zoom Settings
          </button>

          {permissions.isCreator && (
            <button
              onClick={() => setSubSection('danger')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                subSection === 'danger'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Community
            </button>
          )}
        </div>

        {/* Content Panel */}
        <div className="flex-1 md:pl-6 md:border-l md:border-slate-100 md:dark:border-slate-800">
          {/* Section 1: General */}
          {subSection === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Group Details & Branding</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  label="Avatar Image"
                  value={avatar}
                  onChange={(url) => setAvatar(url)}
                  folder={StorageFolders.GROUPS_AVATARS}
                  aspectRatio="square"
                  helperText="Square icon (1:1), e.g. 400x400px."
                />
                <ImageUploader
                  label="Cover Banner"
                  value={cover}
                  onChange={(url) => setCover(url)}
                  folder={StorageFolders.GROUPS_COVERS}
                  aspectRatio="video"
                  helperText="Landscape banner (16:9), e.g. 1200x500px."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Privacy Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['public', 'private', 'hidden'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        type === t
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs capitalize">
                        {t === 'public' && <Globe className="w-3.5 h-3.5" />}
                        {t === 'private' && <Lock className="w-3.5 h-3.5" />}
                        {t === 'hidden' && <EyeOff className="w-3.5 h-3.5" />}
                        {t}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Section 2: Permissions */}
          {subSection === 'permissions' && (
            <form onSubmit={handleSavePermissions} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Privacy & Permission Rules</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Who can invite members?
                </label>
                <select
                  value={invitations}
                  onChange={(e) => setInvitations(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Group Members</option>
                  <option value="mods">Organizers & Moderators Only</option>
                  <option value="organizers">Organizers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Who can post updates in the activity feed?
                </label>
                <select
                  value={activityFeed}
                  onChange={(e) => setActivityFeed(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Group Members</option>
                  <option value="mods">Organizers & Moderators Only</option>
                  <option value="organizers">Organizers Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating ? 'Saving...' : 'Save Permissions'}
              </button>
            </form>
          )}

          {/* Section 3: Forum */}
          {subSection === 'forum' && (
            <form onSubmit={handleSaveForum} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Community Forum Settings</h4>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableForum}
                  onChange={(e) => setEnableForum(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Enable Forum Discussion Board for this group
                </span>
              </label>

              {enableForum && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Forum Board Title
                  </label>
                  <input
                    type="text"
                    value={forumName}
                    onChange={(e) => setForumName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating ? 'Saving...' : 'Save Forum Settings'}
              </button>
            </form>
          )}

          {/* Section 4: Zoom */}
          {subSection === 'zoom' && (
            <form onSubmit={handleSaveZoom} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zoom Live Meetings Settings</h4>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableZoom}
                  onChange={(e) => setEnableZoom(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Enable Live Zoom Meetings tab
                </span>
              </label>

              {enableZoom && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Zoom Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={zoomAccountId}
                      onChange={(e) => setZoomAccountId(e.target.value)}
                      placeholder="e.g. mentor@fin2u.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Zoom Meeting URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={zoomMeetingUrl}
                      onChange={(e) => setZoomMeetingUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating ? 'Saving...' : 'Save Zoom Settings'}
              </button>
            </form>
          )}

          {/* Section 5: Danger */}
          {subSection === 'danger' && permissions.isCreator && (
            <div className="space-y-4 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone: Delete Group
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This action is permanent and cannot be undone. All posts, comments, forums, and membership records will be permanently removed.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type <strong>{group.name}</strong> to confirm deletion:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={group.name}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={onDeleteGroup}
                disabled={deleteConfirmName !== group.name || isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting Community...' : 'Permanently Delete Community'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
