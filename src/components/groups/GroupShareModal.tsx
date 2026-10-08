'use client';

import { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare, Mail, Globe } from 'lucide-react';

interface GroupShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
}

export default function GroupShareModal({
  isOpen,
  onClose,
  title,
  url,
  description = 'Join our learning community on Fin2u!',
}: GroupShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-black hover:bg-zinc-800',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      color: 'bg-slate-700 hover:bg-slate-800',
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Community</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Invite colleagues and friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Row */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Direct Link
          </label>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent border-0 text-xs text-slate-700 dark:text-slate-300 px-2.5 flex-1 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Sharing Buttons */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Share on social networks
          </label>
          <div className="grid grid-cols-5 gap-2">
            {socialLinks.map((social) => {
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group text-center"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 ${social.color}`}
                  >
                    {social.icon}
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-full">
                    {social.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
