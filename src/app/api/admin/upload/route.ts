import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "skill-store";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please provide a valid file." },
        { status: 400 }
      );
    }

    const mimeType = (file.type || "").toLowerCase();
    const originalName = file.name || "upload";
    const dotIndex = originalName.lastIndexOf(".");
    const ext = dotIndex !== -1 ? originalName.slice(dotIndex).toLowerCase() : (mimeType.includes("video") ? ".mp4" : ".jpg");

    // MIME type or extension check
    const isImage = mimeType.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"].includes(ext);
    const isVideo = mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".mkv"].includes(ext);

    if (!isImage && !isVideo && !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Only standard images (PNG, JPG, WEBP, SVG) and videos (MP4, WEBM, MOV) are allowed.",
        },
        { status: 400 }
      );
    }

    // Size limit check (Image: 10MB, Video: 50MB)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File exceeds maximum allowed size of ${isVideo ? "50MB" : "10MB"}.`,
        },
        { status: 400 }
      );
    }

    // Verify Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary is not configured on the server. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    // Generate sanitized base filename for Cloudinary public_id
    const rawBase = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
    const sanitizedBase = rawBase
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const publicId = `${Date.now()}_${sanitizedBase || "media"}`;

    // Read arrayBuffer and convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using upload_stream
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: isVideo ? "video" : "auto",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new Error("Cloudinary upload failed with empty response"));
          }
        }
      );

      uploadStream.end(buffer);
    });

    const secureUrl = result.secure_url || result.url;

    return NextResponse.json({
      success: true,
      url: secureUrl,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes || file.size,
      mediaType: isVideo ? "video" : "image",
      message: "File uploaded successfully to Cloudinary!",
    });
  } catch (error: unknown) {
    console.error("Admin Cloudinary upload error:", error);
    const errMsg = error instanceof Error ? error.message : "Error uploading file to Cloudinary";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
