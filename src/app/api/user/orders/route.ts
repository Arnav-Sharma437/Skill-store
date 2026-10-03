import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryPhone = searchParams.get("phone")?.replace(/\D/g, "") || "";
    const queryEmail = searchParams.get("email")?.toLowerCase().trim() || "";
    const queryOrder = (searchParams.get("orderNumber") || searchParams.get("order") || searchParams.get("orderId"))?.trim() || "";

    if (!session?.user?.email && !queryPhone && !queryEmail && !queryOrder) {
      return NextResponse.json(
        { success: false, error: "Please log in or provide an order number / registered mobile number." },
        { status: 401 }
      );
    }

    await dbConnect();

    const orConditions: Array<Record<string, unknown>> = [];

    if (queryOrder) {
      orConditions.push({ orderNumber: { $regex: new RegExp(`^${queryOrder}$`, "i") } });
      if (queryOrder.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: queryOrder });
      }
    }

    if (session?.user?.email) {
      const userEmail = session.user.email.toLowerCase().trim();
      const userId = session.user.id;
      orConditions.push({ userEmail: { $regex: new RegExp(`^${userEmail}$`, "i") } });
      if (userId) {
        orConditions.push({ userId });
      }

      // Look up user's profile to extract known phone numbers
      const dbUser = await User.findOne({ email: userEmail }).lean();
      if (dbUser && Array.isArray((dbUser as { addresses?: Array<{ phone?: string }> }).addresses)) {
        for (const addr of (dbUser as { addresses: Array<{ phone?: string }> }).addresses) {
          const p = addr.phone?.replace(/\D/g, "");
          if (p && p.length >= 10) {
            const p10 = p.slice(-10);
            orConditions.push({ userPhone: { $regex: p10 } });
            orConditions.push({ "shippingAddress.phone": { $regex: p10 } });
          }
        }
      }
    }

    if (queryEmail) {
      orConditions.push({ userEmail: { $regex: new RegExp(`^${queryEmail}$`, "i") } });
    }

    if (queryPhone && queryPhone.length >= 10) {
      const p10 = queryPhone.slice(-10);
      orConditions.push({ userPhone: { $regex: p10 } });
      orConditions.push({ "shippingAddress.phone": { $regex: p10 } });
    }

    const query = orConditions.length > 0 ? { $or: orConditions } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders: orders.map((ord) => ({
        id: ord.orderNumber || ord._id.toString(),
        mongoId: ord._id.toString(),
        orderNumber: ord.orderNumber,
        date: new Date(ord.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: ord.createdAt,
        userName: ord.userName,
        userEmail: ord.userEmail,
        userPhone: ord.userPhone,
        shippingAddress: ord.shippingAddress,
        total: ord.grandTotal,
        subtotal: ord.subtotal,
        gst: ord.gst,
        status: ord.paymentStatus === "paid" ? (ord.orderStatus || "Confirmed") : ord.paymentStatus,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        paymentMethod: ord.paymentMethod,
        items: (ord.items || []).map((item) => ({
          name: item.title,
          qty: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        razorpayPaymentId: ord.razorpayPaymentId,
        shiprocketOrderId: ord.shiprocketOrderId,
        shiprocketShipmentId: ord.shiprocketShipmentId,
        shiprocketAwbCode: ord.shiprocketAwbCode,
        shiprocketCourierName: ord.shiprocketCourierName,
        shiprocketStatus: ord.shiprocketStatus,
        shiprocketTrackingUrl: ord.shiprocketAwbCode
          ? `https://shiprocket.co/tracking/${ord.shiprocketAwbCode}`
          : `/track-order?order=${encodeURIComponent(ord.orderNumber)}`,
      })),
    });
  } catch (error: unknown) {
    console.error("Error fetching user orders:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Please log in to link your mobile number." }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const rawPhone = (body.phone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      return NextResponse.json({ success: false, error: "Please provide a valid 10-digit mobile number." }, { status: 400 });
    }

    const p10 = rawPhone.slice(-10);
    const userEmail = session.user.email.toLowerCase().trim();

    // Link address entry with phone in User profile
    await User.findOneAndUpdate(
      { email: userEmail },
      {
        $addToSet: {
          addresses: {
            id: `link_${Date.now()}`,
            type: "Linked Mobile",
            name: session.user.name || "Customer",
            phone: p10,
            street: "Primary Account Mobile",
            city: "India",
            pincode: "000000",
          },
        },
      },
      { upsert: true }
    );

    // Sync all matching past orders with this user account
    if (session.user.id) {
      await Order.updateMany(
        {
          $or: [
            { userPhone: { $regex: p10 } },
            { "shippingAddress.phone": { $regex: p10 } },
          ],
        },
        { $set: { userId: session.user.id } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Mobile number ${p10} linked and order history synchronized!`,
    });
  } catch (error: unknown) {
    console.error("Error linking mobile to user profile:", error);
    const errMsg = error instanceof Error ? error.message : "Error linking mobile number";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
