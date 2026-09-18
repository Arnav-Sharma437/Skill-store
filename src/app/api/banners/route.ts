import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Banner } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(
      { success: true, data: banners },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
