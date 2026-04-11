'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

type MergeDirection = 'horizontal' | 'vertical' | 'grid';
type GridCols = 2 | 3 | 4;

interface PhotoMergerProps {
  images: string[];
  onMerged: (dataUrl: string) => void;
}

export default function PhotoMerger({ images, onMerged }: PhotoMergerProps) {
  const { t } = useLanguage();
  const [direction, setDirection] = useState<MergeDirection>('vertical');
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [gap, setGap] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadImages = useCallback(async (srcList: string[]): Promise<HTMLImageElement[]> => {
    const promises = srcList.map(src => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    });
    return Promise.all(promises);
  }, []);

  const mergeImages = useCallback(async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const loadedImages = await loadImages(images);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let totalWidth = 0;
      let totalHeight = 0;
      const padding = gap;

      if (direction === 'horizontal') {
        const maxHeight = Math.max(...loadedImages.map(img => img.height));
        const scale = 800 / maxHeight;

        totalWidth = loadedImages.reduce((sum, img) => {
          return sum + (img.width * scale);
        }, 0);

        totalHeight = maxHeight * scale;

        canvas.width = totalWidth + padding * 2;
        canvas.height = totalHeight + padding * 2;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let currentX = padding;
        loadedImages.forEach((img) => {
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          ctx.drawImage(img, currentX, padding, scaledWidth, scaledHeight);
          currentX += scaledWidth;
        });
      } else if (direction === 'vertical') {
        const maxWidth = Math.max(...loadedImages.map(img => img.width));
        const scale = 800 / maxWidth;

        totalWidth = maxWidth * scale;
        totalHeight = loadedImages.reduce((sum, img) => {
          return sum + (img.height * scale);
        }, 0);

        canvas.width = totalWidth + padding * 2;
        canvas.height = totalHeight + padding * 2;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let currentY = padding;
        loadedImages.forEach((img) => {
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          ctx.drawImage(img, padding, currentY, scaledWidth, scaledHeight);
          currentY += scaledHeight;
        });
      } else {
        const cols = Math.min(gridCols, images.length);
        const rows = Math.ceil(images.length / cols);
        const cellWidth = 400;
        const cellHeight = 400;

        let maxCellWidth = 0;
        let maxCellHeight = 0;

        const scaledImages = loadedImages.map(img => {
          const ratio = img.width / img.height;
          let sw, sh;
          if (ratio > 1) {
            sw = cellWidth;
            sh = cellWidth / ratio;
          } else {
            sh = cellHeight;
            sw = cellHeight * ratio;
          }
          return { img, sw, sh };
        });

        maxCellWidth = Math.max(...scaledImages.map(s => s.sw));
        maxCellHeight = Math.max(...scaledImages.map(s => s.sh));

        totalWidth = maxCellWidth * cols;
        totalHeight = maxCellHeight * rows;

        canvas.width = totalWidth + padding * 2;
        canvas.height = totalHeight + padding * 2;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        scaledImages.forEach((scaled, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = padding + col * maxCellWidth + (maxCellWidth - scaled.sw) / 2;
          const y = padding + row * maxCellHeight + (maxCellHeight - scaled.sh) / 2;
          ctx.drawImage(scaled.img, x, y, scaled.sw, scaled.sh);
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      onMerged(dataUrl);
    } catch (error) {
      console.error('Error merging images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [images, direction, gridCols, gap, backgroundColor, loadImages, onMerged]);

  useEffect(() => {
    mergeImages();
  }, [mergeImages]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-4 shadow-lg shadow-teal-500/5 border border-teal-100 dark:border-teal-900/30 animate-fade-in-up">
        <h3 className="font-semibold text-lg text-teal-800 dark:text-teal-200">{t('mergeSettings')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('mergeDirection')}</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDirection('vertical')}
                className={`btn-press px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  direction === 'vertical'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('vertical')}
              </button>
              <button
                onClick={() => setDirection('horizontal')}
                className={`btn-press px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  direction === 'horizontal'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('horizontal')}
              </button>
              <button
                onClick={() => setDirection('grid')}
                className={`btn-press px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  direction === 'grid'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('grid')}
              </button>
            </div>
          </div>

          {direction === 'grid' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('gridCols')}</label>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols as GridCols)}
                    className={`btn-press px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      gridCols === cols
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('cols', { n: cols })}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('spacing')}: {gap}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('backgroundColor')}</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>
        </div>

        <button
          onClick={mergeImages}
          disabled={isProcessing}
          className={`btn-press w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 ${
            isProcessing ? 'animate-pulse' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              {t('processing')}
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              {t('reprocess')}
            </>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-lg shadow-teal-500/5 border border-teal-100 dark:border-teal-900/30 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="font-semibold text-lg mb-4 text-teal-800 dark:text-teal-200">{t('preview')}</h3>
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto mx-auto rounded-lg transition-opacity duration-300"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
