import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/lib/schemas";

// GET /api/reviews?productId=xyz - returns approved reviews for a product
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await Review.find({ productId, status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews - submit a new review (starts in 'pending' status)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { productId, productTitle, userName, userEmail, rating, title, comment } = body;

    if (!productId || !userName || !comment || !rating) {
      return NextResponse.json(
        { error: "Missing required fields (productId, userName, rating, comment)" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productId,
      productTitle: productTitle || "",
      userName: userName.trim(),
      userEmail: (userEmail || "").trim(),
      rating: Number(rating),
      title: (title || "").trim(),
      comment: comment.trim(),
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully and is pending admin approval.",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
