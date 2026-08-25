import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    const query = brand ? { brand: brand.toLowerCase() } : {};
    const categories = await Category.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, brand, imageUrl, link } = body;

    if (!id || !name || !brand || !imageUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newCategory = await Category.create({
      id,
      name,
      brand: brand.toLowerCase(),
      imageUrl,
      link: link || `/shop/${brand.toLowerCase()}/${id.toLowerCase()}`,
    });

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, brand, imageUrl, link } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing category ID" }, { status: 400 });
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { id },
      { name, brand: brand?.toLowerCase(), imageUrl, link },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCategory });
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
      return NextResponse.json({ success: false, error: "Missing category ID" }, { status: 400 });
    }

    const deleted = await Category.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
