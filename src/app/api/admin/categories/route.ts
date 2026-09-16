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
    const { id, name, brand, imageUrl, link, description, subcategories } = body;

    if (!id || !name || !brand || !imageUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields (ID, Name, Brand, Image)" }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await Category.findOne({ id: cleanId });
    if (existing) {
      return NextResponse.json({ success: false, error: `Category with ID/slug "${cleanId}" already exists.` }, { status: 400 });
    }

    // Sanitize subcategories
    const cleanSubcategories = Array.isArray(subcategories)
      ? subcategories
          .filter((s: { name?: string; id?: string }) => s && (s.name || s.id))
          .map((s: { id?: string; name: string; description?: string; imageUrl?: string }) => ({
            id: (s.id || s.name).trim().toLowerCase().replace(/\s+/g, "-"),
            name: s.name.trim(),
            description: s.description ? s.description.trim() : "",
            imageUrl: s.imageUrl ? s.imageUrl.trim() : "",
          }))
      : [];

    const newCategory = await Category.create({
      id: cleanId,
      name: name.trim(),
      brand: brand.trim().toLowerCase(),
      imageUrl: imageUrl.trim(),
      link: link ? link.trim() : `/category/${cleanId}`,
      description: description ? description.trim() : "",
      subcategories: cleanSubcategories,
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
    const { id, name, brand, imageUrl, link, description, subcategories } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing category ID" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (brand !== undefined) updateFields.brand = brand.trim().toLowerCase();
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();
    if (link !== undefined) updateFields.link = link.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (subcategories !== undefined && Array.isArray(subcategories)) {
      updateFields.subcategories = subcategories
        .filter((s: { name?: string; id?: string }) => s && (s.name || s.id))
        .map((s: { id?: string; name: string; description?: string; imageUrl?: string }) => ({
          id: (s.id || s.name).trim().toLowerCase().replace(/\s+/g, "-"),
          name: s.name.trim(),
          description: s.description ? s.description.trim() : "",
          imageUrl: s.imageUrl ? s.imageUrl.trim() : "",
        }));
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { id: id.trim() },
      { $set: updateFields },
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
