'use client';

import React, { useState, useRef } from 'react';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

import { StorageFolders, StorageFolder } from '@/constants/storage-folders';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: StorageFolder;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = StorageFolders.GENERAL_UPLOADS,
  label,
  helperText,
  aspectRatio = 'video',
  className = '',
}: ImageUploaderProps) {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [rawUrlInput, setRawUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square w-32 h-32 md:w-40 md:h-40'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9] w-full max-h-48'
      : aspectRatio === 'video'
      ? 'aspect-video w-full max-h-56'
      : 'min-h-[140px] w-full';

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 20MB limit.');
      return;
    }

    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await uploadFile(formData).unwrap();
      if (res.data?.url) {
        onChange(res.data.url);
        setRawUrlInput(res.data.url);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to upload image. Please try again.');
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

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawUrlInput.trim()) {
      onChange(rawUrlInput.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header / Label & Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mode === 'upload' ? 'bg-[#041c53] text-white font-bold' : 'hover:bg-gray-100'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mode === 'url' ? 'bg-[#041c53] text-white font-bold' : 'hover:bg-gray-100'
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* Manual URL Input mode */}
      {mode === 'url' ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={rawUrlInput}
            onChange={(e) => {
              setRawUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://..."
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff447e]/20 focus:border-[#ff447e]"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-500 transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Upload Drag & Drop Zone */
        <div className="space-y-2">
          {value ? (
            /* Preview Card */
            <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
              <div className={`relative ${aspectClass} overflow-hidden flex items-center justify-center`}>
                <img
                  src={value}
                  alt="Uploaded media"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-white/90 text-gray-800 hover:bg-white hover:scale-105 transition-all text-xs font-bold flex items-center gap-1.5 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#041c53]" />
                    <span>Change</span>
                  </button>
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/90 text-gray-800 hover:bg-white hover:scale-105 transition-all shadow-lg"
                    title="View Full Size"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#041c53]" />
                  </a>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 transition-all shadow-lg"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="truncate max-w-[80%] font-mono text-[10px]">{value}</span>
                <span className="shrink-0 flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-[#ff447e] bg-[#ff447e]/5 scale-[0.99]'
                  : 'border-gray-200 hover:border-[#041c53]/40 bg-gray-50/70 hover:bg-gray-50'
              } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#ff447e] animate-spin" />
                  <p className="text-xs font-bold text-gray-700">Uploading to Cloud Storage...</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#ff447e] shadow-xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Click to upload <span className="text-gray-400 font-normal">or drag & drop</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      PNG, JPG, WEBP, GIF, SVG (Max 20MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
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
