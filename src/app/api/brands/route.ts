import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/lib/schemas";
import { DEFAULT_HOME_SETTINGS } from "@/lib/homeDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    let brands = await Brand.find({ enabled: { $ne: false } }).sort({ order: 1, createdAt: 1 });

    if (!brands || brands.length === 0) {
      // If none in DB, return default active brands
      const defaultBrands = DEFAULT_HOME_SETTINGS.brandsSection.brands.filter(
        (b) => b.enabled !== false
      );
      return NextResponse.json(
        { success: true, data: defaultBrands },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
      );
    }

    return NextResponse.json(
      { success: true, data: brands },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
