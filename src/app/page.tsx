'use client';

import { useState, useCallback } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoMerger from '@/components/PhotoMerger';
import { Upload, Scissors, Download } from 'lucide-react';

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
  }, []);

  const handleDownload = useCallback(() => {
    if (!mergedImage) return;
    const link = document.createElement('a');
    link.download = `merged-image-${Date.now()}.png`;
    link.href = mergedImage;
    link.click();
  }, [mergedImage]);

  // Get image source - use cropped blob if available, otherwise use original
  const getImageSrc = (image: UploadedImage) => {
    if (image.croppedBlob) {
      return URL.createObjectURL(image.croppedBlob);
    }
    return image.preview;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">GarciaPhotoHandler</h1>
        <p className="text-gray-600 dark:text-gray-400">在线图片处理工具 - 支持拼接、裁剪</p>
      </header>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'upload'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Upload size={20} />
          上传图片
        </button>
        <button
          onClick={() => setActiveTab('merge')}
          disabled={images.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'merge'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Scissors size={20} />
          图片拼接
        </button>
        {mergedImage && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-green-500 text-white hover:bg-green-600"
          >
            <Download size={20} />
            下载结果
          </button>
        )}
      </div>

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

      {mergedImage && (
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-4">处理结果</h2>
          <img
            src={mergedImage}
            alt="Merged result"
            className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </main>
  );
}
