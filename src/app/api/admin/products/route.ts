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

    const query: Record<string, unknown> = {};

    if (brand) query.brand = brand.toLowerCase();
    if (category) query.category = category.toLowerCase();
    if (subCategory) query.subCategory = subCategory.toLowerCase();
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      id,
      title,
      price,
      originalPrice,
      imageUrl,
      gallery,
      rating,
      ratingCount,
      brand,
      category,
      subCategory,
      description,
      specifications,
      whatsInBox,
      inStock
    } = body;

    if (!id || !title || !price || !imageUrl || !brand || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await Product.create({
      id,
      title,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      imageUrl,
      gallery: gallery || [],
      rating: Number(rating || 5),
      ratingCount: Number(ratingCount || 0),
      brand: brand.toLowerCase(),
      category: category.toLowerCase(),
      subCategory: subCategory ? subCategory.toLowerCase() : "domestic",
      description: description || [],
      specifications: specifications || [],
      whatsInBox: whatsInBox || [],
      inStock: inStock !== undefined ? inStock : true
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      id,
      title,
      price,
      originalPrice,
      imageUrl,
      gallery,
      rating,
      ratingCount,
      brand,
      category,
      subCategory,
      description,
      specifications,
      whatsInBox,
      inStock
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      {
        title,
        price: price !== undefined ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : undefined,
        imageUrl,
        gallery,
        rating: rating !== undefined ? Number(rating) : undefined,
        ratingCount: ratingCount !== undefined ? Number(ratingCount) : undefined,
        brand: brand ? brand.toLowerCase() : undefined,
        category: category ? category.toLowerCase() : undefined,
        subCategory: subCategory ? subCategory.toLowerCase() : undefined,
        description,
        specifications,
        whatsInBox,
        inStock
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedProduct });
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
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
