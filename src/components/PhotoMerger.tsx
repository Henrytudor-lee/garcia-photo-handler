'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';

type MergeDirection = 'horizontal' | 'vertical' | 'grid';
type GridCols = 2 | 3 | 4;

interface PhotoMergerProps {
  images: string[];
  onMerged: (dataUrl: string) => void;
}

export default function PhotoMerger({ images, onMerged }: PhotoMergerProps) {
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
        // Horizontal merge
        const maxHeight = Math.max(...loadedImages.map(img => img.height));
        const scale = 800 / maxHeight; // Scale to reasonable width

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
        // Vertical merge
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
        // Grid merge
        const cols = Math.min(gridCols, images.length);
        const rows = Math.ceil(images.length / cols);
        const cellWidth = 400;
        const cellHeight = 400;

        // First pass: calculate total size and scale images
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
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-lg">拼接设置</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">拼接方式</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDirection('vertical')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  direction === 'vertical'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                上下拼接
              </button>
              <button
                onClick={() => setDirection('horizontal')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  direction === 'horizontal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                左右拼接
              </button>
              <button
                onClick={() => setDirection('grid')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  direction === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                九宫格
              </button>
            </div>
          </div>

          {direction === 'grid' && (
            <div>
              <label className="block text-sm font-medium mb-2">网格列数</label>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols as GridCols)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      gridCols === cols
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cols} 列
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              间距: {gap}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">背景颜色</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={mergeImages}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              处理中...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              重新处理
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-4">预览</h3>
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto mx-auto rounded-lg"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
