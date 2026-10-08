'use client';

import { useState } from 'react';
import { Video, Plus, Calendar, Clock, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { Group } from '@/store/api/groupApi';
import { GroupPermissions } from './useGroupPermissions';

interface GroupZoomTabProps {
  group: Group;
  permissions: GroupPermissions;
  onCreateMeeting: (data: any) => Promise<void>;
  isCreatingMeeting: boolean;
}

export default function GroupZoomTab({
  group,
  permissions,
  onCreateMeeting,
  isCreatingMeeting,
}: GroupZoomTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [hostName, setHostName] = useState('Fin2u Mentor');

  const meetings = group.zoomMeetings || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !joinUrl.trim() || isCreatingMeeting) return;
    try {
      await onCreateMeeting({
        title: title.trim(),
        meetingId: meetingId.trim(),
        passcode: passcode.trim(),
        joinUrl: joinUrl.trim(),
        startTime: startTime ? new Date(startTime) : new Date(),
        duration: parseInt(duration, 10) || 60,
        hostName: hostName.trim() || 'Fin2u Mentor',
      });
      setTitle('');
      setMeetingId('');
      setPasscode('');
      setJoinUrl('');
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Live Zoom Sessions ({meetings.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join scheduled live webinars, group mentorship calls, and workshops
          </p>
        </div>

        {permissions.isOrganizer && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-center hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Zoom sessions scheduled</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Upcoming live meetings and workshops scheduled by group organizers will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m: any) => {
            const start = m.startTime ? new Date(m.startTime) : new Date();
            const formattedDate = start.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={m._id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      Live Workshop
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {m.duration || 60} mins
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{formattedDate}</span>
                  </div>

                  {(m.meetingId || m.passcode) && (
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-slate-100 dark:border-slate-700">
                      {m.meetingId && <div>Meeting ID: <strong className="font-mono">{m.meetingId}</strong></div>}
                      {m.passcode && <div>Passcode: <strong className="font-mono">{m.passcode}</strong></div>}
                    </div>
                  )}
                </div>

                <a
                  href={m.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.01]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Join Live Zoom Meeting
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Zoom Meeting</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Group Strategy Session"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Zoom Join URL
                </label>
                <input
                  type="url"
                  value={joinUrl}
                  onChange={(e) => setJoinUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456789..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    placeholder="842 1293 8841"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !joinUrl.trim() || isCreatingMeeting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {isCreatingMeeting ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
