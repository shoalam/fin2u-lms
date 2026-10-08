'use client';

import React, { useState, useRef } from 'react';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import {
  UploadCloud,
  FileText,
  Video,
  FileArchive,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

import { StorageFolders, StorageFolder } from '@/constants/storage-folders';

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: StorageFolder;
  label?: string;
  helperText?: string;
  accept?: string;
  className?: string;
}

export default function FileUploader({
  value,
  onChange,
  folder = StorageFolders.GENERAL_UPLOADS,
  label,
  helperText,
  accept = '.pdf,.doc,.docx,.zip,.mp4,.webm,.txt',
  className = '',
}: FileUploaderProps) {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [rawUrlInput, setRawUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds 50MB limit.');
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
      setErrorMsg(err?.data?.message || err?.message || 'Failed to upload file. Please try again.');
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

  const handleCopyLink = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    onChange('');
    setRawUrlInput('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return <Video className="w-5 h-5 text-indigo-500" />;
    if (['zip', 'rar', '7z'].includes(ext || '')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    return <File className="w-5 h-5 text-[#041c53]" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and mode switcher */}
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
        <div>
          {value ? (
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {getFileIcon(value)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {value.split('/').pop() || 'Uploaded Document'}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[280px] font-mono">
                    {value}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-gray-500 hover:text-[#041c53] hover:bg-gray-100 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-[#ff447e] bg-[#ff447e]/5'
                  : 'border-gray-200 hover:border-[#041c53]/40 bg-gray-50/70 hover:bg-gray-50'
              } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-2 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-[#ff447e] animate-spin" />
                  <p className="text-xs font-bold text-gray-700">Uploading file...</p>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#ff447e] shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Upload document / file <span className="text-gray-400 font-normal">or drop here</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      PDF, DOCX, ZIP, MP4, MP3 (Max 50MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {helperText && !errorMsg && (
        <p className="text-[11px] text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
