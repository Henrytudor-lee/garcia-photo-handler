export const translations = {
  zh: {
    // Header
    title: 'G-PhotoLab - 图片拼接工具',
    description: '支持图片上传、拼接、裁剪的在线图片处理工具',

    // Tabs
    uploadTab: '上传图片',
    mergeTab: '图片拼接',
    downloadResult: '下载结果',
    downloaded: '已下载',

    // Upload
    dragDropTitle: '点击或拖拽上传图片',
    dragDropTitleActive: '松开上传图片',
    supportedFormats: '支持 JPG、PNG、GIF、WebP 等格式',
    imagesUploaded: '已上传 {count} 张图片',
    cropImage: '裁剪图片',
    cropped: '已裁剪',

    // Merge Settings
    mergeSettings: '拼接设置',
    mergeDirection: '拼接方式',
    vertical: '上下拼接',
    horizontal: '左右拼接',
    grid: '九宫格',
    gridCols: '网格列数',
    cols: '{n} 列',
    spacing: '间距',
    backgroundColor: '背景颜色',
    processing: '处理中...',
    reprocess: '重新处理',

    // Preview
    preview: '预览',

    // Crop Modal
    cropTitle: '裁剪图片',
    dragHandleTip: '拖拽右下角青色手柄调整裁剪框大小',
    dragCropTip: '拖拽裁剪框选择要保留的区域',
    freeRatio: '自由比例',
    cancel: '取消',
    confirmCrop: '确认裁剪',

    // Result
    result: '处理结果',
  },
  en: {
    // Header
    title: 'G-PhotoLab - Photo Merge Tool',
    description: 'Online photo processing tool supporting upload, merge, and crop',

    // Tabs
    uploadTab: 'Upload Images',
    mergeTab: 'Merge Photos',
    downloadResult: 'Download Result',
    downloaded: 'Downloaded',

    // Upload
    dragDropTitle: 'Click or drag to upload images',
    dragDropTitleActive: 'Release to upload',
    supportedFormats: 'Supports JPG, PNG, GIF, WebP formats',
    imagesUploaded: '{count} images uploaded',
    cropImage: 'Crop',
    cropped: 'Cropped',

    // Merge Settings
    mergeSettings: 'Merge Settings',
    mergeDirection: 'Merge Direction',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    grid: 'Grid',
    gridCols: 'Grid Columns',
    cols: '{n} Cols',
    spacing: 'Spacing',
    backgroundColor: 'Background Color',
    processing: 'Processing...',
    reprocess: 'Reprocess',

    // Preview
    preview: 'Preview',

    // Crop Modal
    cropTitle: 'Crop Image',
    dragHandleTip: 'Drag the teal handle at bottom-right to resize',
    dragCropTip: 'Drag the crop area to select region',
    freeRatio: 'Free',
    cancel: 'Cancel',
    confirmCrop: 'Confirm',

    // Result
    result: 'Result',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.zh;
