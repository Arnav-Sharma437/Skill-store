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
      isBestSeller,
      degrees,
      sizes,
      styles,
      variants
    } = body;

    if (!id || !title || !price || !imageUrl || !brand || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields (ID, Title, Price, Image, Brand, Category)" }, { status: 400 });
    }

    // Check if product ID already exists
    const existing = await Product.findOne({ id: id.trim() });
    if (existing) {
      return NextResponse.json({ success: false, error: `Product with SKU ID "${id}" already exists.` }, { status: 400 });
    }

    const newProduct = await Product.create({
      id: id.trim(),
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
      inStock: inStock !== undefined ? inStock : true,
      isBestSeller: Boolean(isBestSeller),
      degrees: Array.isArray(degrees) ? degrees.map((d: string) => String(d).trim()).filter(Boolean) : (typeof degrees === "string" ? degrees.split(",").map((d: string) => d.trim()).filter(Boolean) : []),
      sizes: Array.isArray(sizes) ? sizes.map((s: string) => String(s).trim()).filter(Boolean) : (typeof sizes === "string" ? sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
      styles: Array.isArray(styles) ? styles.map((st: string) => String(st).trim()).filter(Boolean) : (typeof styles === "string" ? styles.split(",").map((st: string) => st.trim()).filter(Boolean) : []),
      variants: Array.isArray(variants) ? variants : []
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
      isBestSeller,
      degrees,
      sizes,
      styles,
      variants
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
    if (inStock !== undefined) updateFields.inStock = Boolean(inStock);
    if (isBestSeller !== undefined) updateFields.isBestSeller = Boolean(isBestSeller);
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
      updateFields.variants = Array.isArray(variants) ? variants : [];
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

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted, message: "Product deleted successfully." });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
