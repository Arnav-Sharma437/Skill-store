import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/lib/schemas";
import { DEFAULT_HOME_SETTINGS } from "@/lib/homeDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    const brands = await Brand.find({ enabled: { $ne: false } }).sort({ order: 1, createdAt: 1 });

    return NextResponse.json(
      { success: true, data: brands || [] },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
