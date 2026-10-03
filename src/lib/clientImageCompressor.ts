/**
 * Client-Side Image Pre-Compression & Compatibility Utility
 *
 * Automatically optimizes and pre-compresses large raster images (>400KB) down to high-quality WebP
 * before uploading, with automatic timeout and instant fallback to the native file.
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

  // Don't touch videos, SVGs, GIFs, or already small files (< 400KB)
  if (
    !file.type.startsWith("image/") ||
    file.type.includes("svg") ||
    file.type.includes("gif") ||
    file.size < 400 * 1024
  ) {
    return file;
  }

  // Ensure window & browser canvas environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  try {
    return await new Promise<File>((resolve) => {
      let isSettled = false;
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      const safeResolve = (resultFile: File) => {
        if (!isSettled) {
          isSettled = true;
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
          resolve(resultFile);
        }
      };

      // Safety timeout: if decoding/compression takes longer than 2.5s, upload original file immediately
      const timeoutId = setTimeout(() => {
        safeResolve(file);
      }, 2500);

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const origWidth = img.naturalWidth || img.width;
          const origHeight = img.naturalHeight || img.height;

          if (!origWidth || !origHeight) {
            safeResolve(file);
            return;
          }

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
            safeResolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const baseName = file.name.replace(/\.[^/.]+$/, "");
                const newFile = new File([blob], `${baseName}.webp`, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                safeResolve(newFile);
              } else {
                safeResolve(file);
              }
            },
            "image/webp",
            quality
          );
        } catch {
          safeResolve(file);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        safeResolve(file);
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.warn("Client-side image compression fallback to original:", err);
    return file;
  }
}
