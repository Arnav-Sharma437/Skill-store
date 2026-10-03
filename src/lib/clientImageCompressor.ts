/**
 * Client-Side Image Pre-Compression & Compatibility Utility
 *
 * Cloudinary handles all server-side image compression, resizing (1920px max),
 * and WebP conversion automatically upon upload.
 * This utility returns the native file safely across all browsers (including Safari and iOS WebKit)
 * without triggering browser-specific DOMExceptions or Canvas bugs.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetFormat?: string;
}

export async function compressImageBeforeUpload(
  file: File,
  _options: CompressionOptions = {}
): Promise<File> {
  // Always return native file directly to prevent Safari WebKit DOMExceptions
  return file;
}
