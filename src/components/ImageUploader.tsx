/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, runWithRetry } from '../lib/firebase';

interface ImageUploaderProps {
  onImageUploaded: (urlOrBase64: string) => void;
  currentImage?: string;
  onClear?: () => void;
  folder?: 'products' | 'events' | 'blogs';
}

export default function ImageUploader({ 
  onImageUploaded, 
  currentImage, 
  onClear,
  folder = 'products'
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [percentProgress, setPercentProgress] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert Base64 back to raw File Blob (for backup uploads)
  const base64ToBlob = (base64Str: string): Blob => {
    const parts = base64Str.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG)');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      setPercentProgress('Compressing image...');

      // 1. First compress the image
      const base64DataUrl = await compressImage(file);
      
      setPercentProgress('Uploading to Firebase Storage...');
      try {
        // 2. Try direct Firebase Storage Upload with robust Retries
        const blob = base64ToBlob(base64DataUrl);
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const finalPath = `${folder}/${fileName}`;
        
        const destinationRef = storageRef(storage, finalPath);
        // Retry bytes upload
        await runWithRetry(() => uploadBytes(destinationRef, blob, {
          contentType: blob.type || 'image/jpeg'
        }));

        // Retry URL retrieval
        const downloadUrl = await runWithRetry(() => getDownloadURL(destinationRef));
        onImageUploaded(downloadUrl);
        setPercentProgress(null);
      } catch (storageErr: any) {
        console.warn('Firebase Storage upload failed. Falling back to local Base64 encoding.', storageErr);
        // Fallback: use compressed Base64 DataUrl directly
        onImageUploaded(base64DataUrl);
        setPercentProgress(null);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred during image compression/upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col space-y-2" id="image-uploader-container">
      <div className="flex justify-between items-center pb-1">
        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
          Product / Announcement Media Header
        </label>
        {!currentImage && (
          <div className="flex bg-white/5 rounded-lg p-0.5 text-[9px] font-bold border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                setErrorMsg(null);
              }}
              className={`px-2 py-1 rounded transition-colors ${
                mode === 'upload' 
                  ? 'bg-primary text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Upload Local
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setErrorMsg(null);
              }}
              className={`px-2 py-1 rounded transition-colors ${
                mode === 'url' 
                  ? 'bg-primary text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Paste Web URL
            </button>
          </div>
        )}
      </div>

      {currentImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video w-full bg-black/40 flex items-center justify-center animate-fade-in">
          <img 
            src={currentImage} 
            alt="Upload Preview" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-[#00C853]">
              <CheckCircle className="h-4 w-4" />
              <span>Media Link Saved</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputUrl('');
                if (onClear) onClear();
              }}
              className="mt-2 rounded-lg bg-accent/20 border border-accent/20 px-3 py-1.5 text-xs font-bold text-[#FF4081] hover:bg-accent/30 transition-colors"
            >
              Change Media Header
            </button>
          </div>
        </div>
      ) : mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-[1.01]' 
              : 'border-white/10 bg-[#1E1E1E] hover:border-white/20 hover:bg-white/5'
          }`}
          id="drag-drop-zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-bold text-primary tracking-wide">
                {percentProgress || 'Uploading and optimizing image assets...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="rounded-full bg-white/5 p-3 text-white/50 group-hover:text-white">
                <Upload className="h-5 w-5 text-white/40" />
              </div>
              <p className="text-xs font-bold text-white">
                Drag & drop or <span className="text-primary hover:underline">browse files</span>
              </p>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                Optimized compression • Auto-fallback
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-[#1E1E1E] animate-fade-in text-xs">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="font-bold text-white">Paste Direct Web Image Address</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-example"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 rounded-xl bg-bg-dark border border-white/10 px-3.5 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none placeholder-white/20"
            />
            <button
              type="button"
              onClick={() => {
                if (inputUrl.trim()) {
                  onImageUploaded(inputUrl.trim());
                  setErrorMsg(null);
                } else {
                  setErrorMsg('Please specify a web image URL address before linking.');
                }
              }}
              className="rounded-xl bg-primary px-4 py-2 font-bold text-black hover:opacity-90 transition-all shadow-lg shadow-primary/10"
            >
              Apply Link
            </button>
          </div>
          <p className="text-[10px] text-white/40 leading-normal font-medium">
            Paste direct high-resolution web hyperlinks (e.g. Unsplash, Imgur, CDN paths) to present live banners instantly.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-accent/15 border border-accent/10 px-3 py-2.5 text-xs font-semibold text-accent flex items-start space-x-1.5">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
