import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CartItemInput {
  id: string;
  quantity?: number;
  price?: number;
  title?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCoupon = (body.couponCode || "").trim().toUpperCase();
    const items: CartItemInput[] = Array.isArray(body.items) ? body.items : [];

    if (!rawCoupon) {
      return NextResponse.json(
        { success: false, error: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your shopping cart is empty." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the product in DB that has this coupon code configured and active
    const matchedProduct = await Product.findOne({
      couponCode: { $regex: new RegExp(`^${rawCoupon}$`, "i") },
      couponIsActive: { $ne: false },
    }).lean() as {
      id: string;
      title: string;
      price: number;
      couponCode: string;
      couponDiscountType?: "percentage" | "flat";
      couponDiscountValue?: number;
      couponMinOrderAmount?: number;
      couponIsActive?: boolean;
    } | null;

    if (!matchedProduct || !matchedProduct.couponCode) {
      return NextResponse.json(
        {
          success: false,
          error: `Coupon code "${rawCoupon}" is invalid, expired, or does not exist.`,
        },
        { status: 404 }
      );
    }

    // Check if the cart contains the specific product SKU that this coupon is locked to
    const targetProductId = matchedProduct.id.toLowerCase();
    const matchingCartItem = items.find(
      (it) => String(it.id).trim().toLowerCase() === targetProductId
    );

    if (!matchingCartItem) {
      return NextResponse.json(
        {
          success: false,
          error: `Coupon "${matchedProduct.couponCode}" is only valid for "${matchedProduct.title}" (SKU: ${matchedProduct.id}). Please add this product to your cart to apply this coupon.`,
          requiredProductId: matchedProduct.id,
          requiredProductTitle: matchedProduct.title,
        },
        { status: 400 }
      );
    }

    // Calculate discount strictly for the matching product SKU
    const itemQty = Math.max(1, Number(matchingCartItem.quantity) || 1);
    const itemPrice = typeof matchingCartItem.price === "number" && matchingCartItem.price > 0
      ? matchingCartItem.price
      : matchedProduct.price;

    const itemSubtotal = itemPrice * itemQty;
    const discountType = matchedProduct.couponDiscountType === "percentage" ? "percentage" : "flat";
    const discountValue = Number(matchedProduct.couponDiscountValue) || 0;

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = Math.round(itemSubtotal * (discountValue / 100));
    } else {
      discountAmount = Math.min(discountValue, itemSubtotal);
    }

    // Ensure discount amount is at least 0 and doesn't exceed item subtotal
    discountAmount = Math.max(0, Math.min(discountAmount, itemSubtotal));

    return NextResponse.json({
      success: true,
      couponCode: matchedProduct.couponCode,
      appliedProductId: matchedProduct.id,
      appliedProductTitle: matchedProduct.title,
      discountType,
      discountValue,
      discountAmount,
      message: `Coupon "${matchedProduct.couponCode}" applied successfully! ₹${discountAmount.toLocaleString("en-IN")} discount added on ${matchedProduct.title}.`,
    });
  } catch (error: unknown) {
    console.error("Coupon validation error:", error);
    const msg = error instanceof Error ? error.message : "Error validating coupon";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
