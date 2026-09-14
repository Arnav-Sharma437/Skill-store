/**
 * Image Optimization Utilities for Cloudinary and Local Assets
 * 
 * Generates optimized delivery URLs using q_auto, f_auto, and appropriate width caps (c_limit)
 * to save bandwidth and improve page performance while preserving aspect ratios and original uploads.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  crop?: "limit" | "scale" | "fill" | "fit" | "thumb" | "pad";
  dpr?: "auto" | number;
}

export const CLOUDINARY_SIZES = {
  PRODUCT_CARD: 600,
  PRODUCT_DETAIL: 1200,
  HERO_BANNER: 1920,
  GALLERY_THUMBNAIL: 300,
  ADMIN_PREVIEW: 400,
} as const;

/**
 * Transforms Cloudinary image URLs to use optimized format, quality, and sizing parameters.
 * Local and non-Cloudinary URLs are returned untouched.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Cloudinary standard upload URL pattern
  const cloudinaryRegex = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i;
  const match = trimmed.match(cloudinaryRegex);

  if (!match) {
    return trimmed;
  }

  const prefix = match[1];
  const rest = match[2];

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
    dpr
  } = options;

  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);
  if (dpr) transforms.push(`dpr_${dpr}`);

  const transformString = transforms.join(",");
  if (!transformString) return trimmed;

  // Check if the URL already has a transformation segment before version/public_id
  const segments = rest.split("/");
  // If first segment looks like existing transformation parameters (e.g., "f_auto,q_auto" or "w_500")
  if (segments.length > 1 && /^(?:[a-z]_[^/]+)(?:,[a-z]_[^/]+)*$/i.test(segments[0])) {
    segments[0] = transformString;
    return `${prefix}${segments.join("/")}`;
  }

  return `${prefix}${transformString}/${rest}`;
}

/**
 * Preset for Product Cards in grids, carousels, category pages, search results, wishlist (max-width: 600)
 */
export function optimizeProductCard(url?: string | null): string {
  return getOptimizedImageUrl(url, {
    width: CLOUDINARY_SIZES.PRODUCT_CARD,
    crop: "limit",
    quality: "auto",
    format: "auto"
  });
}

/**
 * Preset for main Product Detail images (max-width: 1200)
 */
export function optimizeProductDetail(url?: string | null): string {
  return getOptimizedImageUrl(url, {
    width: CLOUDINARY_SIZES.PRODUCT_DETAIL,
    crop: "limit",
    quality: "auto",
    format: "auto"
  });
}

/**
 * Preset for Hero Banners (max-width: 1920)
 */
export function optimizeHeroBanner(url?: string | null): string {
  return getOptimizedImageUrl(url, {
    width: CLOUDINARY_SIZES.HERO_BANNER,
    crop: "limit",
    quality: "auto",
    format: "auto"
  });
}

/**
 * Preset for Product Gallery Thumbnails and small cart/recent thumbnails (max-width: 300)
 */
export function optimizeGalleryThumbnail(url?: string | null): string {
  return getOptimizedImageUrl(url, {
    width: CLOUDINARY_SIZES.GALLERY_THUMBNAIL,
    crop: "limit",
    quality: "auto",
    format: "auto"
  });
}

/**
 * Preset for Admin panel previews (max-width: 400)
 */
export function optimizeAdminPreview(url?: string | null): string {
  return getOptimizedImageUrl(url, {
    width: CLOUDINARY_SIZES.ADMIN_PREVIEW,
    crop: "limit",
    quality: "auto",
    format: "auto"
  });
}
