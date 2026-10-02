/**
 * Client-Side Image Pre-Compression & Resizing Utility
 *
 * Compresses and resizes raster images (JPG, PNG, WEBP, etc.) in the browser
 * before transmitting them to the server and Cloudinary.
 *
 * - Max Width: 1920px (maintains aspect ratio, never upscales)
 * - Format: WebP (with fallback to JPEG if WebP is unsupported)
 * - Quality: 0.85 (visually lossless perceptual compression)
 * - Leaves SVGs, animated GIFs, and videos completely untouched
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetFormat?: string;
}

export async function compressImageBeforeUpload(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Gracefully fallback to original file in non-browser environments or on any error
  if (typeof window === "undefined" || !file) {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    targetFormat = "image/webp",
  } = options;

  try {
    const mimeType = (file.type || "").toLowerCase();
    const name = file.name || "upload.jpg";

    // Skip videos, SVGs, animated GIFs, and non-image files
    if (
      mimeType.startsWith("video/") ||
      mimeType === "image/svg+xml" ||
      mimeType === "image/gif" ||
      /\.(svg|gif|mp4|webm|mov|mkv)$/i.test(name)
    ) {
      return file;
    }

    // Only process standard raster images
    if (
      !mimeType.startsWith("image/") &&
      !/\.(jpe?g|png|webp|bmp|avif)$/i.test(name)
    ) {
      return file;
    }

    const bitmapOrImage = await createImageElement(file);
    const { naturalWidth, naturalHeight } = bitmapOrImage;

    if (!naturalWidth || !naturalHeight || naturalWidth <= 0 || naturalHeight <= 0) {
      return file;
    }

    // Calculate new aspect-ratio preserving dimensions
    let targetWidth = naturalWidth;
    let targetHeight = naturalHeight;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.max(1, Math.round(targetWidth * ratio));
      targetHeight = Math.max(1, Math.round(targetHeight * ratio));
    }

    // If image is already smaller than max dimensions and under 300KB WebP, return original
    if (
      targetWidth === naturalWidth &&
      targetHeight === naturalHeight &&
      mimeType === "image/webp" &&
      file.size < 300 * 1024
    ) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    // High quality canvas rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmapOrImage.element, 0, 0, targetWidth, targetHeight);

    // Export compressed blob safely
    const clampedQuality = Math.min(Math.max(quality, 0.1), 1.0);
    const safeFormat = targetFormat.includes("webp") ? "image/webp" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
            } else {
              try {
                canvas.toBlob((fallbackBlob) => resolve(fallbackBlob), "image/jpeg", clampedQuality);
              } catch {
                resolve(null);
              }
            }
          },
          safeFormat,
          clampedQuality
        );
      } catch {
        resolve(null);
      }
    });

    if (!blob) {
      return file;
    }

    // Replace extension safely
    const dotIndex = name.lastIndexOf(".");
    const baseName = (dotIndex !== -1 ? name.slice(0, dotIndex) : name).replace(/[^a-zA-Z0-9_-]/g, "_");
    const newExt = blob.type.includes("webp") ? ".webp" : ".jpg";
    const newName = `${baseName || "image"}${newExt}`;

    try {
      return new File([blob], newName, {
        type: blob.type || "image/webp",
        lastModified: Date.now(),
      });
    } catch {
      // Fallback if new File constructor has browser quirks
      return file;
    }
  } catch (err) {
    console.warn("Client-side image pre-compression bypassed (using original):", err);
    return file;
  }
}

interface LoadedImageResult {
  naturalWidth: number;
  naturalHeight: number;
  element: HTMLImageElement;
}

function createImageElement(file: File): Promise<LoadedImageResult> {
  return new Promise((resolve, reject) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (urlErr) {
      return reject(urlErr);
    }

    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Ignore revoke errors
      }
      resolve({
        naturalWidth: img.naturalWidth || img.width || 0,
        naturalHeight: img.naturalHeight || img.height || 0,
        element: img,
      });
    };

    img.onerror = (err) => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Ignore revoke errors
      }
      reject(err);
    };

    img.src = objectUrl;
  });
}
