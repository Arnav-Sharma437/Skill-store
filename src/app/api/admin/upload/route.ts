import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please provide a valid file." },
        { status: 400 }
      );
    }

    const mimeType = (file.type || "").toLowerCase();
    const originalName = file.name || "upload";
    const ext = path.extname(originalName).toLowerCase() || (mimeType.includes("video") ? ".mp4" : ".jpg");

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

    // Generate sanitized unique filename
    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueFilename = `${Date.now()}_${sanitizedBase || "media"}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      mediaType: isVideo ? "video" : "image",
      message: "File uploaded successfully!",
    });
  } catch (error: unknown) {
    console.error("Admin file upload error:", error);
    const errMsg = error instanceof Error ? error.message : "Error uploading file";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
