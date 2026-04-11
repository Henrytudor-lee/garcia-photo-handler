'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface CropModalProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

export default function CropModal({ image, onCropComplete, onCancel }: CropModalProps) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const cropperRef = useRef<any>(null);

  const cropAreaRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [cropAreaRect, setCropAreaRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [, setTick] = useState(0);

  const isResizing = useRef(false);
  const startPos = useRef<Point>({ x: 0, y: 0 });
  const startCropArea = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRectRef = useRef<DOMRect | null>(null);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const updateCropAreaPosition = () => {
      const cropArea = container.querySelector('.reactEasyCrop_Container .reactEasyCrop_CropArea') as HTMLElement;
      if (cropArea) {
        const rect = cropArea.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        containerRectRef.current = containerRect;

        const newRect = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };

        cropAreaRectRef.current = newRect;
        setCropAreaRect(newRect);
        setTick(t => t + 1);
      }
    };

    setTimeout(updateCropAreaPosition, 100);

    const observer = new MutationObserver(() => {
      updateCropAreaPosition();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    const interval = setInterval(updateCropAreaPosition, 16);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizing.current = true;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    startPos.current = { x: clientX, y: clientY };
    startCropArea.current = { ...cropAreaRectRef.current };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !startCropArea.current || !containerRef.current || !containerRectRef.current) return;

      const container = containerRef.current;
      const containerRect = containerRectRef.current;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startCropArea.current.width + deltaX;
      let newHeight = startCropArea.current.height + deltaY;

      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      const imgElement = container.querySelector('.reactEasyCrop_Container img') as HTMLImageElement;
      if (imgElement) {
        const imgRect = imgElement.getBoundingClientRect();
        const maxWidth = imgRect.width - startCropArea.current.x;
        const maxHeight = imgRect.height - startCropArea.current.y;
        newWidth = Math.min(newWidth, Math.max(50, maxWidth));
        newHeight = Math.min(newHeight, Math.max(50, maxHeight));
      }

      const cropArea = container.querySelector('.reactEasyCrop_Container .reactEasyCrop_CropArea') as HTMLElement;
      if (cropArea) {
        cropArea.style.width = `${newWidth}px`;
        cropArea.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        if (containerRef.current) {
          const container = containerRef.current;
          const cropArea = container.querySelector('.reactEasyCrop_Container .reactEasyCrop_CropArea') as HTMLElement;
          if (cropArea) {
            const rect = cropArea.getBoundingClientRect();

            const img = container.querySelector('.reactEasyCrop_Container img') as HTMLImageElement;
            if (img) {
              const imgRect = img.getBoundingClientRect();
              const scaleX = img.naturalWidth / imgRect.width;
              const scaleY = img.naturalHeight / imgRect.height;

              const newCroppedAreaPixels: Area = {
                x: (rect.left - imgRect.left) * scaleX,
                y: (rect.top - imgRect.top) * scaleY,
                width: rect.width * scaleX,
                height: rect.height * scaleY,
              };

              setCroppedAreaPixels(newCroppedAreaPixels);
            }
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    };

    const handleTouchEnd = () => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
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

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const cos = Math.abs(Math.cos((rotation * Math.PI) / 180));
    const sin = Math.abs(Math.sin((rotation * Math.PI) / 180));

    if (rotation !== 0) {
      canvas.width = croppedAreaPixels.width * cos + croppedAreaPixels.height * sin;
      canvas.height = croppedAreaPixels.width * sin + croppedAreaPixels.height * cos;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      -croppedAreaPixels.width / 2,
      -croppedAreaPixels.height / 2,
      croppedAreaPixels.width,
      croppedAreaPixels.height
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
  }, [image, croppedAreaPixels, rotation, onCropComplete]);

  const handleAspectRatioChange = (ratio: number) => {
    setAspectRatio(ratio);
  };

  const handlePosition = {
    left: cropAreaRectRef.current.x + cropAreaRectRef.current.width - 16,
    top: cropAreaRectRef.current.y + cropAreaRectRef.current.height - 16,
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-teal-500/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20">
          <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{t('cropTitle')}</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-full transition-colors text-teal-700 dark:text-teal-300 btn-press"
          >
            <X size={20} />
          </button>
        </div>

        <div ref={containerRef} className="relative h-[400px] bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            showGrid
            cropShape="rect"
            style={{
              containerStyle: {
                background: '#1a1a1a'
              }
            }}
          />

          {aspectRatio === 0 && (
            <div
              className="absolute z-50"
              style={{
                left: handlePosition.left,
                top: handlePosition.top,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'nwse-resize',
                pointerEvents: 'auto',
              }}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
            >
              <div
                className="hover:scale-110 transition-transform duration-200"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
                  boxShadow: '0 2px 8px rgba(20, 184, 166, 0.4)',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 5L5 11M5 11L5 7M5 11L9 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-teal-600 dark:text-teal-400 text-center">
            {aspectRatio === 0 ? t('dragHandleTip') : t('dragCropTip')}
          </p>

          <div className="flex items-center gap-4">
            <ZoomOut size={18} className="text-teal-600 dark:text-teal-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-teal-500"
            />
            <ZoomIn size={18} className="text-teal-600 dark:text-teal-400" />
          </div>

          <div className="flex items-center gap-4">
            <RotateCcw size={18} className="text-teal-600 dark:text-teal-400" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 accent-teal-500"
            />
            <span className="text-sm w-12 text-teal-700 dark:text-teal-300">{rotation}°</span>
          </div>

          <div className="flex gap-2 flex-wrap justify-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => handleAspectRatioChange(1)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 1
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              1:1
            </button>
            <button
              onClick={() => handleAspectRatioChange(4 / 3)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 4 / 3
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => handleAspectRatioChange(16 / 9)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 16 / 9
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => handleAspectRatioChange(3 / 4)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 3 / 4
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              3:4
            </button>
            <button
              onClick={() => handleAspectRatioChange(9 / 16)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 9 / 16
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              9:16
            </button>
            <button
              onClick={() => handleAspectRatioChange(0)}
              className={`btn-press px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                aspectRatio === 0
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('freeRatio')}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn-press flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={getCroppedImg}
              className="btn-press flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700 font-medium transition-all duration-200"
            >
              <Check size={18} />
              {t('confirmCrop')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
