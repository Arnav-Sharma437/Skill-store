import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Banner } from "@/lib/schemas";

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: banners });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
