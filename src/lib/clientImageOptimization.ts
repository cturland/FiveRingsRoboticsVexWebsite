'use client';

export type OptimizedImageResult = {
  file: File;
  originalSize: number;
  width: number;
  height: number;
  wasOptimized: boolean;
};

type OptimizeImageOptions = {
  maxDimension: number;
  quality?: number;
  outputType?: 'image/jpeg' | 'image/webp';
};

const DEFAULT_QUALITY = 0.82;
const DEFAULT_OUTPUT_TYPE = 'image/jpeg';

export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions,
): Promise<OptimizedImageResult> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      width: 0,
      height: 0,
      wasOptimized: false,
    };
  }

  const image = await loadImage(file);
  const { width, height } = getTargetSize(image.naturalWidth, image.naturalHeight, options.maxDimension);

  if (width === image.naturalWidth && height === image.naturalHeight && file.size <= 600 * 1024) {
    URL.revokeObjectURL(image.src);
    return {
      file,
      originalSize: file.size,
      width,
      height,
      wasOptimized: false,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(image.src);
    return {
      file,
      originalSize: file.size,
      width,
      height,
      wasOptimized: false,
    };
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(image.src);

  const outputType = options.outputType ?? DEFAULT_OUTPUT_TYPE;
  const blob = await canvasToBlob(canvas, outputType, options.quality ?? DEFAULT_QUALITY);

  if (!blob || blob.size >= file.size) {
    return {
      file,
      originalSize: file.size,
      width,
      height,
      wasOptimized: false,
    };
  }

  return {
    file: new File([blob], replaceExtension(file.name, outputType), {
      type: outputType,
      lastModified: Date.now(),
    }),
    originalSize: file.size,
    width,
    height,
    wasOptimized: true,
  };
}

export function setFileInputFile(input: HTMLInputElement, file: File) {
  if (typeof DataTransfer === 'undefined') {
    return false;
  }

  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  return true;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTargetSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error('Could not load image for optimization.'));
    };
    image.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function replaceExtension(fileName: string, outputType: string) {
  const extension = outputType === 'image/webp' ? 'webp' : 'jpg';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  return `${baseName || 'photo'}.${extension}`;
}
