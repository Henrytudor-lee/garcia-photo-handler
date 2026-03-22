'use client';

import { useState, useCallback, useEffect } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoMerger from '@/components/PhotoMerger';
import { Upload, Scissors, Download, CheckCircle } from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  croppedBlob?: Blob;
}

export default function Home() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'merge'>('upload');
  const [showResult, setShowResult] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleImagesUploaded = useCallback((uploadedImages: UploadedImage[]) => {
    setImages(prev => [...prev, ...uploadedImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleCropImage = useCallback((id: string, croppedBlob: Blob) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, croppedBlob } : img
    ));
  }, []);

  const handleMerged = useCallback((dataUrl: string) => {
    setMergedImage(dataUrl);
    setShowResult(true);
  }, []);

  const handleDownload = useCallback(() => {
    if (!mergedImage) return;
    setIsDownloading(true);
    const link = document.createElement('a');
    link.download = `merged-image-${Date.now()}.png`;
    link.href = mergedImage;
    link.click();
    setTimeout(() => setIsDownloading(false), 600);
  }, [mergedImage]);

  // Get image source - use cropped blob if available, otherwise use original
  const getImageSrc = (image: UploadedImage) => {
    if (image.croppedBlob) {
      return URL.createObjectURL(image.croppedBlob);
    }
    return image.preview;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/30 dark:from-teal-950/30 dark:via-gray-900 dark:to-cyan-950/20">
      <header className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">GarciaPhotoHandler</h1>
        <p className="text-gray-600 dark:text-gray-400">在线图片处理工具 - 支持拼接、裁剪</p>
      </header>

      <div className="flex justify-center gap-4 mb-6 flex-wrap animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => setActiveTab('upload')}
          className={`btn-press flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Upload size={20} className={activeTab === 'upload' ? 'text-teal-100' : ''} />
          上传图片
        </button>
        <button
          onClick={() => setActiveTab('merge')}
          disabled={images.length === 0}
          className={`btn-press flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'merge'
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800`}
        >
          <Scissors size={20} className={activeTab === 'merge' ? 'text-teal-100' : ''} />
          图片拼接
        </button>
        {mergedImage && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-press flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <CheckCircle size={20} className="animate-pulse" />
                已下载
              </>
            ) : (
              <>
                <Download size={20} />
                下载结果
              </>
            )}
          </button>
        )}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {activeTab === 'upload' && (
          <PhotoUploader
            images={images}
            onUpload={handleImagesUploaded}
            onRemove={handleRemoveImage}
            onCrop={handleCropImage}
          />
        )}

        {activeTab === 'merge' && (
          <PhotoMerger
            images={images.map(img => getImageSrc(img))}
            onMerged={handleMerged}
          />
        )}
      </div>

      {mergedImage && showResult && (
        <div className="mt-8 text-center animate-fade-in-up">
          <h2 className="text-xl font-semibold mb-4 text-teal-800 dark:text-teal-200">处理结果</h2>
          <img
            src={mergedImage}
            alt="Merged result"
            className="max-w-full h-auto mx-auto rounded-lg shadow-lg animate-scale-in"
          />
        </div>
      )}
    </main>
  );
}
