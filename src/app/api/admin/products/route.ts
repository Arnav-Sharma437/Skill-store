import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (brand && brand !== "all") query.brand = brand.toLowerCase();
    if (category && category !== "all") query.category = category.toLowerCase();
    if (subCategory && subCategory !== "all") query.subCategory = subCategory.toLowerCase();
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    const rawProducts = await Product.find(query).lean();
    const products = (rawProducts as (typeof rawProducts[0] & { order?: number; createdAt?: string | Date })[]).sort((a, b) => {
      const orderA = typeof a.order === "number" && a.order > 0 ? a.order : 999999;
      const orderB = typeof b.order === "number" && b.order > 0 ? b.order : 999999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(
      { success: true, data: products },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

interface RawVariant {
  id?: string;
  sku?: string;
  name?: string;
  type?: string;
  degree?: string;
  size?: string;
  style?: string;
  price?: number | string;
  originalPrice?: number | string;
  inStock?: boolean;
  stockQuantity?: number | string;
  imageUrl?: string;
}

function sanitizeVariants(variants: unknown) {
  if (!Array.isArray(variants)) return [];
  return variants.map((v: RawVariant) => ({
    id: v.id ? String(v.id).trim() : "",
    sku: v.sku ? String(v.sku).trim() : "",
    name: v.name ? String(v.name).trim() : "",
    type: v.type ? String(v.type).trim() : "general",
    degree: v.degree ? String(v.degree).trim() : "",
    size: v.size ? String(v.size).trim() : "",
    style: v.style ? String(v.style).trim() : "",
    price: v.price !== undefined && v.price !== "" ? Number(v.price) : undefined,
    originalPrice: v.originalPrice !== undefined && v.originalPrice !== "" ? Number(v.originalPrice) : undefined,
    inStock: v.inStock !== undefined ? Boolean(v.inStock) : (v.stockQuantity !== undefined ? Number(v.stockQuantity) > 0 : true),
    stockQuantity: v.stockQuantity !== undefined && v.stockQuantity !== "" ? Math.max(0, Number(v.stockQuantity)) : 10,
    imageUrl: v.imageUrl ? String(v.imageUrl).trim() : "",
  })).filter(v => v.name || v.degree || v.size || v.style || v.imageUrl || v.sku);
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
      videoUrl,
      gallery,
      rating,
      ratingCount,
      brand,
      category,
      subCategory,
      description,
      specifications,
      whatsInBox,
      inStock,
      stockQuantity,
      isBestSeller,
      order,
      degrees,
      sizes,
      styles,
      variants,
      couponCode,
      couponDiscountType,
      couponDiscountValue,
      couponMinOrderAmount,
      couponIsActive,
    } = body;

    if (!id || !title || !price || !imageUrl || !brand || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields (ID, Title, Price, Image, Brand, Category)" }, { status: 400 });
    }

    // Check if product ID already exists
    const existing = await Product.findOne({ id: id.trim() });
    if (existing) {
      return NextResponse.json({ success: false, error: `Product with SKU ID "${id}" already exists.` }, { status: 400 });
    }

    const parsedOrder = typeof order === "number" && !isNaN(order) && order > 0 ? order : (Number(order) > 0 ? Number(order) : 0);
    const parsedStockQty = stockQuantity !== undefined && stockQuantity !== "" ? Math.max(0, Number(stockQuantity)) : 10;
    const finalInStock = inStock !== undefined ? Boolean(inStock) : parsedStockQty > 0;

    const newProduct = await Product.create({
      id: id.trim(),
      sku: id.trim(),
      title: title.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      imageUrl: imageUrl.trim(),
      videoUrl: videoUrl ? videoUrl.trim() : "",
      gallery: Array.isArray(gallery) ? gallery : [],
      rating: Number(rating || 5),
      ratingCount: Number(ratingCount || 0),
      brand: brand.toLowerCase().trim(),
      category: category.toLowerCase().trim(),
      subCategory: subCategory ? subCategory.toLowerCase().trim() : "domestic",
      description: Array.isArray(description) ? description : (typeof description === "string" ? description.split("\n").filter(Boolean) : []),
      specifications: Array.isArray(specifications) ? specifications : (typeof specifications === "string" ? specifications.split("\n").filter(Boolean) : []),
      whatsInBox: Array.isArray(whatsInBox) ? whatsInBox : (typeof whatsInBox === "string" ? whatsInBox.split("\n").filter(Boolean) : []),
      inStock: finalInStock,
      stockQuantity: parsedStockQty,
      isBestSeller: Boolean(isBestSeller),
      order: parsedOrder,
      degrees: Array.isArray(degrees) ? degrees.map((d: string) => String(d).trim()).filter(Boolean) : (typeof degrees === "string" ? degrees.split(",").map((d: string) => d.trim()).filter(Boolean) : []),
      sizes: Array.isArray(sizes) ? sizes.map((s: string) => String(s).trim()).filter(Boolean) : (typeof sizes === "string" ? sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
      styles: Array.isArray(styles) ? styles.map((st: string) => String(st).trim()).filter(Boolean) : (typeof styles === "string" ? styles.split(",").map((st: string) => st.trim()).filter(Boolean) : []),
      variants: sanitizeVariants(variants),
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",
      couponDiscountType: couponDiscountType === "percentage" ? "percentage" : "flat",
      couponDiscountValue: Number(couponDiscountValue || 0),
      couponMinOrderAmount: Number(couponMinOrderAmount || 0),
      couponIsActive: couponIsActive !== undefined ? Boolean(couponIsActive) : true,
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
      videoUrl,
      gallery,
      rating,
      ratingCount,
      brand,
      category,
      subCategory,
      description,
      specifications,
      whatsInBox,
      inStock,
      stockQuantity,
      isBestSeller,
      order,
      degrees,
      sizes,
      styles,
      variants,
      couponCode,
      couponDiscountType,
      couponDiscountValue,
      couponMinOrderAmount,
      couponIsActive,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};

    if (title !== undefined) updateFields.title = title.trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (originalPrice !== undefined) updateFields.originalPrice = Number(originalPrice);
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();
    if (videoUrl !== undefined) updateFields.videoUrl = videoUrl.trim();
    if (gallery !== undefined) updateFields.gallery = Array.isArray(gallery) ? gallery : [];
    if (rating !== undefined) updateFields.rating = Number(rating);
    if (ratingCount !== undefined) updateFields.ratingCount = Number(ratingCount);
    if (brand !== undefined) updateFields.brand = brand.toLowerCase().trim();
    if (category !== undefined) updateFields.category = category.toLowerCase().trim();
    if (subCategory !== undefined) updateFields.subCategory = subCategory.toLowerCase().trim();
    if (description !== undefined) {
      updateFields.description = Array.isArray(description) ? description : (typeof description === "string" ? description.split("\n").filter(Boolean) : []);
    }
    if (specifications !== undefined) {
      updateFields.specifications = Array.isArray(specifications) ? specifications : (typeof specifications === "string" ? specifications.split("\n").filter(Boolean) : []);
    }
    if (whatsInBox !== undefined) {
      updateFields.whatsInBox = Array.isArray(whatsInBox) ? whatsInBox : (typeof whatsInBox === "string" ? whatsInBox.split("\n").filter(Boolean) : []);
    }
    if (stockQuantity !== undefined) {
      const parsedStock = Math.max(0, Number(stockQuantity));
      updateFields.stockQuantity = parsedStock;
      if (inStock === undefined) {
        updateFields.inStock = parsedStock > 0;
      }
    }
    if (inStock !== undefined) updateFields.inStock = Boolean(inStock);
    if (isBestSeller !== undefined) updateFields.isBestSeller = Boolean(isBestSeller);
    if (order !== undefined) {
      const parsed = Number(order);
      updateFields.order = !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    }
    if (degrees !== undefined) {
      updateFields.degrees = Array.isArray(degrees) ? degrees.map((d: string) => String(d).trim()).filter(Boolean) : (typeof degrees === "string" ? degrees.split(",").map((d: string) => d.trim()).filter(Boolean) : []);
    }
    if (sizes !== undefined) {
      updateFields.sizes = Array.isArray(sizes) ? sizes.map((s: string) => String(s).trim()).filter(Boolean) : (typeof sizes === "string" ? sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
    }
    if (styles !== undefined) {
      updateFields.styles = Array.isArray(styles) ? styles.map((st: string) => String(st).trim()).filter(Boolean) : (typeof styles === "string" ? styles.split(",").map((st: string) => st.trim()).filter(Boolean) : []);
    }
    if (variants !== undefined) {
      updateFields.variants = sanitizeVariants(variants);
    }
    if (couponCode !== undefined) {
      updateFields.couponCode = couponCode ? String(couponCode).trim().toUpperCase() : "";
    }
    if (couponDiscountType !== undefined) {
      updateFields.couponDiscountType = couponDiscountType === "percentage" ? "percentage" : "flat";
    }
    if (couponDiscountValue !== undefined) {
      updateFields.couponDiscountValue = Number(couponDiscountValue || 0);
    }
    if (couponMinOrderAmount !== undefined) {
      updateFields.couponMinOrderAmount = Number(couponMinOrderAmount || 0);
    }
    if (couponIsActive !== undefined) {
      updateFields.couponIsActive = Boolean(couponIsActive);
    }


    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { $set: updateFields },
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

    if (!id || !id.trim()) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    const cleanId = id.trim();
    const isObjId = mongoose.Types.ObjectId.isValid(cleanId);

    const deleteFilter: Record<string, unknown>[] = [
      { id: cleanId },
      { id: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
    ];

    if (isObjId) {
      deleteFilter.push({ _id: new mongoose.Types.ObjectId(cleanId) });
    }

    const deleted = await Product.findOneAndDelete({ $or: deleteFilter });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: deleted, message: "Product deleted successfully." },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
