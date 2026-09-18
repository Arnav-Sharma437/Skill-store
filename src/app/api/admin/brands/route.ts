import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/lib/schemas";
import { DEFAULT_HOME_SETTINGS } from "@/lib/homeDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    let brands = await Brand.find({}).sort({ order: 1, createdAt: 1 });

    // Auto-seed default brands if none exist in the database yet
    if (!brands || brands.length === 0) {
      const defaultList = DEFAULT_HOME_SETTINGS.brandsSection.brands.map((b, idx) => ({
        id: b.slug || b.id.toLowerCase(),
        name: b.name,
        logo: b.logo,
        tagline: b.tagline || "",
        description: "",
        enabled: b.enabled !== false,
        order: b.order !== undefined ? b.order : idx,
      }));

      try {
        await Brand.insertMany(defaultList, { ordered: false });
        brands = await Brand.find({}).sort({ order: 1, createdAt: 1 });
      } catch {
        // If insertMany had duplicate errors, fetch whatever exists
        brands = await Brand.find({}).sort({ order: 1, createdAt: 1 });
      }
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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, logo, tagline, description, enabled, order } = body;

    if (!name || !logo) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (Brand Name, Logo)" },
        { status: 400 }
      );
    }

    const cleanId = (id || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    const existing = await Brand.findOne({ id: cleanId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Brand with ID/slug "${cleanId}" already exists.` },
        { status: 400 }
      );
    }

    const newBrand = await Brand.create({
      id: cleanId,
      name: name.trim(),
      logo: logo.trim(),
      tagline: tagline ? tagline.trim() : "",
      description: description ? description.trim() : "",
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      order: typeof order === "number" ? order : 0,
    });

    return NextResponse.json(
      { success: true, data: newBrand },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, logo, tagline, description, enabled, order } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing brand ID" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (logo !== undefined) updateFields.logo = logo.trim();
    if (tagline !== undefined) updateFields.tagline = tagline.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (enabled !== undefined) updateFields.enabled = Boolean(enabled);
    if (order !== undefined) updateFields.order = Number(order);

    const updated = await Brand.findOneAndUpdate({ id: id.trim().toLowerCase() }, updateFields, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data: updated },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
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
      return NextResponse.json({ success: false, error: "Missing brand ID" }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase();
    const deleted = await Brand.findOneAndDelete({ id: cleanId });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: `Brand "${deleted.name}" permanently deleted.` },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
