import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/schemas";
import { getProductById, getAllCatalogProducts } from "@/data/categories";
import { HOME_PRODUCTS } from "@/data/home";

type Params = {
  params: Promise<{ id: string }> | { id: string };
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFuzzyRegex(input: string): RegExp {
  const chars = input.replace(/[-_\s]+/g, "").split("");
  if (chars.length === 0) return new RegExp(escapeRegex(input), "i");
  const pattern = chars.map((c) => escapeRegex(c)).join("[-_\\s]*");
  return new RegExp(`^${pattern}$`, "i");
}

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-");
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawId = resolvedParams?.id || "";

    if (!rawId) {
      return NextResponse.json({ success: false, error: "Product identifier is required" }, { status: 400 });
    }

    const cleanId = decodeURIComponent(rawId).trim();
    const cleanEscaped = escapeRegex(cleanId);
    const fuzzyRegex = buildFuzzyRegex(cleanId);
    const targetSlug = slugify(cleanId);
    const titleRegex = new RegExp(cleanEscaped, "i");

    let productDoc: Record<string, unknown> | null = null;

    try {
      await connectToDatabase();

      const orConditions: Record<string, unknown>[] = [
        { id: cleanId },
        { id: { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { id: { $regex: fuzzyRegex } },
        { sku: cleanId },
        { sku: { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { sku: { $regex: fuzzyRegex } },
        { slug: cleanId },
        { slug: targetSlug },
        { "variants.sku": { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { "variants.sku": { $regex: fuzzyRegex } },
        { "variants.id": { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { "variants.name": { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { title: { $regex: titleRegex } }
      ];

      if (mongoose.isValidObjectId(cleanId)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
      }

      productDoc = (await Product.findOne({ $or: orConditions }).lean()) as unknown as Record<string, unknown> | null;

      // If still not found by direct conditions, check across all docs by slugified title
      if (!productDoc && targetSlug) {
        const allDocs = (await Product.find({}).lean()) as unknown as Record<string, unknown>[];
        const matched = allDocs.find((doc) => {
          const docTitle = String(doc.title || "");
          const docSlug = slugify(docTitle);
          const docId = String(doc.id || "").toLowerCase();
          const docSku = String(doc.sku || "").toLowerCase();
          const cleanLower = cleanId.toLowerCase();
          return (
            docSlug === targetSlug ||
            docSlug.includes(targetSlug) ||
            targetSlug.includes(docSlug) ||
            docId === cleanLower ||
            docSku === cleanLower ||
            docTitle.toLowerCase().includes(cleanLower)
          );
        });
        if (matched) {
          productDoc = matched;
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB lookup error, falling back to static catalog:", dbErr);
    }

    if (productDoc) {
      return NextResponse.json(
        { success: true, data: productDoc },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    // Static catalog fallback lookup
    const staticProd = getProductById(cleanId);
    if (staticProd) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: staticProd.id,
            title: staticProd.title,
            price: staticProd.price,
            originalPrice: staticProd.originalPrice,
            imageUrl: staticProd.imageUrl,
            rating: staticProd.rating,
            ratingCount: staticProd.ratingCount,
            brand: staticProd.brand || "TUQO",
            category: staticProd.categorySlug || "high-pressure-washer",
            categoryName: staticProd.categoryName || "High Pressure Washer",
            subCategory: staticProd.subType || "domestic",
            inStock: staticProd.inStock !== false,
            stockQuantity: staticProd.stockQuantity ?? 10,
          },
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    // Search across all catalog products and home products
    const allStatic = [...getAllCatalogProducts(), ...HOME_PRODUCTS];
    const normalizedTarget = cleanId.replace(/[-_\s]+/g, "").toLowerCase();

    const matchedStatic = allStatic.find((p) => {
      const pIdNorm = (p.id || "").replace(/[-_\s]+/g, "").toLowerCase();
      const pTitle = (p.title || "").toLowerCase();
      const pSlug = slugify(p.title);
      const cleanLower = cleanId.toLowerCase();
      return (
        pIdNorm === normalizedTarget ||
        p.id.toLowerCase() === cleanLower ||
        pSlug === targetSlug ||
        pTitle.includes(cleanLower) ||
        cleanLower.includes(pIdNorm)
      );
    });

    if (matchedStatic) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: matchedStatic.id,
            title: matchedStatic.title,
            price: matchedStatic.price,
            originalPrice: matchedStatic.originalPrice || matchedStatic.price,
            imageUrl: matchedStatic.imageUrl,
            rating: matchedStatic.rating || 5,
            ratingCount: matchedStatic.ratingCount || 0,
            brand: matchedStatic.brand || "TUQO",
            category: "high-pressure-washer",
            categoryName: "High Pressure Washer",
            subCategory: matchedStatic.subType || "domestic",
            inStock: matchedStatic.inStock !== false,
            stockQuantity: matchedStatic.stockQuantity ?? 10,
          },
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    return NextResponse.json(
      { success: false, error: `Product "${cleanId}" not found.` },
      { status: 404, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
