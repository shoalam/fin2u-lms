'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { StorageFolders, StorageFolder } from '@/constants/storage-folders';
import {
  UploadCloud,
  Video,
  Play,
  PlayCircle,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Film,
  Link2,
} from 'lucide-react';

interface VideoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: StorageFolder;
  label?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export default function VideoUploader({
  value,
  onChange,
  folder = StorageFolders.COURSES_LESSONS,
  label = 'Video Stream / Cloud Embed URL',
  helperText,
  placeholder = 'https://commondatastorage.googleapis.com/... or https://www.youtube.com/watch?v=...',
  className = '',
}: VideoUploaderProps) {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [rawUrlInput, setRawUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    setRawUrlInput(value || '');
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|m4v|avi|flv)$/i)) {
      setErrorMsg('Please select a valid video file (MP4, WebM, MOV, MKV, M4V).');
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      setErrorMsg('Video file size exceeds 250MB limit.');
      return;
    }

    setErrorMsg(null);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await uploadFile(formData).unwrap();
      setUploadProgress(100);
      if (res.data?.url) {
        onChange(res.data.url);
        setRawUrlInput(res.data.url);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to upload video. Please try again.');
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClear = () => {
    onChange('');
    setRawUrlInput('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      const match = url.match(/[?&]v=([^&#]*)/);
      if (match && match[1]) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}`;
      }
      if (url.includes('/embed/')) return url;
    } catch {
      return url;
    }
    return url;
  };

  const isVimeo = (url: string) => {
    return url.includes('vimeo.com');
  };

  const getVimeoEmbedUrl = (url: string) => {
    try {
      const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    } catch {
      return url;
    }
    return url;
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header / Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#ff447e]" />
            <span>{label}</span>
          </label>
        )}

        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'upload' ? 'bg-[#041c53] text-white font-bold shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'url' ? 'bg-[#041c53] text-white font-bold shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Paste URL</span>
          </button>
        </div>
      </div>

      {/* Main Input Area */}
      {mode === 'url' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={rawUrlInput}
                onChange={(e) => {
                  setRawUrlInput(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e] font-mono"
              />
              <Video className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-500 transition-colors shrink-0"
                title="Clear URL"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* File Upload Mode */
        <div>
          {!value ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                dragActive
                  ? 'border-[#ff447e] bg-[#ff447e]/5 scale-[0.99]'
                  : 'border-gray-200 hover:border-[#041c53]/40 bg-gray-50/70 hover:bg-gray-50'
              } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/x-m4v,.mp4,.webm,.mov,.mkv,.m4v"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-4 flex flex-col items-center gap-2.5">
                  <Loader2 className="w-8 h-8 text-[#ff447e] animate-spin" />
                  <p className="text-xs font-bold text-gray-800">Uploading Video to Cloud Storage...</p>
                  <p className="text-[11px] text-gray-400">Please wait while your media is stored and processed.</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#ff447e] shadow-xs">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Click to upload video <span className="text-gray-400 font-normal">or drag & drop file</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      MP4, WebM, MOV, MKV, M4V (Max 250MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Video Live Preview Player */}
      {value && (
        <div className="rounded-2xl border border-gray-200 bg-gray-900 overflow-hidden shadow-sm space-y-0">
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {isYouTube(value) ? (
              <iframe
                src={getYouTubeEmbedUrl(value)}
                title="YouTube Video Preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isVimeo(value) ? (
              <iframe
                src={getVimeoEmbedUrl(value)}
                title="Vimeo Video Preview"
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={value}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                onError={() => {
                  // ignore playback error on custom stream embeds
                }}
              >
                Your browser does not support HTML5 video preview.
              </video>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-[11px] font-mono text-gray-600 truncate max-w-[320px]">
                {value}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    setMode('upload');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Replace Video"
              >
                <RefreshCw className="w-3 h-3 text-[#ff447e]" />
                <span>Replace</span>
              </button>

              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                title="Open Stream in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                title="Remove Video"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !errorMsg && (
        <p className="text-[11px] text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
