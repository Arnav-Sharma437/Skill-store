import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product, Category, Banner, Brand, Review } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    await connectToDatabase();

    await Product.deleteMany({});
    await Category.deleteMany({});
    await Banner.deleteMany({});
    await Brand.deleteMany({});
    await Review.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All products, categories, banners, brands, and reviews have been completely wiped. Ready for a 100% fresh start!",
      counts: {
        products: await Product.countDocuments({}),
        categories: await Category.countDocuments({}),
        banners: await Banner.countDocuments({}),
        brands: await Brand.countDocuments({}),
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Failed to clear database";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
