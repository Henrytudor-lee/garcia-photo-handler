'use client';

import { useCallback, useRef, useState } from 'react';
import { X, Image, Crop as CropIcon, Upload } from 'lucide-react';
import CropModal from './CropModal';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  croppedBlob?: Blob;
}

interface PhotoUploaderProps {
  images: UploadedImage[];
  onUpload: (images: UploadedImage[]) => void;
  onRemove: (id: string) => void;
  onCrop: (id: string, croppedBlob: Blob) => void;
}

export default function PhotoUploader({ images, onUpload, onRemove, onCrop }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    const uploadedImages: UploadedImage[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    onUpload(uploadedImages);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    const uploadedImages: UploadedImage[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    onUpload(uploadedImages);
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    if (croppingImage) {
      onCrop(croppingImage, croppedBlob);
      setCroppingImage(null);
    }
  }, [croppingImage, onCrop]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-900/20 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
        }`}
      >
        <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          {isDragging ? (
            <Upload className="mx-auto mb-4 text-teal-500 animate-bounce" size={48} />
          ) : (
            <Image className="mx-auto mb-4 text-teal-400" size={48} />
          )}
        </div>
        <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
          {isDragging ? '松开上传图片' : '点击或拖拽上传图片'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          支持 JPG、PNG、GIF、WebP 等格式
        </p>
        <p className="text-sm text-teal-600 dark:text-teal-400 mt-2 font-medium">
          已上传 {images.length} 张图片
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-stagger">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group animate-fade-in-up"
              style={{ animationDuration: '300ms' }}
            >
              <img
                src={image.croppedBlob ? URL.createObjectURL(image.croppedBlob) : image.preview}
                alt={image.file.name}
                className="w-full h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-teal-300 dark:group-hover:border-teal-600 transition-all duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute top-2 left-2 right-2 flex gap-1 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCroppingImage(image.id);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 hover:scale-110"
                  title="裁剪图片"
                >
                  <CropIcon size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs mt-1 truncate text-gray-500 dark:text-gray-400">
                {image.file.name}
              </p>
              {image.croppedBlob && (
                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">已裁剪</span>
              )}
            </div>
          ))}
        </div>
      )}

      {croppingImage && (
        <CropModal
          image={images.find(img => img.id === croppingImage)?.preview || ''}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}
    </div>
  );
}
