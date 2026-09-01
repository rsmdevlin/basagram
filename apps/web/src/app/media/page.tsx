'use client';

import React, { useState } from 'react';
import { MediaUploader, MediaViewer } from '@/components/MediaComponents';

export default function MediaPage() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleMediaUpload = (attachment: any) => {
    setUploadedFiles((prev) => [attachment, ...prev]);
  };

  const viewMedia = (file: any) => {
    setSelectedMedia(file);
    setViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Upload Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Загрузка медиа</h1>
          <MediaUploader onUpload={handleMediaUpload} />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Загруженные файлы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors"
                  onClick={() => viewMedia(file)}
                >
                  {file.type === 'image' && (
                    <div className="bg-neutral-800 rounded h-32 flex items-center justify-center mb-3">
                      🖼️
                    </div>
                  )}
                  {file.type === 'video' && (
                    <div className="bg-neutral-800 rounded h-32 flex items-center justify-center mb-3">
                      🎬
                    </div>
                  )}
                  {file.type === 'audio' && (
                    <div className="bg-neutral-800 rounded h-32 flex items-center justify-center mb-3">
                      🎵
                    </div>
                  )}
                  {file.type === 'file' && (
                    <div className="bg-neutral-800 rounded h-32 flex items-center justify-center mb-3">
                      📄
                    </div>
                  )}
                  <p className="text-white text-sm font-medium truncate">
                    {file.url.split('/').pop()}
                  </p>
                  <p className="text-neutral-400 text-xs mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Viewer */}
        {viewerOpen && selectedMedia && (
          <MediaViewer
            url={selectedMedia.url}
            type={selectedMedia.type}
            mimeType={selectedMedia.mimeType}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
