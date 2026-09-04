import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to view your orders." },
        { status: 401 }
      );
    }

    await dbConnect();

    const userEmail = session.user.email.toLowerCase().trim();
    const userId = session.user.id;

    const query: Record<string, unknown> = {
      $or: [{ userEmail }, ...(userId ? [{ userId }] : [])],
    };

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
        total: ord.grandTotal,
        subtotal: ord.subtotal,
        gst: ord.gst,
        status: ord.paymentStatus === "paid" ? (ord.orderStatus || "Confirmed") : ord.paymentStatus,
        paymentStatus: ord.paymentStatus,
        items: (ord.items || []).map((item) => ({
          name: item.title,
          qty: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        razorpayPaymentId: ord.razorpayPaymentId,
      })),
    });
  } catch (error: unknown) {
    console.error("Error fetching user orders:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
