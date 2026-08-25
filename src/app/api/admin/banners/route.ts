import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Banner } from "@/lib/schemas";

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: banners });
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

    const newBanner = await Banner.create({ id, imageUrl, link: link || "/" });
    return NextResponse.json({ success: true, data: newBanner });
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
      { id },
      { imageUrl, link },
      { new: true }
    );

    if (!updatedBanner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBanner });
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

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing banner ID" }, { status: 400 });
    }

    const deleted = await Banner.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
