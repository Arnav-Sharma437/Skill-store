import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category, Product } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");
    const slug = searchParams.get("slug");

    const query: Record<string, unknown> = {};
    if (brand && brand !== "all") {
      query.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }
    if (slug) {
      query.id = { $regex: new RegExp(`^${slug.trim()}$`, "i") };
    }

    const categories = await Category.find(query).sort({ createdAt: -1 }).lean();

    // Attach real live product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        try {
          const productCount = await Product.countDocuments({
            category: { $regex: new RegExp(`^${cat.id}$`, "i") },
          });
          return {
            ...cat,
            productCount,
          };
        } catch {
          return {
            ...cat,
            productCount: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
      data: categoriesWithCount,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
