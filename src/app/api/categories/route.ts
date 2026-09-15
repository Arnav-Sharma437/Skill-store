import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    const query: Record<string, unknown> = {};
    if (brand && brand !== "all") {
      query.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }

    const categories = await Category.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
