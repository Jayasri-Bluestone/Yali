import { useState, useRef } from 'react';
import { Upload, Link2, X, CheckCircle, Loader2, Film, Image } from 'lucide-react';
import { API_URL } from '../../config';

/**
 * Reusable FileUploadInput component
 * Supports both URL input and file upload (drag-drop + click)
 * Props:
 *   value       - current URL string
 *   onChange    - (url: string) => void
 *   accept      - MIME type string e.g. "image/*" or "video/*"
 *   label       - field label
 *   placeholder - placeholder text for URL input
 *   token       - auth token for upload API
 *   type        - 'image' | 'video' (drives preview & icon)
 */
export function FileUploadInput({
  value = '',
  onChange,
  accept = 'image/*',
  label = 'Media',
  placeholder = 'https://...',
  token,
  type = 'image'
}) {
  const [mode, setMode] = useState('url'); // 'url' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo = type === 'video';
  const MediaIcon = isVideo ? Film : Image;

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      setMode('url');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-2">
      {/* Label + Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'url'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Link2 className="w-3 h-3" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'upload'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-3 h-3" />
            Upload File
          </button>
        </div>
      </div>

      {/* URL Input Mode */}
      {mode === 'url' && (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <span className="text-sm font-semibold text-purple-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MediaIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">
                  Drop {isVideo ? 'video' : 'image'} here or <span className="text-purple-600 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isVideo ? 'MP4, MOV, WEBM up to 100MB' : 'JPG, PNG, WEBP up to 100MB'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> {uploadError}
        </p>
      )}

      {/* Preview of current value */}
      {value && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {isVideo ? (
            <video
              src={value}
              className="w-full max-h-32 object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <img
              src={value}
              alt="preview"
              className="w-full max-h-32 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-gray-100">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span className="text-[10px] text-gray-500 truncate font-mono">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
