/**
 * Client-Side Image Pre-Compression & Compatibility Utility
 *
 * Automatically compresses large raster images (>500KB) down to high-quality WebP/JPEG
 * before uploading, ensuring instantaneous uploads and preventing HTTP 413 payload limits.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImageBeforeUpload(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.88 } = options;

  // Don't touch videos, SVGs, GIFs, or already tiny files (< 400KB)
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif") || file.size < 400 * 1024) {
    return file;
  }

  // Ensure window & browser canvas environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file).catch(async () => {
      // Fallback for older browsers
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    });

    const origWidth = bitmap.width;
    const origHeight = bitmap.height;

    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (origWidth > maxWidth || origHeight > maxHeight) {
      const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight);
      targetWidth = Math.round(origWidth * ratio);
      targetHeight = Math.round(origHeight * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Client-side image compression fallback to original:", err);
    return file;
  }
}
