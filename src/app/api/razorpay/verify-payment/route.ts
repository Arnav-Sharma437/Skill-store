import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { verifyPaymentSignature, calculateVerifiedOrder } from "@/lib/razorpay";
import { createShiprocketOrder, estimatePackageSpecs } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      customerDetails,
      shippingAddress,
      receipt,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required Razorpay payment verification parameters.",
        },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay Payment Signature with HMAC SHA256
    const isSignatureValid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isSignatureValid) {
      console.error(
        `Invalid Razorpay payment signature for order: ${razorpay_order_id}, payment: ${razorpay_payment_id}`
      );
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    await dbConnect();

    // Check if order already saved (idempotency check)
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.orderNumber,
        orderId: existingOrder._id.toString(),
        grandTotal: existingOrder.grandTotal,
        paymentStatus: existingOrder.paymentStatus,
        shiprocketStatus: existingOrder.shiprocketStatus,
        shiprocketTrackingUrl: existingOrder.shiprocketTrackingUrl,
        message: "Order already verified and recorded.",
      });
    }

    // 3. Recalculate verified items & totals securely
    const verifiedOrder = await calculateVerifiedOrder(items);

    // 4. Resolve session & user details
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = (
      session?.user?.email ||
      customerDetails?.email ||
      shippingAddress?.email ||
      "customer@skillstore.in"
    )
      .toLowerCase()
      .trim();
    const userName =
      session?.user?.name ||
      customerDetails?.name ||
      shippingAddress?.name ||
      "Skill Store Customer";
    const userPhone = customerDetails?.phone || shippingAddress?.phone || "";

    // 5. Generate human-readable Order Number
    const orderNumber = `SKILL-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Estimate package logistics specs
    const specs = estimatePackageSpecs(verifiedOrder.items);

    // 6. Save verified Order into MongoDB
    const newOrder = new Order({
      orderNumber,
      userId: userId || undefined,
      userEmail,
      userName,
      userPhone,
      items: verifiedOrder.items,
      subtotal: verifiedOrder.subtotal,
      gst: verifiedOrder.gst,
      shipping: verifiedOrder.shipping,
      grandTotal: verifiedOrder.grandTotal,
      currency: "INR",
      paymentStatus: "paid",
      orderStatus: "processing",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      shippingAddress: shippingAddress || {},
      receipt: receipt || "",
      weight: specs.weightKg,
      dimensions: {
        length: specs.lengthCm,
        breadth: specs.breadthCm,
        height: specs.heightCm,
      },
      shiprocketStatus: "pending_shipment",
    });

    const createdOrder = await newOrder.save();

    // 7. Automatic Shiprocket Order Creation (Safe & resilient)
    try {
      const shiprocketResult = await createShiprocketOrder(createdOrder);
      if (shiprocketResult.success) {
        createdOrder.shiprocketOrderId = shiprocketResult.shiprocketOrderId || "";
        createdOrder.shiprocketShipmentId = shiprocketResult.shipmentId || "";
        createdOrder.shiprocketAwbCode = shiprocketResult.awbCode || "";
        createdOrder.shiprocketCourierName = shiprocketResult.courierName || "";
        createdOrder.shiprocketStatus = shiprocketResult.status || "CREATED";
        createdOrder.shiprocketTrackingUrl = shiprocketResult.trackingUrl || "";
        createdOrder.orderStatus = "confirmed";
        await createdOrder.save();
      } else {
        createdOrder.shipmentError = shiprocketResult.error || "Shipment creation failed";
        createdOrder.shiprocketStatus = "pending_shipment";
        await createdOrder.save();
      }
    } catch (shipErr) {
      console.error("Automatic Shiprocket creation error:", shipErr);
      createdOrder.shipmentError =
        shipErr instanceof Error ? shipErr.message : "Shiprocket network exception";
      createdOrder.shiprocketStatus = "pending_shipment";
      await createdOrder.save();
    }

    return NextResponse.json({
      success: true,
      orderNumber: createdOrder.orderNumber,
      orderId: (createdOrder._id as { toString(): string }).toString(),
      grandTotal: createdOrder.grandTotal,
      items: createdOrder.items,
      paymentStatus: "paid",
      orderStatus: createdOrder.orderStatus,
      shiprocketStatus: createdOrder.shiprocketStatus,
      shiprocketTrackingUrl: createdOrder.shiprocketTrackingUrl,
      message: "Payment successfully verified and order confirmed!",
    });
  } catch (error: unknown) {
    console.error("Error verifying Razorpay payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to verify payment.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
