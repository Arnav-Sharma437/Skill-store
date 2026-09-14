import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const search = searchParams.get("search");
    const inStockOnly = searchParams.get("inStockOnly") !== "false";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 0;

    const query: Record<string, unknown> = {};

    if (inStockOnly) {
      query.inStock = true;
    }

    if (brand && brand !== "all") {
      query.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }

    if (category && category !== "all") {
      const catClean = category.trim().toLowerCase();
      query.$or = [
        { category: { $regex: new RegExp(`^${catClean}$`, "i") } },
        { category: { $regex: new RegExp(`^${catClean.replace(/-/g, " ") }$`, "i") } },
        { category: { $regex: new RegExp(`^${catClean.replace(/\s+/g, "-") }$`, "i") } }
      ];
    }

    if (subCategory && subCategory !== "all") {
      query.subCategory = { $regex: new RegExp(`^${subCategory.trim()}$`, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { id: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex }
      ];
    }

    let mongoQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit > 0) {
      mongoQuery = mongoQuery.limit(limit);
    }

    const products = await mongoQuery.lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
