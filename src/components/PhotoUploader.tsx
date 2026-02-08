'use client';

import { useCallback, useRef, useState } from 'react';
import { X, Image, Crop as CropIcon } from 'lucide-react';
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
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Image className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium mb-2">点击或拖拽上传图片</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          支持 JPG、PNG、GIF、WebP 等格式
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.croppedBlob ? URL.createObjectURL(image.croppedBlob) : image.preview}
                alt={image.file.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2 right-2 flex gap-1 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCroppingImage(image.id);
                  }}
                  className="bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="裁剪图片"
                >
                  <CropIcon size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                  }}
                  className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs mt-1 truncate text-gray-500 dark:text-gray-400">
                {image.file.name}
              </p>
              {image.croppedBlob && (
                <span className="text-xs text-green-500">已裁剪</span>
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
