import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRazorpayClient, calculateVerifiedOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerDetails, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your shopping cart is empty." },
        { status: 400 }
      );
    }

    // Authenticate session if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = (session?.user?.email || customerDetails?.email || "customer@skillstore.in")
      .toLowerCase()
      .trim();
    const userName = session?.user?.name || customerDetails?.name || "Skill Store Customer";

    // 1. Calculate strictly verified prices on server-side (never trusts client price)
    const verifiedOrder = await calculateVerifiedOrder(items);

    if (verifiedOrder.amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Calculated order amount is invalid." },
        { status: 400 }
      );
    }

    // 2. Initialize Razorpay Client
    const razorpay = getRazorpayClient();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Create server-side Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: verifiedOrder.amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: userId || "guest",
        userEmail,
        userName,
        itemCount: String(verifiedOrder.items.length),
        city: shippingAddress?.city || "",
        pincode: shippingAddress?.pincode || "",
      },
    });

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: receiptId,
      keyId,
      subtotal: verifiedOrder.subtotal,
      gst: verifiedOrder.gst,
      grandTotal: verifiedOrder.grandTotal,
      customer: {
        name: userName,
        email: userEmail,
        phone: customerDetails?.phone || "",
      },
    });
  } catch (error: unknown) {
    console.error("Error creating Razorpay order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
