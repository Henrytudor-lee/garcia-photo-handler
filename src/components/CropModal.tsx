'use client';

import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface CropModalProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropModal({ image, onCropComplete, onCancel }: CropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [outputSize, setOutputSize] = useState({ width: 800, height: 800 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const imageElement = document.createElement('img');
    imageElement.crossOrigin = 'anonymous';
    imageElement.src = image;

    await new Promise<void>((resolve) => {
      imageElement.onload = () => resolve();
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = outputSize.width;
    canvas.height = outputSize.height;

    // Apply rotation
    const cos = Math.abs(Math.cos((rotation * Math.PI) / 180));
    const sin = Math.abs(Math.sin((rotation * Math.PI) / 180));

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      -outputSize.width / 2,
      -outputSize.height / 2,
      outputSize.width,
      outputSize.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  }, [image, croppedAreaPixels, rotation, outputSize, onCropComplete]);

  const handleAspectRatioChange = (ratio: number) => {
    setOutputSize({ width: 800, height: 800 / ratio });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">裁剪图片</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative h-[400px] bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={outputSize.width / outputSize.height}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut size={18} />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <ZoomIn size={18} />
          </div>

          <div className="flex items-center gap-4">
            <RotateCcw size={18} />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12">{rotation}°</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAspectRatioChange(1)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              1:1
            </button>
            <button
              onClick={() => handleAspectRatioChange(4 / 3)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              4:3
            </button>
            <button
              onClick={() => handleAspectRatioChange(16 / 9)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              16:9
            </button>
            <button
              onClick={() => handleAspectRatioChange(3 / 4)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              3:4
            </button>
            <button
              onClick={() => handleAspectRatioChange(9 / 16)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              9:16
            </button>
            <button
              onClick={() => handleAspectRatioChange(outputSize.width / outputSize.height)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              自定义
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
            <button
              onClick={getCroppedImg}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Check size={18} />
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
