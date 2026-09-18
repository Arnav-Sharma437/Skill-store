import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Banner } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: banners },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, imageUrl, link } = body;

    if (!id || !imageUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields: id, imageUrl" }, { status: 400 });
    }

    const newBanner = await Banner.create({ id: id.trim(), imageUrl: imageUrl.trim(), link: link ? link.trim() : "/" });
    return NextResponse.json(
      { success: true, data: newBanner },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, imageUrl, link } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing banner ID" }, { status: 400 });
    }

    const updatedBanner = await Banner.findOneAndUpdate(
      { id: id.trim() },
      { imageUrl: imageUrl?.trim(), link: link?.trim() },
      { new: true }
    );

    if (!updatedBanner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: updatedBanner },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !id.trim()) {
      return NextResponse.json({ success: false, error: "Missing banner ID" }, { status: 400 });
    }

    const cleanId = id.trim();
    const isObjId = mongoose.Types.ObjectId.isValid(cleanId);

    const deleteFilter: Record<string, unknown>[] = [
      { id: cleanId },
      { id: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
    ];

    if (isObjId) {
      deleteFilter.push({ _id: new mongoose.Types.ObjectId(cleanId) });
    }

    const deleted = await Banner.findOneAndDelete({ $or: deleteFilter });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: deleted, message: "Banner deleted successfully" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
