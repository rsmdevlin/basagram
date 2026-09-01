'use client';

import React, { useRef, useState } from 'react';
import { useAuth } from '@/hooks';

interface MediaUploaderProps {
  onUpload?: (attachment: any) => void;
  conversationId?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  conversationId,
}) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // Determine file type
      let type: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // Upload metadata
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const data = await response.json();
      setProgress(100);

      onUpload?.(data);
    } catch (error) {
      console.error('Upload failed:', error);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || !token) return;

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      />

      {uploading ? (
        <div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-neutral-400">Загрузка... {progress}%</p>
        </div>
      ) : (
        <div>
          <p className="text-neutral-300 font-medium mb-2">
            📎 Нажмите или перетащите файлы
          </p>
          <p className="text-sm text-neutral-500">
            Изображения, видео, аудио, документы (макс 100MB)
          </p>
        </div>
      )}
    </div>
  );
};

interface MediaViewerProps {
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
  mimeType: string;
  filename?: string;
  onClose?: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  url,
  type,
  mimeType,
  filename,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-2xl"
        >
          ✕
        </button>

        {/* Image */}
        {type === 'image' && (
          <img
            src={url}
            alt={filename}
            className="max-w-full max-h-screen object-contain rounded-lg"
          />
        )}

        {/* Video */}
        {type === 'video' && (
          <video
            src={url}
            controls
            className="max-w-full max-h-screen rounded-lg"
          />
        )}

        {/* Audio */}
        {type === 'audio' && (
          <div className="bg-neutral-900 rounded-lg p-8 min-w-96">
            <p className="text-white mb-4 text-center">🎵 Аудиофайл</p>
            <audio
              src={url}
              controls
              className="w-full"
            />
            {filename && (
              <p className="text-sm text-neutral-400 mt-4 text-center">{filename}</p>
            )}
          </div>
        )}

        {/* File */}
        {type === 'file' && (
          <div className="bg-neutral-900 rounded-lg p-8 min-w-96 text-center">
            <p className="text-3xl mb-4">📄</p>
            <p className="text-white font-semibold mb-2">{filename}</p>
            <p className="text-neutral-400 text-sm mb-4">{mimeType}</p>
            <a
              href={url}
              download
              className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Скачать файл
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
