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
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    targetFormat = "image/webp",
  } = options;

  // Don't process non-browser environments
  if (typeof window === "undefined") {
    return file;
  }

  const mimeType = (file.type || "").toLowerCase();
  const name = file.name || "image";

  // Skip videos, SVGs, and non-image files
  if (
    mimeType.startsWith("video/") ||
    mimeType === "image/svg+xml" ||
    mimeType === "image/gif" ||
    name.endsWith(".svg") ||
    name.endsWith(".gif")
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

  try {
    const bitmapOrImage = await createImageElement(file);
    const { naturalWidth, naturalHeight } = bitmapOrImage;

    // Calculate new aspect-ratio preserving dimensions
    let targetWidth = naturalWidth;
    let targetHeight = naturalHeight;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // If image is already smaller than max dimensions and under 250KB WebP, return original
    if (
      targetWidth === naturalWidth &&
      targetHeight === naturalHeight &&
      mimeType === "image/webp" &&
      file.size < 250 * 1024
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

    // Export compressed blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            // Fallback to jpeg if webp export failed
            canvas.toBlob((fallbackBlob) => resolve(fallbackBlob), "image/jpeg", quality);
          }
        },
        targetFormat,
        quality
      );
    });

    if (!blob) {
      return file;
    }

    // Replace extension with .webp
    const dotIndex = name.lastIndexOf(".");
    const baseName = dotIndex !== -1 ? name.slice(0, dotIndex) : name;
    const newName = `${baseName}.webp`;

    return new File([blob], newName, {
      type: blob.type || "image/webp",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Client-side image compression fallback to original:", err);
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
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        naturalWidth: img.naturalWidth || img.width,
        naturalHeight: img.naturalHeight || img.height,
        element: img,
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
