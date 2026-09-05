import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { createShiprocketOrder, trackShiprocketShipment } from "@/lib/shiprocket";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const query: Record<string, unknown> = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { shiprocketOrderId: { $regex: search, $options: "i" } },
        { shiprocketAwbCode: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        userName: o.userName,
        userEmail: o.userEmail,
        userPhone: o.userPhone,
        itemsCount: o.items?.length || 0,
        items: o.items,
        subtotal: o.subtotal,
        gst: o.gst,
        grandTotal: o.grandTotal,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        shippingAddress: o.shippingAddress,
        shiprocketOrderId: o.shiprocketOrderId,
        shiprocketShipmentId: o.shiprocketShipmentId,
        shiprocketAwbCode: o.shiprocketAwbCode,
        shiprocketCourierName: o.shiprocketCourierName,
        shiprocketStatus: o.shiprocketStatus,
        shiprocketTrackingUrl: o.shiprocketTrackingUrl,
        shipmentError: o.shipmentError,
        weight: o.weight,
        dimensions: o.dimensions,
      })),
    });
  } catch (error: unknown) {
    console.error("Admin orders fetch error:", error);
    const errMsg = error instanceof Error ? error.message : "Error fetching orders";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orderId, action, newStatus } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findOne({
      $or: [
        { orderNumber: orderId },
        ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
      ],
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Action 1: Retry Shiprocket shipment creation
    if (action === "retry_shiprocket") {
      const shiprocketResult = await createShiprocketOrder(order);

      if (shiprocketResult.success) {
        order.shiprocketOrderId = shiprocketResult.shiprocketOrderId || order.shiprocketOrderId;
        order.shiprocketShipmentId = shiprocketResult.shipmentId || order.shiprocketShipmentId;
        order.shiprocketAwbCode = shiprocketResult.awbCode || order.shiprocketAwbCode;
        order.shiprocketCourierName = shiprocketResult.courierName || order.shiprocketCourierName;
        order.shiprocketStatus = shiprocketResult.status || "CREATED";
        order.shiprocketTrackingUrl = shiprocketResult.trackingUrl || order.shiprocketTrackingUrl;
        order.shipmentError = "";
        order.orderStatus = "confirmed";
        await order.save();

        return NextResponse.json({
          success: true,
          message: "Shiprocket shipment created successfully!",
          data: order,
        });
      } else {
        order.shipmentError = shiprocketResult.error || "Shipment creation failed";
        await order.save();
        return NextResponse.json({
          success: false,
          error: shiprocketResult.error || "Failed to create Shiprocket order",
        }, { status: 400 });
      }
    }

    // Action 2: Sync tracking status from Shiprocket
    if (action === "sync_tracking") {
      if (!order.shiprocketAwbCode && !order.shiprocketShipmentId && !order.shiprocketOrderId) {
        return NextResponse.json({
          success: false,
          error: "Order has not been dispatched to Shiprocket yet.",
        }, { status: 400 });
      }

      const trackResult = await trackShiprocketShipment({
        awbCode: order.shiprocketAwbCode,
        shipmentId: order.shiprocketShipmentId,
        orderId: order.shiprocketOrderId,
      });

      if (trackResult.success && trackResult.currentStatus) {
        order.shiprocketStatus = trackResult.currentStatus;
        if (trackResult.trackingUrl) order.shiprocketTrackingUrl = trackResult.trackingUrl;
        if (trackResult.courierName) order.shiprocketCourierName = trackResult.courierName;
        if (trackResult.currentStatus.toLowerCase().includes("deliver")) {
          order.orderStatus = "delivered";
        } else if (trackResult.currentStatus.toLowerCase().includes("transit")) {
          order.orderStatus = "shipped";
        }
        await order.save();

        return NextResponse.json({
          success: true,
          message: `Shipment status updated: ${trackResult.currentStatus}`,
          trackResult,
          data: order,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: trackResult.error || "Could not retrieve tracking details.",
        }, { status: 400 });
      }
    }

    // Action 3: Update manual order status
    if (action === "update_status" && newStatus) {
      order.orderStatus = newStatus;
      await order.save();
      return NextResponse.json({ success: true, message: `Status changed to ${newStatus}`, data: order });
    }

    return NextResponse.json({ success: false, error: "Invalid action requested" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Admin order action error:", error);
    const errMsg = error instanceof Error ? error.message : "Error executing order action";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
